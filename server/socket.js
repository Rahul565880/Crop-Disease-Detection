const { Server } = require('socket.io');

const connectedUsers = {};

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join-chat', ({ userId, userName }) => {
      connectedUsers[socket.id] = { userId, userName };
      socket.join('general');
      io.to('general').emit('user-joined', { userId, userName, online: Object.keys(connectedUsers).length });
    });

    socket.on('send-message', ({ text, userId, userName }) => {
      io.to('general').emit('new-message', {
        id: Date.now().toString(),
        text,
        userId,
        userName,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('typing', ({ userId, userName }) => {
      socket.to('general').emit('user-typing', { userId, userName });
    });

    socket.on('disconnect', () => {
      const user = connectedUsers[socket.id];
      delete connectedUsers[socket.id];
      if (user) {
        io.to('general').emit('user-left', { ...user, online: Object.keys(connectedUsers).length });
      }
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
}

module.exports = setupSocket;
