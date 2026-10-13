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

  socket.on('create_or_join_room', ({ roomId }, callback) => {
    if(!roomId) {
      return callback({ success: false, message: 'Neispravan broj sobe. Probajte ponovo' })
    }

    const room = io.sockets.adapter.rooms.get(roomId);

    if(room && room.size >= 2) {
      return callback({ success: false, message: 'Ova igra već ima dva igrača. Moguća je samo igra 1 na 1.' });
    }

    callback({ success: true, message: `Igra broj ${roomId} je dostupna.` });
  })
  
  socket.on('join_room', roomId => {
    socket.join(roomId);
  })

  socket.on('opponentData', (data) => {
    socket.to(data.roomId).emit('opponentData', data.columns);
  });

  socket.on('newDiceValues', (dice) => {
    socket.to(dice.roomId).emit('newDiceValues', dice.values);
  });

  socket.on('disconnect', () => {
    console.log('Majstore, taj server ti je prekinut!', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Majstore ovaj server ti je na http://localhost:${PORT}`);
});