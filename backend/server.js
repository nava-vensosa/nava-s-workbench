const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { uploadBackup } = require('./s3');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- Data Persistence ---
const DATA_FILE = path.join(__dirname, 'users.json');

// Load users from disk (fallback if S3 not available)
function loadUsers() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {
    console.error("Failed to load users from disk:", e);
  }
  return [];
}

function saveUsers(users) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf8');
  // Also save to S3
  const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
  uploadBackup(`users-${dateStr}.json`, users)
    .then(() => console.log('Backup uploaded to S3'))
    .catch(err => console.error('S3 upload failed:', err));
}

let users = loadUsers();

app.post('/api/signup', (req, res) => {
  const { username, userid } = req.body;
  if (!username || !userid) return res.status(400).json({ error: 'Missing fields' });
  if (users.some(u => u.username === username && u.userid === userid)) {
    return res.status(409).json({ error: 'User already exists' });
  }
  users.push({ username, userid });
  saveUsers(users);
  res.json({ success: true });
});

const users = []; // In-memory, replace with DB for production

app.post('/api/signup', (req, res) => {
  const { username, userid } = req.body;
  if (!username || !userid) return res.status(400).json({ error: 'Missing fields' });
  if (users.some(u => u.username === username && u.userid === userid)) {
    return res.status(409).json({ error: 'User already exists' });
  }
  users.push({ username, userid });
  res.json({ success: true });
});

app.post('/api/login', (req, res) => {
  const { username, userid } = req.body;
  if (users.some(u => u.username === username && u.userid === userid)) {
    return res.json({ success: true });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

// New: List all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// New: Show backend data as HTML (dark theme)
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Backend Data</title>
        <style>
          body { background: #18181b; color: #fff; font-family: monospace; padding: 24px; }
          h1 { color: #a5b4fc; }
          pre { background: #232337; padding: 16px; border-radius: 8px; }
        </style>
      </head>
      <body>
        <h1>Backend State</h1>
        <h2>Users</h2>
        <pre>${JSON.stringify(users, null, 2)}</pre>
      </body>
    </html>
  `);
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));



app.use(express.urlencoded({ extended: false }));

// Admin Panel Route
app.get('/admin', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Admin Panel</title>
        <style>
          body { background: #18181b; color: #fff; font-family: monospace; padding: 24px; }
          table { background: #232337; border-radius: 8px; padding: 12px; }
          th, td { padding: 8px; }
          button { background: #ef4444; color: #fff; border: none; border-radius: 4px; padding: 6px 12px; cursor: pointer; }
        </style>
      </head>
      <body>
        <h1>Admin: Users</h1>
        <table>
          <tr><th>User Name</th><th>User ID</th><th>Delete</th></tr>
          ${users.map(u => `
            <tr>
              <td>${u.username}</td>
              <td>${u.userid}</td>
              <td>
                <form method="POST" action="/admin/delete-user" style="display:inline;">
                  <input type="hidden" name="userid" value="${u.userid}" />
                  <button type="submit">Delete</button>
                </form>
              </td>
            </tr>
          `).join('')}
        </table>
        <br>
        <h2>Edit All Users (JSON)</h2>
        <form method="POST" action="/admin/update-users">
          <textarea name="users" style="width:100%;height:200px;background:#232337;color:#fff;">${JSON.stringify(users, null, 2)}</textarea><br>
          <button type="submit">Save All</button>
        </form>
      </body>
    </html>
  `);
});

// Delete single user
app.post('/admin/delete-user', (req, res) => {
  const { userid } = req.body;
  users = users.filter(u => u.userid !== userid);
  saveUsers(users); // triggers S3 snapshot
  res.redirect('/admin');
});

// Overwrite all users (bulk edit)
app.post('/admin/update-users', (req, res) => {
  try {
    users = JSON.parse(req.body.users);
    saveUsers(users); // triggers S3 snapshot
    res.redirect('/admin');
  } catch (e) {
    res.send(`<p style="color:red;">JSON Error: ${e.message}</p><a href="/admin">Back</a>`);
  }
});
