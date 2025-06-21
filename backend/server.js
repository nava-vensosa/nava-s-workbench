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