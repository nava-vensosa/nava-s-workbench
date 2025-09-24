class ParagraphContentLoader {
  constructor() {
    this.cache = new Map();
    this.defaultContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.loadAllContentHooks();
    });
  }

  loadAllContentHooks() {
    const contentHooks = document.querySelectorAll('[data-content-hook]');
    contentHooks.forEach(hook => {
      this.loadContentHook(hook);
    });
  }

  async loadContentHook(element) {
    const hookPath = element.getAttribute('data-content-hook');
    const page = element.getAttribute('data-page') || this.detectPageFromURL();

    console.log('Loading content hook:', { hookPath, page, element });

    if (!hookPath || !page) {
      console.warn('Missing data-content-hook or data-page attribute', element);
      return;
    }

    element.classList.add('loading');

    try {
      const content = await this.fetchContent(page, hookPath);
      element.innerHTML = this.processContent(content);
      element.classList.remove('loading');
      console.log('Successfully loaded content for:', hookPath);
    } catch (error) {
      console.error(`Failed to load content for ${hookPath}:`, error);
      element.innerHTML = this.defaultContent;
      element.classList.remove('loading');
      element.classList.add('content-error');
    }
  }

  async fetchContent(page, hookPath) {
    const cacheKey = `${page}/${hookPath}`;

    if (this.cache.has(cacheKey)) {
      console.log('Using cached content for:', cacheKey);
      return this.cache.get(cacheKey);
    }

    const filePath = `${hookPath}.txt`;
    console.log('Fetching content from:', filePath);

    try {
      const response = await fetch(filePath);
      console.log('Fetch response:', { status: response.status, ok: response.ok, url: response.url });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('File not found, using default content:', filePath);
          return this.defaultContent;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const content = await response.text();
      console.log('Successfully fetched content:', content.substring(0, 50) + '...');
      this.cache.set(cacheKey, content);
      return content;
    } catch (error) {
      console.error('Fetch error:', error);
      return this.defaultContent;
    }
  }

  processContent(content) {
    if (!content || content.trim() === '') {
      return this.defaultContent;
    }

    return content
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
      .join('');
  }

  detectPageFromURL() {
    const path = window.location.pathname;
    if (path.includes('itp_gallery') || path.includes('itp/')) return 'itp-gallery';
    if (path.includes('nachsterb_inn')) return 'nachsterb-inn';
    if (path.includes('critical_clockwerkshop')) return 'critical-clockwerkshop';
    if (path.includes('index.html') || path === '/') return 'homepage';
    return null;
  }

  async loadSpecificContent(page, hookPath, targetElementId) {
    const element = document.getElementById(targetElementId);
    if (!element) {
      console.error(`Element with id ${targetElementId} not found`);
      return;
    }

    element.setAttribute('data-content-hook', hookPath);
    element.setAttribute('data-page', page);
    await this.loadContentHook(element);
  }

  clearCache() {
    this.cache.clear();
  }

  setDefaultContent(content) {
    this.defaultContent = content;
  }
}

const contentLoader = new ParagraphContentLoader();

function loadParagraphContent(page, hookPath, targetElementId) {
  return contentLoader.loadSpecificContent(page, hookPath, targetElementId);
}