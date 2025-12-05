// Shared navigation functions

async function goToKeyboard() {
  const response = await fetch('/keyboard');
  const html = await response.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  document.body.innerHTML = doc.body.innerHTML;
  document.head.innerHTML = doc.head.innerHTML;

  // Always load p5.js then sketch.js
  const p5Script = document.createElement('script');
  p5Script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js';
  p5Script.onload = () => {
    const sketchScript = document.createElement('script');
    sketchScript.src = 'sketch.js?' + Date.now();
    sketchScript.onload = () => {
      setupKeyboardNav();
    };
    document.body.appendChild(sketchScript);
  };
  document.body.appendChild(p5Script);
}

async function goToHome() {
  const response = await fetch('/');
  const html = await response.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  document.body.innerHTML = doc.body.innerHTML;
  document.head.innerHTML = doc.head.innerHTML;

  setupHomeNav();
}

function setupHomeNav() {
  document.getElementById('go-link').addEventListener('click', (e) => {
    e.preventDefault();
    goToKeyboard();
  });
}

function setupKeyboardNav() {
  document.getElementById('home-btn').addEventListener('click', () => {
    goToHome();
  });
}
