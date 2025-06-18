const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { uploadBackup, listBackups, deleteBackup, downloadBackup } = require('./s3');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- Data Persistence ---
const DATA_FILE = path.join(__dirname, 'users.json');

// Restore users from S3 if needed
async function restoreUsersFromS3IfNeeded() {
  let shouldRestore = false;
  if (!fs.existsSync(DATA_FILE)) {
    shouldRestore = true;
  } else {
    try {
      const fileContents = fs.readFileSync(DATA_FILE, 'utf8');
      if (!fileContents || fileContents.trim() === "" || fileContents.trim() === "[]") {
        shouldRestore = true;
      }
    } catch (e) {
      shouldRestore = true;
    }
  }

  if (shouldRestore) {
    try {
      // List all user backups
      const data = await listBackups('users-');
      const allObjects = (data.Contents || []);
      // Find latest daily backup first
      const dailyBackups = allObjects
        .filter(obj => /^users-\d{8}\.json$/.test(obj.Key))
        .sort((a, b) => b.Key.localeCompare(a.Key)).reverse(); // newest first
      let latestKey = null;
      if (dailyBackups.length > 0) {
        latestKey = dailyBackups[0].Key;
      } else {
        // Fallback: try monthly
        const monthlyBackups = allObjects
          .filter(obj => /^users-\d{4}-\d{2}\.json$/.test(obj.Key))
          .sort((a, b) => b.Key.localeCompare(a.Key)).reverse(); // newest first
        if (monthlyBackups.length > 0) {
          latestKey = monthlyBackups[0].Key;
        }
      }
      if (latestKey) {
        const s3obj = await downloadBackup(latestKey);
        fs.writeFileSync(DATA_FILE, s3obj.Body.toString('utf8'), 'utf8');
        console.log(`Restored users from S3 backup: ${latestKey}`);
      } else {
        console.warn("No S3 user backups found; starting with empty user list.");
      }
    } catch (e) {
      console.error("Failed to restore users from S3:", e);
    }
  }
  // Now load as usual
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {
    return [];
  }
  return [];
}

function saveUsers(users) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf8');
  const now = new Date();
  const dateStr = now.toISOString().slice(0,10).replace(/-/g, '');
  const monthStr = now.toISOString().slice(0,7); // "YYYY-MM"
  uploadBackup(`users-${dateStr}.json`, users)
    .then(() => console.log('Backup uploaded to S3'))
    .catch(err => console.error('S3 upload failed:', err));
  if (now.getDate() === 1) {
    uploadBackup(`users-${monthStr}.json`, users)
      .then(() => console.log('Monthly backup uploaded to S3'))
      .catch(err => console.error('Monthly S3 upload failed:', err));
    // Clean up old monthly backups (keep last 3)
    listBackups('users-').then(data => {
      const allObjects = data.Contents || [];

      // 1. Monthly backups cleanup
      const monthlyBackups = allObjects
        .filter(obj => /^users-\d{4}-\d{2}\.json$/.test(obj.Key))
        .sort((a, b) => b.Key.localeCompare(a.Key)); // Newest first
      const oldMonthly = monthlyBackups.slice(3); // keep 3 newest

      // 2. Daily backups cleanup (older than 7 days, but NOT the first of any month)
      const today = new Date();
      const dailyBackupsToDelete = allObjects
        .filter(obj => {
          const dailyMatch = obj.Key.match(/^users-(\d{8})\.json$/);
          if (!dailyMatch) return false;
          const datePart = dailyMatch[1];
          const backupDate = new Date(datePart.slice(0,4), datePart.slice(4,6)-1, datePart.slice(6,8));
          const isFirstOfMonth = backupDate.getDate() === 1;
          const ageDays = (today - backupDate) / (1000 * 60 * 60 * 24);
          return !isFirstOfMonth && ageDays >= 7;
        });

      // Combine and delete
      const toDelete = [...oldMonthly, ...dailyBackupsToDelete];
      return Promise.all(toDelete.map(obj => deleteBackup(obj.Key)));
    })
    .then(() => console.log('Old monthly and daily backups cleaned up'))
    .catch(err => console.error('Backup cleanup failed:', err));
  } else {
    // On non-1st days, just clean up daily backups older than 7 days (except first of month)
    listBackups('users-').then(data => {
      const allObjects = data.Contents || [];
      const today = new Date();
      const dailyBackupsToDelete = allObjects
        .filter(obj => {
          const dailyMatch = obj.Key.match(/^users-(\d{8})\.json$/);
          if (!dailyMatch) return false;
          const datePart = dailyMatch[1];
          const backupDate = new Date(datePart.slice(0,4), datePart.slice(4,6)-1, datePart.slice(6,8));
          const isFirstOfMonth = backupDate.getDate() === 1;
          const ageDays = (today - backupDate) / (1000 * 60 * 60 * 24);
          return !isFirstOfMonth && ageDays >= 7;
        });
      return Promise.all(dailyBackupsToDelete.map(obj => deleteBackup(obj.Key)));
    })
    .then(() => console.log('Old daily backups cleaned up'))
    .catch(err => console.error('Daily backup cleanup failed:', err));
  }
}

let users = [];

(async () => {
  users = await restoreUsersFromS3IfNeeded();
})();

// API: Ping (for frontend to check server readiness)
app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok' });
});

// API: Sign up
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

// API: Log in
app.post('/api/login', (req, res) => {
  const { username, userid } = req.body;
  if (users.some(u => u.username === username && u.userid === userid)) {
    return res.json({ success: true });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

// API: List all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// ADMIN PANEL: Direct Access Channel
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
          textarea { width: 100%; height: 200px; background: #232337; color: #fff; border-radius: 6px; }
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
          <textarea name="users">${JSON.stringify(users, null, 2)}</textarea><br>
          <button type="submit">Save All</button>
        </form>
        <br>
        <a href="/">Back to Home</a>
      </body>
    </html>
  `);
});

// ADMIN: Delete user by userid
app.post('/admin/delete-user', (req, res) => {
  const { userid } = req.body;
  const initialLength = users.length;
  users = users.filter(u => u.userid !== userid);
  if (users.length < initialLength) {
    saveUsers(users);
  }
  res.redirect('/admin');
});

// ADMIN: Overwrite all users from textarea JSON
app.post('/admin/update-users', (req, res) => {
  try {
    const newUsers = JSON.parse(req.body.users);
    if (!Array.isArray(newUsers)) throw new Error("Submitted data must be an array.");
    users = newUsers;
    saveUsers(users);
    res.redirect('/admin');
  } catch (e) {
    res.send(`<p style="color:red;">JSON Error: ${e.message}</p><a href="/admin">Back</a>`);
  }
});

// Show backend data as HTML (dark theme, for devs)
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
        <p><a href="/admin" style="color:#a5b4fc;">Go to Admin Panel</a></p>
      </body>
    </html>
  `);
});

app.get('/api/s3-test', async (req, res) => {
  try {
    await uploadBackup('test-backend-signal.json', { test: true, time: new Date().toISOString() });
    res.json({ success: true });
  } catch (err) {
    console.error('S3 test upload failed:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
