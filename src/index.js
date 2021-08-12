import http from 'http';
import express from 'express';
import morgan from 'morgan';
import ws from 'ws';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use(morgan('dev'));
app.use('/public', express.static(__dirname + '/public'));

app.get('/', (_, res) => {
  res.render('home');
});
app.get('/*', (_, res) => res.redirect('/'));

// app.listen(3000, () => {
//   console.log(`Server is running at http://localhost:3000`);
// });

const server = http.createServer(app);
const webSocketServer = new ws.Server({ server });

webSocketServer.on('connection', (socket, req) => {
  console.log('Connected to Browser ✅');
  socket.on('close', () => console.log('Disconnected from the Browser ❌'));
  socket.on('message', (message) => {
    webSocketServer.clients.forEach((client) => {
      client.send(message.toString());
    });
  });
});

server.listen(3000, () => {
  console.log(`Server is running at http://localhost:3000`);
});
