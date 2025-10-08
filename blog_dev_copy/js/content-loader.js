// Content Loader System
// Loads content from text files into elements with data-content-hook attributes

document.addEventListener('DOMContentLoaded', async () => {
  const contentHooks = document.querySelectorAll('[data-content-hook]');

  for (const element of contentHooks) {
    const hookName = element.getAttribute('data-content-hook');
    const contentPath = element.getAttribute('data-content-path');
    const contentType = element.getAttribute('data-content-type') || 'text';

    if (!contentPath) {
      console.warn(`No content path specified for hook: ${hookName}`);
      continue;
    }

    try {
      const response = await fetch(contentPath);
      if (!response.ok) {
        console.warn(`Failed to load content for ${hookName} from ${contentPath}`);
        element.textContent = '';
        continue;
      }

      const content = await response.text();

      switch (contentType) {
        case 'text':
        case 'plain':
          element.textContent = content;
          break;

        case 'html':
          element.innerHTML = content;
          break;

        case 'markdown':
          // Simple markdown to HTML conversion (basic support)
          element.innerHTML = convertMarkdownToHTML(content);
          break;

        case 'image':
          const img = document.createElement('img');
          img.src = contentPath;
          img.alt = hookName;
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

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';

  // Remove empty paragraphs
  html = html.replace(/<p><\/p>/g, '');

  return html;
}
