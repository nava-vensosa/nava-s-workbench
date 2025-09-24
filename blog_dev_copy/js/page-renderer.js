class PageRenderer {
  constructor() {
    this.baseHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{TITLE} - Nachsterbinn</title>
  <link href="https://fonts.googleapis.com/css2?family=Silkscreen&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{CSS_PATH}">
</head>
<body>
  <canvas id="stars"></canvas>
  <script defer src="{STARS_PATH}"></script>
  <script defer src="{CONTENT_LOADER_PATH}"></script>
  <script defer src="{TOC_SCROLL_PATH}"></script>

  <div class="red-stripe"></div>

  <header>
    <img src="https://preview.redd.it/ioc8m5hgpeb51.png?width=1080&crop=smart&auto=webp&s=5aeb2be2c9daf93493cc798a4dc5b239a715bc73" alt="Stardust Dragon Banner">
  </header>

  <div class="container">
    {BREADCRUMB}

    <h1 data-content-hook="{TITLE_HOOK}" data-page="{PAGE_TYPE}">{TITLE}</h1>

    {TOP_BANNER}

    <hr class="divider">

    {MAIN_CONTENT}

    <hr class="divider">

    {FOOTER_NAV}
  </div>
</body>
</html>`;
  }

  render(config) {
    const pathDepth = (window.location.pathname.match(/\//g) || []).length - 1;
    const prefix = '../'.repeat(Math.max(0, pathDepth));

    const html = this.baseHTML
      .replace(/\{TITLE\}/g, config.title || 'Untitled')
      .replace(/\{CSS_PATH\}/g, config.cssPath || prefix + 'css/styles.css')
      .replace(/\{STARS_PATH\}/g, config.starsPath || prefix + 'js/stars.js')
      .replace(/\{CONTENT_LOADER_PATH\}/g, config.contentLoaderPath || prefix + 'content-loader-example.js')
      .replace(/\{TOC_SCROLL_PATH\}/g, config.tocScrollPath || prefix + 'js/toc-scroll.js')
      .replace(/\{BREADCRUMB\}/g, config.breadcrumb || '')
      .replace(/\{TITLE_HOOK\}/g, config.titleHook || 'page-title')
      .replace(/\{PAGE_TYPE\}/g, config.pageType || 'default')
      .replace(/\{TOP_BANNER\}/g, config.topBanner || '')
      .replace(/\{MAIN_CONTENT\}/g, config.mainContent || '')
      .replace(/\{FOOTER_NAV\}/g, config.footerNav || '');

    document.open();
    document.write(html);
    document.close();

    // Reinitialize content hooks
    if (window.contentLoader) {
      setTimeout(() => window.contentLoader.loadAllContentHooks(), 100);
    }
  }
}

window.pageRenderer = new PageRenderer();