const express = require('express');
const http = require('http');
const users = require('./data/users'); // adjust path as needed

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 3001;

// Attach Socket.IO to users module if needed
users.setIO(io);

// Socket.IO events
io.on('connection', (socket) => {
  socket.on('getUsers', (data, callback) => {
    callback(users.getUsers());
  });

  socket.on('registerUser', (data, callback) => {
    const { username, userid } = data;
    if (!username || !userid) {
      return callback({ error: 'Missing username or userid' });
    }
    if (users.getUsers().find(u => u.userid === userid)) {
      return callback({ error: 'User ID exists' });
    }
    users.addUser({ username, userid });
    callback({ success: true });
    // users.addUser will emit 'usersUpdated' to all clients
  });

  // You can add similar socket events for delete, update, etc.
});

// (Optional) Express routes here, e.g. for /api/ping

server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});