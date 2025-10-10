// Safari Vim Navigator - Universal Web Extension
// Vim-style navigation for any webpage with free-mode cursor

class SafariVimNavigator {
  constructor() {
    this.contentElements = [];
    this.currentElementIndex = 0;
    this.currentCharOffset = 0;
    this.targetColumn = 0;
    this.commandBuffer = '';
    this.lastKeyTime = 0;
    this.cursor = null;
    this.enabled = true;

    // Free-mode (Caps Lock) properties
    this.freeMode = false;
    this.freeCursorX = 0;
    this.freeCursorY = 0;
    this.gridSize = 12;
    this.largeStepMultiplier = 4;

    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.indexContentElements();
    this.createCursor();
    this.setupKeyboardListeners();
    setTimeout(() => this.updateCursorPosition(), 100);

    // Re-index after dynamic content loads
    setTimeout(() => {
      this.indexContentElements();
      this.updateCursorPosition();
    }, 500);

    window.addEventListener('load', () => {
      setTimeout(() => {
        this.indexContentElements();
        this.updateCursorPosition();
      }, 200);
    });
  }

  indexContentElements() {
    // Universal content selector for any webpage
    const selector = `
      h1, h2, h3, h4, h5, h6,
      p, a, span,
      pre, code,
      img, video, iframe,
      blockquote, li,
      button, input[type="submit"], input[type="button"]
    `;

    const elements = document.querySelectorAll(selector);

    this.contentElements = Array.from(elements)
      .filter(el => {
        // Skip hidden elements
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') {
          return false;
        }

        // For text elements, must have content
        if (['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'A', 'SPAN', 'LI', 'BLOCKQUOTE', 'BUTTON'].includes(el.tagName)) {
          return el.textContent.trim().length > 0;
        }

        // Non-text elements always included if visible
        return true;
      })
      .map(el => {
        const isNonText = ['IMG', 'VIDEO', 'IFRAME', 'PRE', 'CODE', 'INPUT'].includes(el.tagName);

        return {
          element: el,
          isNonText: isNonText,
          virtualLines: isNonText ? this.calculateVirtualLines(el) : 0
        };
      });
  }

  calculateVirtualLines(element) {
    const rect = element.getBoundingClientRect();
    const height = rect.height;
    const avgLineHeight = 24;
    return Math.max(1, Math.ceil(height / avgLineHeight));
  }

  createCursor() {
    this.cursor = document.createElement('div');
    this.cursor.id = 'safari-vim-cursor';
    this.cursor.className = 'safari-vim-cursor';
    document.body.appendChild(this.cursor);
  }

  getTextNodeAndOffset(element, charOffset) {
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

    return {
      node: walker.currentNode || element,
      offset: 0
    };
  }

