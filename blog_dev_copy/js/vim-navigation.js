// Vim Navigation System for Amfora-style browsing
// Implements vim motions and keyboard navigation with text-wrapping awareness

class VimNavigator {
  constructor() {
    this.links = [];
    this.contentElements = [];
    this.currentElementIndex = 0;
    this.currentCharOffset = 0; // Character offset within current element (or virtual line for non-text)
    this.targetColumn = 0; // Target column for j/k movement (vim-style)
    this.commandBuffer = '';
    this.lastKeyTime = 0;
    this.cursor = null;

    // Free-mode (Caps Lock) properties
    this.freeMode = false;
    this.freeCursorX = 0; // Pixel position for free-mode cursor
    this.freeCursorY = 0;
    this.gridSize = 12; // Base grid size in pixels
    this.largeStepMultiplier = 4; // Multiplier for u/i/o/p movement

    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.indexLinks();
      this.indexContentElements();
      this.createCursor();
      this.setupKeyboardListeners();
      setTimeout(() => this.updateCursorPosition(), 100);

      // Re-index content after dynamic loading (for content-loader.js)
      setTimeout(() => {
        this.indexContentElements();
        this.updateCursorPosition();
      }, 500);

      // Also re-index on window load to catch any late-loading content
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.indexContentElements();
          this.updateCursorPosition();
        }, 200);
      });
    });
  }

  indexLinks() {
    // Find all links in main-nav that are not buttons
    const navLinks = document.querySelectorAll('.main-nav a');

    this.links = Array.from(navLinks).map((link, index) => {
      const listItem = link.closest('li');
      if (listItem) {
        // Remove any existing emoji or number prefix
        const textContent = link.textContent.trim().replace(/^[🔗\[\]0-9]+\s*/, '');

        // Create number prefix span
        const prefix = document.createElement('span');
        prefix.className = 'link-number';
        prefix.textContent = `[${index + 1}] `;
        prefix.style.color = '#8E71AC';
        prefix.style.fontWeight = 'bold';

        // Clear the link and rebuild it
        link.textContent = textContent;
        link.insertBefore(prefix, link.firstChild);
      }

      return {
        element: link,
        href: link.href,
        index: index + 1
      };
    });
  }

  indexContentElements() {
    // Find ALL content elements inside .container, including navigation
    const container = document.querySelector('.container');
    if (!container) return;

    // Select all relevant content elements, now including main-nav
    const selector = `
      h2, h3, h4, h5, h6,
      p:not(.navigation-footer p):not(.top-bar p),
      .main-nav a,
      a:not(.home-button):not(.back-to-top):not(.link-number):not(.main-nav a),
      pre, code:not(pre code),
      img,
      video,
      iframe,
      blockquote,
      ul:not(.main-nav ul) li,
      ol li
    `;

    const elements = container.querySelectorAll(selector);

    this.contentElements = Array.from(elements)
      .filter(el => {
        // Exclude the main h1 title
        if (el.tagName === 'H1') return false;

        // Exclude elements in footer only
        if (el.closest('.navigation-footer') || el.closest('.top-bar')) {
          return false;
        }

        // Exclude link-number spans
        if (el.classList.contains('link-number')) return false;

        // For text elements, must have content
        if (['P', 'H2', 'H3', 'H4', 'H5', 'H6', 'A', 'LI', 'BLOCKQUOTE'].includes(el.tagName)) {
          return el.textContent.trim().length > 0;
        }

        // Non-text elements (img, video, iframe, pre, code) always included if visible
        return true;
      })
      .map(el => {
        const isNonText = ['IMG', 'VIDEO', 'IFRAME', 'PRE', 'CODE'].includes(el.tagName);

        return {
          element: el,
          isNonText: isNonText,
          virtualLines: isNonText ? this.calculateVirtualLines(el) : 0
        };
      });
  }

  calculateVirtualLines(element) {
    // Calculate how many "lines" a non-text element should occupy
    const rect = element.getBoundingClientRect();
    const height = rect.height;

    // Assume average line height of 24px
    const avgLineHeight = 24;
    const lines = Math.max(1, Math.ceil(height / avgLineHeight));

    return lines;
  }

  createCursor() {
    this.cursor = document.createElement('div');
    this.cursor.id = 'vim-cursor';
    this.cursor.style.cssText = `
      position: absolute;
      width: 10px;
      height: 20px;
      background-color: #8E71AC;
      pointer-events: none;
      z-index: 10000;
      animation: blink 1s step-end infinite;
      opacity: 0.8;
      transition: all 0.05s ease;
    `;

    // Add blinking animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes blink {
        0%, 50% { opacity: 0.8; }
        51%, 100% { opacity: 0; }
      }
      .link-number {
        user-select: none;
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(this.cursor);
  }

  getTextNodeAndOffset(element, charOffset) {
    // Get the text node and offset within that node for a given character offset
    let currentOffset = 0;
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while (node = walker.nextNode()) {
      const nodeLength = node.textContent.length;
      if (currentOffset + nodeLength >= charOffset) {
        return {
          node: node,
          offset: charOffset - currentOffset
        };
      }
      currentOffset += nodeLength;
    }

    // Fallback to end of element
    return {
      node: walker.currentNode || element,
      offset: 0
    };
  }

  getCursorRect() {
    // Get the visual position of the cursor using Range API
    if (this.contentElements.length === 0) return null;

    const currentItem = this.contentElements[this.currentElementIndex];
    if (!currentItem) return null;

    const currentElement = currentItem.element;

    // Handle non-text elements
    if (currentItem.isNonText) {
      const rect = currentElement.getBoundingClientRect();

      // Calculate position based on virtual line
      const lineHeight = rect.height / currentItem.virtualLines;
      const lineOffset = Math.min(this.currentCharOffset, currentItem.virtualLines - 1);

      return {
        left: rect.left,
        top: rect.top + (lineOffset * lineHeight),
        right: rect.right,
        bottom: rect.top + ((lineOffset + 1) * lineHeight),
        width: rect.width,
        height: lineHeight
      };
    }

    // Handle text elements
    const textLength = currentElement.textContent.length;
    const safeOffset = Math.min(this.currentCharOffset, textLength);

    try {
      const { node, offset } = this.getTextNodeAndOffset(currentElement, safeOffset);

      const range = document.createRange();
      range.setStart(node, offset);
      range.setEnd(node, offset);

      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        // Fallback to element position
        return currentElement.getBoundingClientRect();
      }

      return rect;
    } catch (e) {
      // Fallback to element position
      return currentElement.getBoundingClientRect();
    }
  }

  updateCursorPosition() {
    this.cursor.style.display = 'block';

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    if (this.freeMode) {
      // Free-mode: use pixel-based positioning with adaptive sizing
      const cursorSize = this.getAdaptiveCursorSize();
      this.cursor.style.height = `${cursorSize.height}px`;
      this.cursor.style.width = `${cursorSize.width}px`;
      this.cursor.style.left = `${this.freeCursorX + scrollLeft}px`;
      this.cursor.style.top = `${this.freeCursorY + scrollTop}px`;
      return;
    }

    // Normal mode: text-based positioning
    if (this.contentElements.length === 0) {
      this.cursor.style.display = 'none';
      return;
    }

    const currentItem = this.contentElements[this.currentElementIndex];
    if (!currentItem) return;

    const currentElement = currentItem.element;

    // Get computed style of the element to match font size
    const computedStyle = window.getComputedStyle(currentElement);
    const fontSize = parseFloat(computedStyle.fontSize);
    const lineHeight = parseFloat(computedStyle.lineHeight) || fontSize * 1.6;

    // Get cursor rect
    const rect = this.getCursorRect();
    if (!rect) return;

    // Update cursor size to match text
    this.cursor.style.height = `${rect.height || lineHeight}px`;
    this.cursor.style.width = `${fontSize * 0.5}px`;

    // Position cursor
    this.cursor.style.left = `${rect.left + scrollLeft}px`;
    this.cursor.style.top = `${rect.top + scrollTop}px`;
  }

  // Free-mode movement methods
  initializeFreeCursor() {
    // Initialize free cursor to current text cursor position or center of viewport
    if (this.contentElements.length > 0) {
      const rect = this.getCursorRect();
      if (rect) {
        this.freeCursorX = rect.left;
        this.freeCursorY = rect.top;
        return;
      }
    }

    // Fallback: center of viewport
    this.freeCursorX = window.innerWidth / 2;
    this.freeCursorY = window.innerHeight / 2;
  }

  moveFreeCursor(dx, dy) {
    this.freeCursorX += dx;
    this.freeCursorY += dy;

    // Clamp to document bounds using adaptive cursor size
    const cursorSize = this.getAdaptiveCursorSize();
    const maxX = Math.max(document.documentElement.scrollWidth, window.innerWidth);
    const maxY = Math.max(document.documentElement.scrollHeight, window.innerHeight);

    this.freeCursorX = Math.max(0, Math.min(this.freeCursorX, maxX - cursorSize.width));
    this.freeCursorY = Math.max(0, Math.min(this.freeCursorY, maxY - cursorSize.height));

    // Auto-scroll if cursor is near viewport edges
    const viewportRect = {
      left: window.pageXOffset,
      top: window.pageYOffset,
      right: window.pageXOffset + window.innerWidth,
      bottom: window.pageYOffset + window.innerHeight
    };

    const scrollMargin = 50;
    const adaptiveGrid = this.getAdaptiveGridSize();

    if (this.freeCursorX < viewportRect.left + scrollMargin) {
      window.scrollBy(-adaptiveGrid * 2, 0);
    } else if (this.freeCursorX > viewportRect.right - scrollMargin) {
      window.scrollBy(adaptiveGrid * 2, 0);
    }

    if (this.freeCursorY < viewportRect.top + scrollMargin) {
      window.scrollBy(0, -adaptiveGrid * 2);
    } else if (this.freeCursorY > viewportRect.bottom - scrollMargin) {
      window.scrollBy(0, adaptiveGrid * 2);
    }

    this.updateCursorPosition();
  }

  getElementAtFreeCursor() {
    // Find element at free cursor position
    return document.elementFromPoint(this.freeCursorX, this.freeCursorY);
  }

  getAdaptiveGridSize() {
    // Get grid size based on element under cursor
    const element = this.getElementAtFreeCursor();
    if (!element) return this.gridSize;

    const computedStyle = window.getComputedStyle(element);
    const fontSize = parseFloat(computedStyle.fontSize);

    // Use font size as grid size (typically 12-24px for most text)
    return fontSize || this.gridSize;
  }

  getAdaptiveCursorSize() {
    // Get cursor dimensions based on element under cursor
    const element = this.getElementAtFreeCursor();
    if (!element) {
      return { width: this.gridSize, height: this.gridSize };
    }

    const computedStyle = window.getComputedStyle(element);
    const fontSize = parseFloat(computedStyle.fontSize);
    const lineHeight = parseFloat(computedStyle.lineHeight);

    // If lineHeight is a ratio (like 1.5), calculate it from fontSize
    const actualLineHeight = isNaN(lineHeight) ? fontSize * 1.5 : lineHeight;

    return {
      width: fontSize * 0.6,  // Slightly narrower than a character
      height: actualLineHeight || fontSize * 1.5
    };
  }

  setupKeyboardListeners() {
    document.addEventListener('keydown', (e) => {
      // Don't intercept if user is in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Detect Caps Lock state
      const capsLockOn = e.getModifierState && e.getModifierState('CapsLock');

      // Toggle free-mode on Caps Lock state change
      if (capsLockOn !== this.freeMode) {
        this.freeMode = capsLockOn;
        if (this.freeMode) {
          this.initializeFreeCursor();
        }
        this.updateCursorPosition();
      }

      const now = Date.now();

      // Handle Enter key - click/follow element at cursor
      if (e.key === 'Enter') {
        e.preventDefault();
        if (this.freeMode) {
          const element = this.getElementAtFreeCursor();
          if (element) {
            if (element.tagName === 'A') {
              window.location.href = element.href;
            } else if (element.onclick || element.tagName === 'BUTTON' || element.tagName === 'VIDEO') {
              element.click();
            }
          }
        } else {
          this.clickAtCursor();
        }
        return;
      }

      // Handle number keys for link navigation (1-9)
      if (e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        this.followLink(parseInt(e.key));
        return;
      }

      // Handle 0 for link 10 (but not for vim 0 command)
      if (e.key === '0') {
        const timeSinceLastKey = now - this.lastKeyTime;
        if (timeSinceLastKey < 300) {
          e.preventDefault();
          this.followLink(10);
          return;
        }
        // Otherwise fall through to vim 0 command
      }

      // Handle 'z' for back to parent navigation
      if (e.key === 'z') {
        e.preventDefault();
        const backToParentButton = document.querySelector('.home-button[href*="Parent"], a.home-button:nth-of-type(2)');
        if (backToParentButton && backToParentButton.textContent.includes('Parent')) {
          window.location.href = backToParentButton.href;
        } else {
          console.log('No parent page available');
        }
        return;
      }

      // Vim motion: j (down)
      if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        if (this.freeMode) {
          const adaptiveGrid = this.getAdaptiveGridSize();
          this.moveFreeCursor(0, adaptiveGrid);
        } else {
          this.moveDown();
        }
        return;
      }

      // Vim motion: k (up)
      if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        if (this.freeMode) {
          const adaptiveGrid = this.getAdaptiveGridSize();
          this.moveFreeCursor(0, -adaptiveGrid);
        } else {
          this.moveUp();
        }
        return;
      }

      // Vim motion: h (left) - move cursor left
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        if (this.freeMode) {
          const adaptiveGrid = this.getAdaptiveGridSize();
          this.moveFreeCursor(-adaptiveGrid, 0);
        } else {
          this.moveLeft();
        }
        return;
      }

      // Vim motion: l (right) - move cursor right
      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        if (this.freeMode) {
          const adaptiveGrid = this.getAdaptiveGridSize();
          this.moveFreeCursor(adaptiveGrid, 0);
        } else {
          this.moveRight();
        }
        return;
      }

      // Free-mode large steps: u/i/o/p (only work in free-mode)
      // u=h (left), i=j (down), o=k (up), p=l (right)
      if (this.freeMode) {
        const adaptiveGrid = this.getAdaptiveGridSize();

        if (e.key === 'u' || e.key === 'U') {
          e.preventDefault();
          this.moveFreeCursor(-adaptiveGrid * this.largeStepMultiplier, 0);
          return;
        }

        if (e.key === 'i' || e.key === 'I') {
          e.preventDefault();
          this.moveFreeCursor(0, adaptiveGrid * this.largeStepMultiplier);
          return;
        }

        if (e.key === 'o' || e.key === 'O') {
          e.preventDefault();
          this.moveFreeCursor(0, -adaptiveGrid * this.largeStepMultiplier);
          return;
        }

        if (e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          this.moveFreeCursor(adaptiveGrid * this.largeStepMultiplier, 0);
          return;
        }
      }

      // Vim motion: gg (top of page)
      if (e.key === 'g') {
        if (now - this.lastKeyTime < 500 && this.commandBuffer === 'g') {
          e.preventDefault();
          if (this.freeMode) {
            this.freeCursorX = window.innerWidth / 2;
            this.freeCursorY = 50;
            window.scrollTo(0, 0);
          } else {
            this.currentElementIndex = 0;
            this.currentCharOffset = 0;
            window.scrollTo(0, 0);
          }
          this.updateCursorPosition();
          this.commandBuffer = '';
        } else {
          this.commandBuffer = 'g';
          this.lastKeyTime = now;
        }
        return;
      }

      // Vim motion: G (bottom of page)
      if (e.key === 'G') {
        e.preventDefault();
        if (this.freeMode) {
          this.freeCursorX = window.innerWidth / 2;
          this.freeCursorY = document.documentElement.scrollHeight - 50;
          window.scrollTo(0, document.body.scrollHeight);
        } else {
          this.currentElementIndex = Math.max(0, this.contentElements.length - 1);
          this.currentCharOffset = 0;
          window.scrollTo(0, document.body.scrollHeight);
        }
        this.updateCursorPosition();
        this.commandBuffer = '';
        return;
      }

      // Vim motion: { (previous paragraph) - only in normal mode
      if (e.key === '{' && !this.freeMode) {
        e.preventDefault();
        this.moveToPreviousParagraph();
        return;
      }

      // Vim motion: } (next paragraph) - only in normal mode
      if (e.key === '}' && !this.freeMode) {
        e.preventDefault();
        this.moveToNextParagraph();
        return;
      }

      // Vim motion: 0 (start of line) - only in normal mode
      if (e.key === '0' && this.commandBuffer === '' && !this.freeMode) {
        const timeSinceLastKey = now - this.lastKeyTime;
        if (timeSinceLastKey > 300) {
          e.preventDefault();
          this.moveToLineStart();
          return;
        }
      }

      // Vim motion: $ (end of line) - only in normal mode
      if (e.key === '$' && !this.freeMode) {
        e.preventDefault();
        this.moveToLineEnd();
        return;
      }

      // Vim motion: w (next word) - only in normal mode
      if (e.key === 'w' && !this.freeMode) {
        e.preventDefault();
        this.moveToNextWord();
        return;
      }

      // Vim motion: b (previous word) - only in normal mode
      if (e.key === 'b' && !this.freeMode) {
        e.preventDefault();
        this.moveToPreviousWord();
        return;
      }

      // Vim motion: e (end of word) - only in normal mode
      if (e.key === 'e' && !this.freeMode) {
        e.preventDefault();
        this.moveToWordEnd();
        return;
      }

      // Clear command buffer if other key pressed
      if (now - this.lastKeyTime > 500) {
        this.commandBuffer = '';
      }

      this.lastKeyTime = now;
    });

    // Update cursor position on scroll and resize
    window.addEventListener('scroll', () => this.updateCursorPosition());
    window.addEventListener('resize', () => this.updateCursorPosition());
  }

  clickAtCursor() {
    if (this.contentElements.length === 0) return;

    const currentItem = this.contentElements[this.currentElementIndex];
    if (!currentItem) return;

    const element = currentItem.element;

    // If it's a link, follow it
    if (element.tagName === 'A') {
      // Visual feedback
      element.style.backgroundColor = 'rgba(142, 113, 172, 0.3)';
      setTimeout(() => {
        element.style.backgroundColor = '';
      }, 150);

      // Navigate
      setTimeout(() => {
        if (element.href) {
          window.location.href = element.href;
        } else {
          element.click();
        }
      }, 100);
      return;
    }

    // Check if cursor is over a link within the current element
    const links = element.querySelectorAll('a');
    for (const link of links) {
      const rect = link.getBoundingClientRect();
      const cursorRect = this.getCursorRect();

      if (cursorRect &&
          cursorRect.left >= rect.left &&
          cursorRect.left <= rect.right &&
          cursorRect.top >= rect.top &&
          cursorRect.top <= rect.bottom) {
        // Visual feedback
        link.style.backgroundColor = 'rgba(142, 113, 172, 0.3)';
        setTimeout(() => {
          link.style.backgroundColor = '';
        }, 150);

        // Navigate
        setTimeout(() => {
          if (link.href) {
            window.location.href = link.href;
          } else {
            link.click();
          }
        }, 100);
        return;
      }
    }

    // For other clickable elements, trigger click
    if (element.onclick || element.tagName === 'BUTTON') {
      element.click();
    }
  }

  getCurrentLineRects() {
    // Get all character rects on the current visual line
    if (this.contentElements.length === 0) return [];

    const currentItem = this.contentElements[this.currentElementIndex];
    if (!currentItem || currentItem.isNonText) return [];

    const currentElement = currentItem.element;

    const currentRect = this.getCursorRect();
    if (!currentRect) return [];

    const currentY = currentRect.top;
    const tolerance = 5; // pixels

    // Find all character positions on the same visual line
    const textLength = currentElement.textContent.length;
    const lineRects = [];

    for (let i = 0; i < textLength; i++) {
      try {
        const { node, offset } = this.getTextNodeAndOffset(currentElement, i);
        const range = document.createRange();
        range.setStart(node, offset);
        range.setEnd(node, offset);
        const rect = range.getBoundingClientRect();

        if (Math.abs(rect.top - currentY) < tolerance) {
          lineRects.push({ offset: i, rect: rect });
        }
      } catch (e) {
        // Skip this character
      }
    }

    return lineRects;
  }

  moveLeft() {
    if (this.contentElements.length === 0) return;

    const currentItem = this.contentElements[this.currentElementIndex];

    // For non-text elements, just stay at the start
    if (currentItem.isNonText) {
      if (this.currentElementIndex > 0) {
        this.currentElementIndex--;
        const prevItem = this.contentElements[this.currentElementIndex];
        this.currentCharOffset = prevItem.isNonText ? 0 : prevItem.element.textContent.length - 1;
        this.scrollToCurrentElement();
      }
      this.targetColumn = this.currentCharOffset;
      this.updateCursorPosition();
      return;
    }

    if (this.currentCharOffset > 0) {
      this.currentCharOffset--;
      this.targetColumn = this.currentCharOffset;
      this.updateCursorPosition();
    } else if (this.currentElementIndex > 0) {
      // Move to end of previous element
      this.currentElementIndex--;
      const prevItem = this.contentElements[this.currentElementIndex];
      this.currentCharOffset = prevItem.isNonText ? 0 : prevItem.element.textContent.length - 1;
      this.targetColumn = this.currentCharOffset;
      this.scrollToCurrentElement();
      this.updateCursorPosition();
    }
  }

  moveRight() {
    if (this.contentElements.length === 0) return;

    const currentItem = this.contentElements[this.currentElementIndex];

    // For non-text elements, move to next element
    if (currentItem.isNonText) {
      if (this.currentElementIndex < this.contentElements.length - 1) {
        this.currentElementIndex++;
        this.currentCharOffset = 0;
        this.scrollToCurrentElement();
      }
      this.targetColumn = this.currentCharOffset;
      this.updateCursorPosition();
      return;
    }

    const currentElement = currentItem.element;
    const textLength = currentElement.textContent.length;

    if (this.currentCharOffset < textLength - 1) {
      this.currentCharOffset++;
      this.targetColumn = this.currentCharOffset;
      this.updateCursorPosition();
    } else if (this.currentElementIndex < this.contentElements.length - 1) {
      // Move to start of next element
      this.currentElementIndex++;
      this.currentCharOffset = 0;
      this.targetColumn = this.currentCharOffset;
      this.scrollToCurrentElement();
      this.updateCursorPosition();
    }
  }

  moveDown() {
    if (this.contentElements.length === 0) return;

    const currentItem = this.contentElements[this.currentElementIndex];

    // For non-text elements, move through virtual lines
    if (currentItem.isNonText) {
      if (this.currentCharOffset < currentItem.virtualLines - 1) {
        this.currentCharOffset++;
        this.updateCursorPosition();
      } else if (this.currentElementIndex < this.contentElements.length - 1) {
        // Move to next element
        this.currentElementIndex++;
        this.currentCharOffset = Math.min(this.targetColumn, 0);
        this.scrollToCurrentElement();
        this.updateCursorPosition();
      }
      return;
    }

    const currentRect = this.getCursorRect();
    if (!currentRect) return;

    const currentElement = currentItem.element;
    const textLength = currentElement.textContent.length;
    const currentY = currentRect.top;

    // Find the start of the next line
    let nextLineStart = -1;
    for (let i = this.currentCharOffset + 1; i < textLength; i++) {
      try {
        const { node, offset } = this.getTextNodeAndOffset(currentElement, i);
        const range = document.createRange();
        range.setStart(node, offset);
        range.setEnd(node, offset);
        const rect = range.getBoundingClientRect();

        if (rect.top > currentY + 5) {
          nextLineStart = i;
          break;
        }
      } catch (e) {
        // Skip
      }
    }

    if (nextLineStart !== -1) {
      // Move to target column on next line
      const targetOffset = Math.min(nextLineStart + this.targetColumn, textLength - 1);

      // Verify this offset is still on the same line as nextLineStart
      try {
        const { node: startNode } = this.getTextNodeAndOffset(currentElement, nextLineStart);
        const { node: targetNode, offset: targetNodeOffset } = this.getTextNodeAndOffset(currentElement, targetOffset);
        const startRange = document.createRange();
        startRange.setStart(startNode, 0);
        startRange.setEnd(startNode, 0);
        const targetRange = document.createRange();
        targetRange.setStart(targetNode, targetNodeOffset);
        targetRange.setEnd(targetNode, targetNodeOffset);

        const startRect = startRange.getBoundingClientRect();
        const targetRect = targetRange.getBoundingClientRect();

        if (Math.abs(startRect.top - targetRect.top) < 5) {
          this.currentCharOffset = targetOffset;
        } else {
          this.currentCharOffset = nextLineStart;
        }
      } catch (e) {
        this.currentCharOffset = nextLineStart;
      }

      this.updateCursorPosition();
    } else if (this.currentElementIndex < this.contentElements.length - 1) {
      // Move to next element
      this.currentElementIndex++;
      const nextItem = this.contentElements[this.currentElementIndex];
      if (nextItem.isNonText) {
        this.currentCharOffset = 0;
      } else {
        this.currentCharOffset = Math.min(this.targetColumn, nextItem.element.textContent.length - 1);
      }
      this.scrollToCurrentElement();
      this.updateCursorPosition();
    }
  }

  moveUp() {
    if (this.contentElements.length === 0) return;

    const currentItem = this.contentElements[this.currentElementIndex];

    // For non-text elements, move through virtual lines
    if (currentItem.isNonText) {
      if (this.currentCharOffset > 0) {
        this.currentCharOffset--;
        this.updateCursorPosition();
      } else if (this.currentElementIndex > 0) {
        // Move to previous element
        this.currentElementIndex--;
        const prevItem = this.contentElements[this.currentElementIndex];
        if (prevItem.isNonText) {
          this.currentCharOffset = prevItem.virtualLines - 1;
        } else {
          this.currentCharOffset = Math.min(this.targetColumn, prevItem.element.textContent.length - 1);
        }
        this.scrollToCurrentElement();
        this.updateCursorPosition();
      }
      return;
    }

    const currentRect = this.getCursorRect();
    if (!currentRect) return;

    const currentElement = currentItem.element;
    const textLength = currentElement.textContent.length;
    const currentY = currentRect.top;

    // Find the start of the current line to get line start position
    let currentLineStart = 0;
    for (let i = this.currentCharOffset - 1; i >= 0; i--) {
      try {
        const { node, offset } = this.getTextNodeAndOffset(currentElement, i);
        const range = document.createRange();
        range.setStart(node, offset);
        range.setEnd(node, offset);
        const rect = range.getBoundingClientRect();

        if (rect.top < currentY - 5) {
          currentLineStart = i + 1;
          break;
        }
      } catch (e) {
        // Skip
      }
    }

    // Calculate our column position on current line
    const columnOffset = this.currentCharOffset - currentLineStart;

    // Find previous line start
    let prevLineStart = -1;
    for (let i = currentLineStart - 1; i >= 0; i--) {
      try {
        const { node, offset } = this.getTextNodeAndOffset(currentElement, i);
        const range = document.createRange();
        range.setStart(node, offset);
        range.setEnd(node, offset);
        const rect = range.getBoundingClientRect();

        if (i === currentLineStart - 1 || rect.top < currentY - 5) {
          prevLineStart = i;
          // Find actual start of this line
          for (let j = i - 1; j >= 0; j--) {
            try {
              const { node: jNode, offset: jOffset } = this.getTextNodeAndOffset(currentElement, j);
              const jRange = document.createRange();
              jRange.setStart(jNode, jOffset);
              jRange.setEnd(jNode, jOffset);
              const jRect = jRange.getBoundingClientRect();

              if (Math.abs(jRect.top - rect.top) < 5) {
                prevLineStart = j;
              } else {
                break;
              }
            } catch (e) {
              break;
            }
          }
          break;
        }
      } catch (e) {
        // Skip
      }
    }

    if (prevLineStart !== -1) {
      // Move to target column on previous line
      const targetOffset = Math.min(prevLineStart + this.targetColumn, textLength - 1);
      this.currentCharOffset = targetOffset;
      this.updateCursorPosition();
    } else if (this.currentElementIndex > 0) {
      // Move to previous element
      this.currentElementIndex--;
      const prevItem = this.contentElements[this.currentElementIndex];
      if (prevItem.isNonText) {
        this.currentCharOffset = prevItem.virtualLines - 1;
      } else {
        this.currentCharOffset = Math.min(this.targetColumn, prevItem.element.textContent.length - 1);
      }
      this.scrollToCurrentElement();
      this.updateCursorPosition();
    }
  }

  moveToLineStart() {
    const currentItem = this.contentElements[this.currentElementIndex];

    if (currentItem.isNonText) {
      this.currentCharOffset = 0;
      this.targetColumn = 0;
      this.updateCursorPosition();
      return;
    }

    const lineRects = this.getCurrentLineRects();
    if (lineRects.length > 0) {
      this.currentCharOffset = lineRects[0].offset;
      this.targetColumn = 0;
      this.updateCursorPosition();
    }
  }

  moveToLineEnd() {
    const currentItem = this.contentElements[this.currentElementIndex];

    if (currentItem.isNonText) {
      // Stay at current position for non-text
      this.updateCursorPosition();
      return;
    }

    const lineRects = this.getCurrentLineRects();
    if (lineRects.length > 0) {
      this.currentCharOffset = lineRects[lineRects.length - 1].offset;
      this.targetColumn = this.currentCharOffset;
      this.updateCursorPosition();
    }
  }

  // Helper functions for vim-style word detection
  isWordChar(char) {
    return /[a-zA-Z0-9_]/.test(char);
  }

  isWhitespace(char) {
    return /\s/.test(char);
  }

  isPunctuation(char) {
    return !this.isWordChar(char) && !this.isWhitespace(char);
  }

  getCharType(char) {
    if (this.isWhitespace(char)) return 'space';
    if (this.isWordChar(char)) return 'word';
    return 'punct';
  }

  moveToNextWord() {
    if (this.contentElements.length === 0) return;

    const currentItem = this.contentElements[this.currentElementIndex];

    // For non-text, just move to next element
    if (currentItem.isNonText) {
      if (this.currentElementIndex < this.contentElements.length - 1) {
        this.currentElementIndex++;
        this.currentCharOffset = 0;
        this.targetColumn = 0;
        this.scrollToCurrentElement();
        this.updateCursorPosition();
      }
      return;
    }

    const currentElement = currentItem.element;
    const text = currentElement.textContent;
    let offset = this.currentCharOffset;

    // Skip to end of current word/punct sequence
    const startType = this.getCharType(text[offset]);
    if (startType !== 'space') {
      while (offset < text.length && this.getCharType(text[offset]) === startType) {
        offset++;
      }
    }

    // Skip whitespace
    while (offset < text.length && this.isWhitespace(text[offset])) {
      offset++;
    }

    if (offset < text.length) {
      this.currentCharOffset = offset;
      this.targetColumn = offset;
      this.updateCursorPosition();
    } else if (this.currentElementIndex < this.contentElements.length - 1) {
      this.currentElementIndex++;
      this.currentCharOffset = 0;
      this.targetColumn = 0;
      this.scrollToCurrentElement();
      this.updateCursorPosition();
    }
  }

  moveToPreviousWord() {
    if (this.contentElements.length === 0) return;

    const currentItem = this.contentElements[this.currentElementIndex];

    // For non-text, just move to previous element
    if (currentItem.isNonText) {
      if (this.currentElementIndex > 0) {
        this.currentElementIndex--;
        const prevItem = this.contentElements[this.currentElementIndex];
        this.currentCharOffset = prevItem.isNonText ? 0 : Math.max(0, prevItem.element.textContent.length - 1);
        this.targetColumn = this.currentCharOffset;
        this.scrollToCurrentElement();
        this.updateCursorPosition();
      }
      return;
    }

    const currentElement = currentItem.element;
    const text = currentElement.textContent;

    // If at start of element, go to previous element
    if (this.currentCharOffset === 0) {
      if (this.currentElementIndex > 0) {
        this.currentElementIndex--;
        const prevItem = this.contentElements[this.currentElementIndex];
        this.currentCharOffset = prevItem.isNonText ? 0 : Math.max(0, prevItem.element.textContent.length - 1);
        this.targetColumn = this.currentCharOffset;
        this.scrollToCurrentElement();
        this.updateCursorPosition();
      }
      return;
    }

    let offset = this.currentCharOffset - 1;

    // Skip backwards over whitespace
    while (offset >= 0 && this.isWhitespace(text[offset])) {
      offset--;
    }

    if (offset < 0) {
      this.currentCharOffset = 0;
      this.targetColumn = 0;
      this.updateCursorPosition();
      return;
    }

    // Now we're on a non-space character, find start of this word/punct sequence
    const charType = this.getCharType(text[offset]);
    while (offset > 0 && this.getCharType(text[offset - 1]) === charType) {
      offset--;
    }

    this.currentCharOffset = Math.max(0, offset);
    this.targetColumn = this.currentCharOffset;
    this.updateCursorPosition();
  }

  moveToWordEnd() {
    if (this.contentElements.length === 0) return;

    const currentItem = this.contentElements[this.currentElementIndex];

    // For non-text, just move to next element
    if (currentItem.isNonText) {
      if (this.currentElementIndex < this.contentElements.length - 1) {
        this.currentElementIndex++;
        this.currentCharOffset = 0;
        this.targetColumn = 0;
        this.scrollToCurrentElement();
        this.updateCursorPosition();
      }
      return;
    }

    const currentElement = currentItem.element;
    const text = currentElement.textContent;
    let offset = this.currentCharOffset;

    // If we're at the last character, move forward
    if (offset >= text.length - 1) {
      // Move to next element
      if (this.currentElementIndex < this.contentElements.length - 1) {
        this.currentElementIndex++;
        const nextItem = this.contentElements[this.currentElementIndex];
        if (nextItem.isNonText) {
          this.currentCharOffset = 0;
          this.targetColumn = 0;
        } else {
          const nextText = nextItem.element.textContent;
          let nextOffset = 0;
          // Skip leading spaces
          while (nextOffset < nextText.length && this.isWhitespace(nextText[nextOffset])) {
            nextOffset++;
          }
          // Find first word/punct end
          if (nextOffset < nextText.length) {
            const charType = this.getCharType(nextText[nextOffset]);
            while (nextOffset < nextText.length && this.getCharType(nextText[nextOffset]) === charType) {
              nextOffset++;
            }
            this.currentCharOffset = Math.max(0, nextOffset - 1);
          } else {
            this.currentCharOffset = 0;
          }
          this.targetColumn = this.currentCharOffset;
        }
        this.scrollToCurrentElement();
        this.updateCursorPosition();
      }
      return;
    }

    const currentType = this.getCharType(text[offset]);

    // If on whitespace, skip to next word/punct and find its end
    if (currentType === 'space') {
      // Skip whitespace
      while (offset < text.length && this.isWhitespace(text[offset])) {
        offset++;
      }
      if (offset >= text.length) {
        // Reached end, try next element
        if (this.currentElementIndex < this.contentElements.length - 1) {
          this.currentElementIndex++;
          this.currentCharOffset = 0;
          this.targetColumn = 0;
          this.scrollToCurrentElement();
          this.updateCursorPosition();
        }
        return;
      }
      // Now find end of this word/punct
      const newType = this.getCharType(text[offset]);
      while (offset < text.length && this.getCharType(text[offset]) === newType) {
        offset++;
      }
      offset--; // Back to last char of word/punct
    } else {
      // On word or punct - check if we need to move forward first
      // Vim's 'e' moves to end of current word if at start/middle, or next word if at end

      // Check if we're at the end of current word/punct sequence
      if (offset + 1 < text.length && this.getCharType(text[offset + 1]) !== currentType) {
        // We're at the end of a word/punct, move to next
        offset++;
        // Skip whitespace
        while (offset < text.length && this.isWhitespace(text[offset])) {
          offset++;
        }
        if (offset >= text.length) {
          // Try next element
          if (this.currentElementIndex < this.contentElements.length - 1) {
            this.currentElementIndex++;
            this.currentCharOffset = 0;
            this.targetColumn = 0;
            this.scrollToCurrentElement();
            this.updateCursorPosition();
          }
          return;
        }
        // Find end of next word/punct
        const newType = this.getCharType(text[offset]);
        while (offset < text.length && this.getCharType(text[offset]) === newType) {
          offset++;
        }
        offset--;
      } else {
        // We're in middle of word/punct, find its end
        while (offset < text.length && this.getCharType(text[offset]) === currentType) {
          offset++;
        }
        offset--;
      }
    }

    if (offset >= 0 && offset < text.length && offset > this.currentCharOffset) {
      this.currentCharOffset = offset;
      this.targetColumn = offset;
      this.updateCursorPosition();
    }
  }

  moveToPreviousParagraph() {
    if (this.currentElementIndex > 0) {
      this.currentElementIndex--;
      this.currentCharOffset = 0;
      this.scrollToCurrentElement();
      this.updateCursorPosition();
    }
  }

  moveToNextParagraph() {
    if (this.currentElementIndex < this.contentElements.length - 1) {
      this.currentElementIndex++;
      this.currentCharOffset = 0;
      this.scrollToCurrentElement();
      this.updateCursorPosition();
    }
  }

  scrollToCurrentElement() {
    const item = this.contentElements[this.currentElementIndex];
    if (item && item.element) {
      item.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  followLink(number) {
    const link = this.links.find(l => l.index === number);
    if (link) {
      // Visual feedback
      link.element.style.backgroundColor = 'rgba(142, 113, 172, 0.3)';
      setTimeout(() => {
        link.element.style.backgroundColor = '';
      }, 150);

      // Navigate
      setTimeout(() => {
        window.location.href = link.href;
      }, 100);
    }
  }
}

// Initialize the vim navigator
const vimNav = new VimNavigator();
