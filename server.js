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

const roomsData = {};

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('create_room', ({ roomId }, callback) => {
    if (!roomId) {
      return callback({ success: false, message: 'Broj igre nije ispravan.' });
    }

    const room = io.sockets.adapter.rooms.get(roomId);

    if (room && room.size > 0) {
      return callback({ success: false, message: 'Soba sa tim brojem već postoji.' });
    }
    
    socket.join(roomId);

    roomsData[roomId] = {
      columns: columns || [],
    };

    callback({ success: true, roomId });
  });

  socket.on('join_room', ({ roomId }, callback) => {
    const room = io.sockets.adapter.rooms.get(roomId);

    if (!room) {
      callback({ success: false, message: `Soba ${roomId} ne postoji. Pokušajte ponovo.` });
      return;
    }

    if (room.size >= 2) {
      callback({ success: false, message: `Soba ${roomId} već ima dva igrača. Igra moguća samo 1 na 1.` });
      return;
    }

    socket.join(roomId);

    const roomInfo = roomsData[roomId];
    const columns = roomInfo ? roomInfo.columns : [];

    callback({ 
      success: true, 
      roomId, 
      columns 
    });
  });

  socket.on('opponentData', ({ columns, roomId }) => {
    console.log('Opponent Data:', columns, 'end of opponent data');
    socket.to(roomId).emit('opponentData', columns);
  });

  socket.on('newDiceValues', ({ diceWithoutIcons, rollNumber, roomId }) => {
    console.log('newDiceValues recieved', diceWithoutIcons);
    socket.to(roomId).emit('newDiceValues', { diceWithoutIcons, rollNumber });
  });

  socket.on('disconnect', () => {
    console.log('Majstore, taj server ti je prekinut!', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Majstore ovaj server ti je na http://localhost:${PORT}`);
});