  getCursorRect() {
    if (this.contentElements.length === 0) return null;

    const currentItem = this.contentElements[this.currentElementIndex];
    if (!currentItem) return null;

    const currentElement = currentItem.element;

    if (currentItem.isNonText) {
      const rect = currentElement.getBoundingClientRect();
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

    const textLength = currentElement.textContent.length;
    const safeOffset = Math.min(this.currentCharOffset, textLength);

    try {
      const { node, offset } = this.getTextNodeAndOffset(currentElement, safeOffset);
      const range = document.createRange();
      range.setStart(node, offset);
      range.setEnd(node, offset);
      const rect = range.getBoundingClientRect();

      if (rect.width === 0 && rect.height === 0) {
        return currentElement.getBoundingClientRect();
      }

      return rect;
    } catch (e) {
      return currentElement.getBoundingClientRect();
    }
  }

  updateCursorPosition() {
    if (!this.cursor || !this.enabled) return;

    this.cursor.style.display = 'block';

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    if (this.freeMode) {
      const cursorSize = this.getAdaptiveCursorSize();
      this.cursor.style.height = `${cursorSize.height}px`;
      this.cursor.style.width = `${cursorSize.width}px`;
      this.cursor.style.left = `${this.freeCursorX + scrollLeft}px`;
      this.cursor.style.top = `${this.freeCursorY + scrollTop}px`;
      return;
    }

    if (this.contentElements.length === 0) {
      this.cursor.style.display = 'none';
      return;
    }

    const currentItem = this.contentElements[this.currentElementIndex];
    if (!currentItem) return;

    const currentElement = currentItem.element;
    const computedStyle = window.getComputedStyle(currentElement);
    const fontSize = parseFloat(computedStyle.fontSize);
    const lineHeight = parseFloat(computedStyle.lineHeight) || fontSize * 1.6;

    const rect = this.getCursorRect();
    if (!rect) return;

    this.cursor.style.height = `${rect.height || lineHeight}px`;
    this.cursor.style.width = `${fontSize * 0.5}px`;
    this.cursor.style.left = `${rect.left + scrollLeft}px`;
    this.cursor.style.top = `${rect.top + scrollTop}px`;
  }

  initializeFreeCursor() {
    if (this.contentElements.length > 0) {
      const rect = this.getCursorRect();
      if (rect) {
        this.freeCursorX = rect.left;
        this.freeCursorY = rect.top;
        return;
      }
    }

    this.freeCursorX = window.innerWidth / 2;
    this.freeCursorY = window.innerHeight / 2;
  }

  moveFreeCursor(dx, dy) {
    this.freeCursorX += dx;
    this.freeCursorY += dy;

    const cursorSize = this.getAdaptiveCursorSize();
    const maxX = Math.max(document.documentElement.scrollWidth, window.innerWidth);
    const maxY = Math.max(document.documentElement.scrollHeight, window.innerHeight);

    this.freeCursorX = Math.max(0, Math.min(this.freeCursorX, maxX - cursorSize.width));
    this.freeCursorY = Math.max(0, Math.min(this.freeCursorY, maxY - cursorSize.height));

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
    return document.elementFromPoint(this.freeCursorX, this.freeCursorY);
  }

  getAdaptiveGridSize() {
    const element = this.getElementAtFreeCursor();
    if (!element) return this.gridSize;

    const computedStyle = window.getComputedStyle(element);
    const fontSize = parseFloat(computedStyle.fontSize);

    return fontSize || this.gridSize;
  }

  getAdaptiveCursorSize() {
    const element = this.getElementAtFreeCursor();
    if (!element) {
      return { width: this.gridSize, height: this.gridSize };
    }

    const computedStyle = window.getComputedStyle(element);
    const fontSize = parseFloat(computedStyle.fontSize);
    const lineHeight = parseFloat(computedStyle.lineHeight);
    const actualLineHeight = isNaN(lineHeight) ? fontSize * 1.5 : lineHeight;

    return {
      width: fontSize * 0.6,
      height: actualLineHeight || fontSize * 1.5
    };
  }

  setupKeyboardListeners() {
    document.addEventListener('keydown', (e) => {
      if (!this.enabled) return;

      // Don't intercept if user is in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }

      const capsLockOn = e.getModifierState && e.getModifierState('CapsLock');

      if (capsLockOn !== this.freeMode) {
        this.freeMode = capsLockOn;
        if (this.freeMode) {
          this.initializeFreeCursor();
        }
        this.updateCursorPosition();
      }

      const now = Date.now();

      // Enter key - click at cursor
      if (e.key === 'Enter') {
        e.preventDefault();
        if (this.freeMode) {
          const element = this.getElementAtFreeCursor();
          if (element) {
            element.click();
          }
        } else {
          this.clickAtCursor();
        }
        return;
      }

      // Vim motions
      if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        if (this.freeMode) {
          this.moveFreeCursor(0, this.getAdaptiveGridSize());
        } else {
          this.moveDown();
        }
        return;
      }

      if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        if (this.freeMode) {
          this.moveFreeCursor(0, -this.getAdaptiveGridSize());
        } else {
          this.moveUp();
        }
        return;
      }

      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        if (this.freeMode) {
          this.moveFreeCursor(-this.getAdaptiveGridSize(), 0);
        } else {
          this.moveLeft();
        }
        return;
      }

      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        if (this.freeMode) {
          this.moveFreeCursor(this.getAdaptiveGridSize(), 0);
        } else {
          this.moveRight();
        }
        return;
      }

      // Free-mode large steps
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

      // gg/G
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

      // Paragraph navigation - normal mode only
      if (e.key === '{' && !this.freeMode) {
        e.preventDefault();
        this.moveToPreviousParagraph();
        return;
      }

      if (e.key === '}' && !this.freeMode) {
        e.preventDefault();
        this.moveToNextParagraph();
        return;
      }

      // Line navigation - normal mode only
      if (e.key === '0' && !this.freeMode) {
        e.preventDefault();
        this.moveToLineStart();
        return;
      }

      if (e.key === '$' && !this.freeMode) {
        e.preventDefault();
        this.moveToLineEnd();
        return;
      }

      // Word navigation - normal mode only
      if (e.key === 'w' && !this.freeMode) {
        e.preventDefault();
        this.moveToNextWord();
        return;
      }

      if (e.key === 'b' && !this.freeMode) {
        e.preventDefault();
        this.moveToPreviousWord();
        return;
      }

      if (e.key === 'e' && !this.freeMode) {
        e.preventDefault();
        this.moveToWordEnd();
        return;
      }

      if (now - this.lastKeyTime > 500) {
        this.commandBuffer = '';
      }

