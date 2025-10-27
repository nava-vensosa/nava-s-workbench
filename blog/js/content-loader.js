// Content Loader System
// Loads content from text files into elements with data-content-hook attributes

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Content Loader: DOMContentLoaded event fired');
  const contentHooks = document.querySelectorAll('[data-content-hook]');
  console.log(`Content Loader: Found ${contentHooks.length} content hooks`);

  for (const element of contentHooks) {
    const hookName = element.getAttribute('data-content-hook');
    const contentPath = element.getAttribute('data-content-path');
    const contentType = element.getAttribute('data-content-type') || 'text';

    console.log(`Content Loader: Processing hook "${hookName}" with path "${contentPath}" and type "${contentType}"`);

    if (!contentPath) {
      console.warn(`No content path specified for hook: ${hookName}`);
      continue;
    }

    try {
      console.log(`Content Loader: Fetching ${contentPath}...`);
      const response = await fetch(contentPath);
      console.log(`Content Loader: Response status: ${response.status}`);
      if (!response.ok) {
        console.warn(`Failed to load content for ${hookName} from ${contentPath}`);
        element.textContent = '';
        continue;
      }

      const content = await response.text();
      console.log(`Content Loader: Successfully loaded ${content.length} characters`);

      switch (contentType) {
        case 'text':
        case 'plain':
          element.textContent = content;
          element.classList.add('content-text');
          break;

        case 'html':
          element.innerHTML = content;
          break;

        case 'markdown':
          // Simple markdown to HTML conversion (basic support)
          console.log(`Content Loader: Converting markdown to HTML...`);
          const htmlContent = convertMarkdownToHTML(content);
          console.log(`Content Loader: Converted to ${htmlContent.length} characters of HTML`);
          element.innerHTML = htmlContent;
          element.classList.add('content-markdown');
          console.log(`Content Loader: Successfully injected content into element`);
          break;

        case 'image':
          const img = document.createElement('img');
          img.src = contentPath;
          img.alt = hookName;
          img.className = 'content-image';
          element.appendChild(img);
          break;

        case 'video':
          const video = document.createElement('video');
          video.src = contentPath;
          video.controls = true;
          element.appendChild(video);
          break;

        case 'youtube':
          const iframe = document.createElement('iframe');
          iframe.src = contentPath;
          iframe.width = '560';
          iframe.height = '315';
          iframe.frameBorder = '0';
          iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
          iframe.allowFullscreen = true;
          element.appendChild(iframe);
          break;

        default:
          element.textContent = content;
      }
    } catch (error) {
      console.error(`Error loading content for ${hookName}:`, error);
      element.textContent = '';
    }
  }
});

// Basic markdown to HTML converter
function convertMarkdownToHTML(markdown) {
  let html = markdown;

  // Split into lines to preserve structure
  let lines = html.split('\n');
  let result = [];
  let inParagraph = false;

  for (let line of lines) {
    // Check for horizontal rule
    if (line.trim() === '---') {
      if (inParagraph) { result.push('</p>'); inParagraph = false; }
      result.push('<hr class="divider">');
    } else if (line.match(/^### /)) {
      if (inParagraph) { result.push('</p>'); inParagraph = false; }
      result.push(line.replace(/^### (.*)$/, '<h3>$1</h3>'));
    } else if (line.match(/^## /)) {
      if (inParagraph) { result.push('</p>'); inParagraph = false; }
      result.push(line.replace(/^## (.*)$/, '<h2>$1</h2>'));
    } else if (line.match(/^# /)) {
      if (inParagraph) { result.push('</p>'); inParagraph = false; }
      result.push(line.replace(/^# (.*)$/, '<h1>$1</h1>'));
    } else if (line.trim() === '') {
      // Empty line - close paragraph if open
      if (inParagraph) {
        result.push('</p>');
        inParagraph = false;
      }
      result.push('');
    } else {
      // Regular line - preserve leading spaces
      let processedLine = line;

      // Bold
      processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      // Italic
      processedLine = processedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');

      // Links
      processedLine = processedLine.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

      // Preserve leading spaces by converting to non-breaking spaces
      let leadingSpaces = line.match(/^(\s+)/);
      if (leadingSpaces) {
        let spaces = leadingSpaces[1].replace(/ /g, '&nbsp;');
        processedLine = spaces + processedLine.trim();
      }

      if (!inParagraph) {
        result.push('<p>');
        inParagraph = true;
      }
      result.push(processedLine + '<br>');
    }
  }

  if (inParagraph) {
    result.push('</p>');
  }

  return result.join('\n');
}
