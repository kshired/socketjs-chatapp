import http from 'http';
import express from 'express';
import morgan from 'morgan';
import SocketIo from 'socket.io';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use(morgan('dev'));
app.use('/public', express.static(__dirname + '/public'));

app.get('/', (_, res) => {
  res.render('home');
});
app.get('/*', (_, res) => res.redirect('/'));

const server = http.createServer(app);
const wsServer = SocketIo(server);

wsServer.on('connection', (socket) => {
  socket.on('enter_room', (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit('welcome', socket.nickname);
  });
  socket.on('disconnecting', () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit('bye', socket.nickname)
    );
  });
  socket.on('new_message', (msg, roomName, done) => {
    socket.to(roomName).emit('new_message', `${socket.nickname}: ${msg}`);
    done();
  });
  socket.on('nickname', (nickname) => {
    socket['nickname'] = nickname;
  });
});

// const sockets = [];

// webSocketServer.on('connection', (socket) => {
//   sockets.push(socket);
//   console.log('Connected to Browser ✅');
//   socket.on('close', () => console.log('Disconnected from the Browser ❌'));
//   socket.on('message', (message) => {
//     const data = JSON.parse(message.toString());
//     switch (data.type) {
//       case 'message':
//         sockets.forEach((aSocket) => {
//           aSocket.send(`${socket.nickname}: ${data.payload}`);
//         });
//         break;
//       case 'nickname':
//         socket['nickname'] = data.payload;
//         break;
//       default:
//         return 0;
//     }
//   });
// });

server.listen(3000, () => {
  console.log(`Server is running at http://localhost:3000`);
});
