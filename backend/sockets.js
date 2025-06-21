function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
    // Add socket event listeners here as your app expands
  });
}
module.exports = { setupSocket };