      this.lastKeyTime = now;
    });

    window.addEventListener('scroll', () => this.updateCursorPosition());
    window.addEventListener('resize', () => this.updateCursorPosition());
  }

  clickAtCursor() {
    if (this.contentElements.length === 0) return;

    const currentItem = this.contentElements[this.currentElementIndex];
    if (!currentItem) return;

    const element = currentItem.element;
    element.click();
  }

  // Helper functions for vim-style word detection
  isWordChar(char) {
    return /[a-zA-Z0-9_]/.test(char);
  }

  isWhitespace(char) {
    return /\s/.test(char);
  }

  getCharType(char) {
    if (this.isWhitespace(char)) return 'space';
    if (this.isWordChar(char)) return 'word';
    return 'punct';
  }

  getCurrentLineRects() {
    if (this.contentElements.length === 0) return [];

    const currentItem = this.contentElements[this.currentElementIndex];
    if (!currentItem || currentItem.isNonText) return [];

    const currentElement = currentItem.element;
    const currentRect = this.getCursorRect();
    if (!currentRect) return [];

    const currentY = currentRect.top;
    const tolerance = 5;
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
        // Skip
      }
    }

    return lineRects;
  }

  // Movement methods (abbreviated for space - include all from original)
  moveLeft() {
    if (this.contentElements.length === 0) return;

    const currentItem = this.contentElements[this.currentElementIndex];

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

    if (currentItem.isNonText) {
      if (this.currentCharOffset < currentItem.virtualLines - 1) {
        this.currentCharOffset++;
        this.updateCursorPosition();
      } else if (this.currentElementIndex < this.contentElements.length - 1) {
        this.currentElementIndex++;
        this.currentCharOffset = Math.min(this.targetColumn, 0);
        this.scrollToCurrentElement();
        this.updateCursorPosition();
      }
      return;
    }

    if (this.currentElementIndex < this.contentElements.length - 1) {
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

    if (currentItem.isNonText) {
      if (this.currentCharOffset > 0) {
        this.currentCharOffset--;
        this.updateCursorPosition();
      } else if (this.currentElementIndex > 0) {
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

    if (this.currentElementIndex > 0) {
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

    if (currentItem && currentItem.isNonText) {
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

    if (currentItem && currentItem.isNonText) {
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

  moveToNextWord() {
    if (this.contentElements.length === 0) return;

    const currentItem = this.contentElements[this.currentElementIndex];

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

    const startType = this.getCharType(text[offset]);
    if (startType !== 'space') {
      while (offset < text.length && this.getCharType(text[offset]) === startType) {
        offset++;
      }
    }

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

    while (offset >= 0 && this.isWhitespace(text[offset])) {
      offset--;
    }

    if (offset < 0) {
      this.currentCharOffset = 0;
      this.targetColumn = 0;
      this.updateCursorPosition();
      return;
    }

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

    if (offset >= text.length - 1) {
      if (this.currentElementIndex < this.contentElements.length - 1) {
        this.currentElementIndex++;
        const nextItem = this.contentElements[this.currentElementIndex];
        if (nextItem.isNonText) {
          this.currentCharOffset = 0;
          this.targetColumn = 0;
        } else {
          const nextText = nextItem.element.textContent;
          let nextOffset = 0;
          while (nextOffset < nextText.length && this.isWhitespace(nextText[nextOffset])) {
            nextOffset++;
          }
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

    if (currentType === 'space') {
      while (offset < text.length && this.isWhitespace(text[offset])) {
        offset++;
      }
      if (offset >= text.length) {
        if (this.currentElementIndex < this.contentElements.length - 1) {
          this.currentElementIndex++;
          this.currentCharOffset = 0;
          this.targetColumn = 0;
          this.scrollToCurrentElement();
          this.updateCursorPosition();
        }
        return;
      }
      const newType = this.getCharType(text[offset]);
      while (offset < text.length && this.getCharType(text[offset]) === newType) {
        offset++;
      }
      offset--;
    } else {
      if (offset + 1 < text.length && this.getCharType(text[offset + 1]) !== currentType) {
        offset++;
        while (offset < text.length && this.isWhitespace(text[offset])) {
          offset++;
        }
        if (offset >= text.length) {
          if (this.currentElementIndex < this.contentElements.length - 1) {
            this.currentElementIndex++;
            this.currentCharOffset = 0;
            this.targetColumn = 0;
            this.scrollToCurrentElement();
            this.updateCursorPosition();
          }
          return;
        }
        const newType = this.getCharType(text[offset]);
        while (offset < text.length && this.getCharType(text[offset]) === newType) {
          offset++;
        }
        offset--;
      } else {
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
}

// Initialize
const safariVimNavigator = new SafariVimNavigator();
