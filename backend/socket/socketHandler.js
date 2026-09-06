function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join room for specific floor if requested
    socket.on('join_floor', (floor) => {
      socket.join(floor);
      console.log(`[Socket.IO] Client ${socket.id} joined room: ${floor}`);
    });

    // Client requests manual slot ping
    socket.on('ping_status', () => {
      socket.emit('pong_status', { timestamp: new Date(), status: 'online' });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
}

module.exports = setupSocket;
