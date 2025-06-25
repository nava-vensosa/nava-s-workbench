function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });

    socket.on('proposeHedge', async (hedgeData) => {
      try {
        const response = await fetch(`${process.env.API_URL}/api/hedges`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(hedgeData),
        });
        
        const result = await response.json();
        if (response.ok) {
          io.emit('hedgeProposed', result);
        } else {
          socket.emit('error', result.error);
        }
      } catch (error) {
        console.error('Error proposing hedge:', error);
        socket.emit('error', 'Failed to propose hedge');
      }
    });
  });
}

module.exports = { setupSocket };