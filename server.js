const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('opponentData', (data) => {
    console.log('Opponent Data:', data);
    io.emit('Opponent Data', data);
  });

  socket.on('disconnect', () => {
    console.log('Majstore, taj server ti je prekinut!', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Majstore ovaj server ti je na http://localhost:${PORT}`);
});