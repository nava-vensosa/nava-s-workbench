const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterLink = document.getElementById('show-register-link');
const backToLoginLink = document.getElementById('back-to-login-link');
const authSection = document.getElementById('auth-section');

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
});

// Placeholder login logic
loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  document.getElementById('auth-section').style.display = 'none';
  document.getElementById('main-menu').style.display = 'block';
});

// Placeholder register logic
registerForm.addEventListener('submit', function(e) {
  e.preventDefault();
  alert('Registration submitted!');
  registerForm.style.display = 'none';
  backToLoginLink.style.display = 'none';
  loginForm.style.display = 'block';
  showRegisterLink.style.display = 'block';
  clearInputs(loginForm);
  clearInputs(registerForm);
});

// Populate user list (placeholder data)
const users = [
  { name: "Alice", id: "alice123" },
  { name: "Bob", id: "bob456" },
  { name: "Charlie", id: "charlie789" }
];

const userList = document.getElementById('user-list');
function renderUserList() {
  userList.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = `${user.name} (${user.id})`;
    userList.appendChild(li);
  });
}
renderUserList();