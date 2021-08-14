import http from 'http';
import express from 'express';
import morgan from 'morgan';
import { Server } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';

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
const wsServer = new Server(server, {
  cors: {
    origin: ['https://admin.socket.io'],
    credentials: true,
  },
});

instrument(wsServer, {
  auth: false,
});

const publicRooms = () => {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;

  const publics = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publics.push(key);
    }
  });

  return publics;
};

const countRoom = (roomName) =>
  wsServer.sockets.adapter.rooms.get(roomName)?.size;

wsServer.on('connection', (socket) => {
  socket['nickname'] = 'Anonymous';
  socket.on('enter_room', (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit('welcome', socket.nickname, countRoom(roomName));
    wsServer.sockets.emit('room_change', publicRooms());
  });
  socket.on('disconnecting', () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit('bye', socket.nickname, countRoom(room) - 1)
    );
  });
  socket.on('disconnect', () => {
    wsServer.sockets.emit('room_change', publicRooms());
  });
  socket.on('new_message', (msg, roomName, done) => {
    socket.to(roomName).emit('new_message', `${socket.nickname}: ${msg}`);
    done();
  });
  socket.on('nickname', (nickname) => {
    socket['nickname'] = nickname;
  });
});

server.listen(3000, () => {
  console.log(`Server is running at http://localhost:3000`);
});
