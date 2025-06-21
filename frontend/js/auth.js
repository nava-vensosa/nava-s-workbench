const BACKEND_URL = 'https://nava-s-workbench.onrender.com';

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterLink = document.getElementById('show-register-link');
const backToLoginLink = document.getElementById('back-to-login-link');
const authSection = document.getElementById('auth-section');
const loadingScreen = document.getElementById('loading-screen');
const userList = document.getElementById('user-list');

// Connect to Socket.IO server
const socket = io(BACKEND_URL);

// Listen for real-time updates
socket.on('usersUpdated', () => {
  loadUserList();
});

// Show loading screen and ping backend
function showLoadingScreen() {
  loadingScreen.style.display = 'flex';
  pingBackend();
}
function hideLoadingScreen() {
  loadingScreen.style.display = 'none';
}

// Ping backend to check if it's up (can use socket or fetch for ping only)
function pingBackend() {
  fetch(`${BACKEND_URL}/api/ping`)
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

// Login logic: check if user exists in backend (via socket)
loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const userid = document.getElementById('userid').value.trim();
  socket.emit('getUsers', null, (users) => {
    const found = users.find(u => u.username === username && u.userid === userid);
    if (found) {
      authSection.style.display = 'none';
      document.getElementById('main-menu').style.display = 'block';
    } else {
      alert('User not found. Please check your Username and User ID.');
      loadUserList();
    }
  });
});

// Register logic: send new user to backend via socket
registerForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('new-username').value.trim();
  const userid = document.getElementById('new-userid').value.trim();
  socket.emit('registerUser', { username, userid }, (response) => {
    if (response && response.success) {
      alert('Registration successful! You can now log in.');
      registerForm.style.display = 'none';
      backToLoginLink.style.display = 'none';
      loginForm.style.display = 'block';
      showRegisterLink.style.display = 'block';
      clearInputs(loginForm);
      clearInputs(registerForm);
      loadUserList();
    } else if (response && response.error === 'User ID exists') {
      alert('User ID already exists.');
    } else {
      alert('Registration failed: ' + (response && response.error ? response.error : 'Unknown error'));
    }
  });
});

// Load user list from backend via socket
function loadUserList() {
  socket.emit('getUsers', null, (users) => {
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