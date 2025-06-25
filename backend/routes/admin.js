const express = require('express');
const router = express.Router();
const { getUsers, setUsers, deleteUserById } = require('../data/users');

// For parsing urlencoded POST bodies (forms)
router.use(express.urlencoded({ extended: false }));

// ADMIN PANEL: Direct Access Channel
router.get('/', (req, res) => {
  const users = getUsers();
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
        <script src="/socket.io/socket.io.js"></script>
        <script>
          const socket = io();
          socket.on('users_updated', () => {
            window.location.reload();
          });
        </script>
      </body>
    </html>
  `);
});

// POST route to delete a user
router.post('/delete-user', (req, res) => {
  const { userid } = req.body;
  if (!userid) {
    return res.status(400).send("Missing userid");
  }
  deleteUserById(userid);
  res.redirect('/admin');
});

// POST route to update all users (from JSON textarea)
router.post('/update-users', (req, res) => {
  try {
    const users = JSON.parse(req.body.users);
    setUsers(users);
    res.redirect('/admin');
  } catch (e) {
    res.status(400).send("Invalid JSON");
  }
});

module.exports = router;
