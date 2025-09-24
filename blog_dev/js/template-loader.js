class TemplateLoader {
  constructor() {
    this.templateCache = new Map();
    this.baseTemplate = null;
  }

  async loadTemplate(templatePath = 'templates/base.html') {
    if (this.templateCache.has(templatePath)) {
      return this.templateCache.get(templatePath);
    }

    try {
      const response = await fetch(templatePath);
      if (!response.ok) {
        throw new Error(`Failed to load template: ${response.status}`);
      }

      const template = await response.text();
      this.templateCache.set(templatePath, template);
      return template;
    } catch (error) {
      console.error('Template loading error:', error);
      return null;
    }
  }

  async renderPage(config) {
    if (!this.baseTemplate) {
      this.baseTemplate = await this.loadTemplate();
      if (!this.baseTemplate) {
        console.error('Failed to load base template');
        return;
      }
    }

    // Replace template variables
    let html = this.baseTemplate
      .replace(/\{\{PAGE_TITLE\}\}/g, config.pageTitle || 'Untitled')
      .replace(/\{\{CSS_PATH\}\}/g, config.cssPath || 'css/styles.css')
      .replace(/\{\{STARS_PATH\}\}/g, config.starsPath || 'js/stars.js')
      .replace(/\{\{CONTENT_LOADER_PATH\}\}/g, config.contentLoaderPath || 'content-loader-example.js')
      .replace(/\{\{TOC_SCROLL_PATH\}\}/g, config.tocScrollPath || 'js/toc-scroll.js')
      .replace(/\{\{BREADCRUMB\}\}/g, config.breadcrumb || '')
      .replace(/\{\{TITLE_HOOK\}\}/g, config.titleHook || 'page-title')
      .replace(/\{\{PAGE_TYPE\}\}/g, config.pageType || 'default')
      .replace(/\{\{TOP_BANNER\}\}/g, config.topBanner || '')
      .replace(/\{\{MAIN_CONTENT\}\}/g, config.mainContent || '')
      .replace(/\{\{FOOTER_NAV\}\}/g, config.footerNav || '');

    // Replace document content
    document.open();
    document.write(html);
    document.close();

    // Re-initialize content loader and other scripts
    if (window.contentLoader) {
      window.contentLoader.loadAllContentHooks();
    }
  }

  // Helper method to calculate relative paths
  getRelativePath(currentPath, targetPath) {
    const currentDepth = (currentPath.match(/\//g) || []).length;
    const prefix = '../'.repeat(Math.max(0, currentDepth - 1));
    return prefix + targetPath;
  }

  // Generate page config based on current location
  generatePageConfig(pageData) {
    const currentPath = window.location.pathname;
    const depth = (currentPath.match(/\//g) || []).length - 1;
    const prefix = '../'.repeat(Math.max(0, depth));

    return {
      pageTitle: pageData.title,
      cssPath: prefix + 'css/styles.css',
      starsPath: prefix + 'js/stars.js',
      contentLoaderPath: prefix + 'content-loader-example.js',
      tocScrollPath: prefix + 'js/toc-scroll.js',
      titleHook: pageData.titleHook || 'page-title',
      pageType: pageData.pageType || 'default',
      breadcrumb: pageData.breadcrumb || '',
      topBanner: pageData.topBanner || '',
      mainContent: pageData.mainContent || '',
      footerNav: pageData.footerNav || ''
    };
  }
}

// Global template loader instance
window.templateLoader = new TemplateLoader();