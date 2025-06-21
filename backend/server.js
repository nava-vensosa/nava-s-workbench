const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { uploadBackup, downloadBackup } = require('./s3');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: { origin: '*' }
});
const PORT = process.env.PORT || 3001;
const USERS_KEY = 'users.json';

app.use(cors());
app.use(express.json());
app.use('/admin', express.static(path.join(__dirname, 'public')));

// Helper to read users from S3
async function readUsers() {
  try {
    const data = await downloadBackup(USERS_KEY);
    return JSON.parse(data.Body.toString('utf8'));
  } catch (err) {
    if (err.code === 'NoSuchKey') return [];
    throw err;
  }
}

// Helper to write users to S3
async function writeUsers(users) {
  await uploadBackup(USERS_KEY, users);
}

// Socket.IO connection
io.on('connection', (socket) => {
  // Optionally log connections
  // console.log('Client connected');
});

// Ping endpoint
app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok' });
});

// List users
app.get('/api/users', async (req, res) => {
  try {
    const users = await readUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read users' });
  }
});

// Register user
app.post('/api/users', async (req, res) => {
  const { username, userid } = req.body;
  if (!username || !userid) {
    return res.status(400).json({ error: 'Missing username or userid' });
  }
  try {
    let users = await readUsers();
    if (users.find(u => u.userid === userid)) {
      return res.status(409).json({ error: 'User ID exists' });
    }
    users.push({ username, userid });
    await writeUsers(users);
    io.emit('usersUpdated'); // Notify all clients
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to write user' });
  }
});

// (Optional) Add a DELETE route for admin dashboard and emit io.emit('usersUpdated') after deletion

// Serve admin dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// 404 handler (must be last)
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});