const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const users = require('./data/users');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*' } });
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/admin', express.static(path.join(__dirname, 'public')));

// Attach Socket.IO to users module
users.setIO(io);

// Restore users from S3 on startup
users.restoreUsersFromS3IfNeeded().then(() => {
  console.log('User data loaded from S3 or local file.');
});

// Socket.IO connection (optional logging)
io.on('connection', (socket) => {
  // console.log('Client connected');
});

// Ping endpoint
app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok' });
});

// List users
app.get('/api/users', (req, res) => {
  res.json(users.getUsers());
});

// Register user
app.post('/api/users', (req, res) => {
  const { username, userid } = req.body;
  if (!username || !userid) {
    return res.status(400).json({ error: 'Missing username or userid' });
  }
  if (users.getUsers().find(u => u.userid === userid)) {
    return res.status(409).json({ error: 'User ID exists' });
  }
  users.addUser({ username, userid });
  res.status(201).json({ success: true });
});

// (Optional) Delete user
app.delete('/api/users/:userid', (req, res) => {
  users.deleteUserById(req.params.userid);
  res.json({ success: true });
});

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