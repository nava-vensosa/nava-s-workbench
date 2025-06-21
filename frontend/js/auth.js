const BACKEND_URL = 'https://nava-s-workbench.onrender.com';

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterLink = document.getElementById('show-register-link');
const backToLoginLink = document.getElementById('back-to-login-link');
const authSection = document.getElementById('auth-section');
const loadingScreen = document.getElementById('loading-screen');
const userList = document.getElementById('user-list');

// Show loading screen and ping backend
function showLoadingScreen() {
  loadingScreen.style.display = 'flex';
  pingBackend();
}
function hideLoadingScreen() {
  loadingScreen.style.display = 'none';
}

// Ping backend to check if it's up
function pingBackend() {
  fetch(`${BACKEND_URL}api/ping`)
    .then(res => res.json())
    .then(() => {
      hideLoadingScreen();
      authSection.style.display = 'block';
      loadUserList();
    })
    .catch(() => {
      setTimeout(pingBackend, 1500); // Retry until backend is up
    });
}

// Clear input fields helper
function clearInputs(form) {
  Array.from(form.querySelectorAll('input')).forEach(input => input.value = '');
}

// Toggle to register view
showRegisterLink.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.style.display = 'none';
  showRegisterLink.style.display = 'none';
  registerForm.style.display = 'block';
  backToLoginLink.style.display = 'block';
  clearInputs(loginForm);
  clearInputs(registerForm);
});

// Toggle back to login view
backToLoginLink.addEventListener('click', (e) => {
  e.preventDefault();
  registerForm.style.display = 'none';
  backToLoginLink.style.display = 'none';
  loginForm.style.display = 'block';
  showRegisterLink.style.display = 'block';
  clearInputs(loginForm);
  clearInputs(registerForm);
  loadUserList(); // Always reload user list when returning to login
});

// Login logic: check if user exists in backend
loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const userid = document.getElementById('userid').value.trim();
  fetch(`${BACKEND_URL}/api/users`)
    .then(res => res.json())
    .then(users => {
      const found = users.find(u => u.username === username && u.userid === userid);
      if (found) {
        authSection.style.display = 'none';
        document.getElementById('main-menu').style.display = 'block';
      } else {
        alert('User not found. Please check your Username and User ID.');
        loadUserList(); // Refetch in case data changed
      }
    })
    .catch(() => alert('Could not connect to backend.'));
});

// Register logic: send new user to backend
registerForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('new-username').value.trim();
  const userid = document.getElementById('new-userid').value.trim();
  fetch(`${BACKEND_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, userid })
  })
    .then(async res => {
      const data = await res.json().catch(() => ({}));
      if (res.status === 201) {
        alert('Registration successful! You can now log in.');
        registerForm.style.display = 'none';
        backToLoginLink.style.display = 'none';
        loginForm.style.display = 'block';
        showRegisterLink.style.display = 'block';
        clearInputs(loginForm);
        clearInputs(registerForm);
        loadUserList(); // Refetch user list after registration
      } else if (res.status === 409) {
        alert('User ID already exists.');
      } else {
        alert('Registration failed: ' + (data.error || res.status));
      }
    })
    .catch(err => alert('Could not connect to backend: ' + err));
});

// Load user list from backend
function loadUserList() {
  fetch(`${BACKEND_URL}/api/users`)
    .then(res => res.json())
    .then(users => {
      userList.innerHTML = '';
      users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = `${user.username} (${user.userid})`;
        userList.appendChild(li);
      });
    });
}

// On page load, show loading screen and ping backend
window.addEventListener('DOMContentLoaded', showLoadingScreen);