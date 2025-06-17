const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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
