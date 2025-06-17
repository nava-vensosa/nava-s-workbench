const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const users = []; // Replace with DB later!

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

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
