const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

const DB_FILE = path.join(__dirname, 'db.json');

app.use(express.json());
app.use('/admin', express.static(path.join(__dirname, 'public')));

// Helper to read/write db
function readDB() {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Ping endpoint
app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok' });
});

// Create user
app.post('/api/users', (req, res) => {
  const { name, id } = req.body;
  if (!name || !id) return res.status(400).json({ error: 'Missing name or id' });
  const users = readDB();
  if (users.find(u => u.id === id)) return res.status(409).json({ error: 'User ID exists' });
  users.push({ name, id });
  writeDB(users);
  res.status(201).json({ success: true });
});

// List users
app.get('/api/users', (req, res) => {
  res.json(readDB());
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
  let users = readDB();
  const before = users.length;
  users = users.filter(u => u.id !== req.params.id);
  writeDB(users);
  res.json({ deleted: before - users.length });
});

// Serve admin dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});