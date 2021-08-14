const socket = io();

const welcome = document.getElementById('welcome');
const form = welcome.querySelector('form');
const room = document.getElementById('room');

room.hidden = true;

let roomName;

const handleMessageSubmit = (event) => {
  event.preventDefault();
  const input = room.querySelector('#message > input');
  const value = input.value;
  socket.emit('new_message', input.value, roomName, () =>
    addMessage(`You : ${value}`)
  );
  input.value = '';
};

const showRoom = () => {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName}`;
  const msgForm = room.querySelector('#message');
  const nicknameForm = room.querySelector('#nickname');
  msgForm.addEventListener('submit', handleMessageSubmit);
  nicknameForm.addEventListener('submit', handleNicknameSubmit);
};

const handleNicknameSubmit = (event) => {
  event.preventDefault();
  const input = room.querySelector('#nickname > input');
  socket.emit('nickname', input.value);
  input.value = '';
};

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = form.querySelector('input');
  socket.emit('enter_room', input.value, showRoom);
  roomName = input.value;
  input.value = '';
});

const addMessage = (text) => {
  const ul = room.querySelector('ul');
  const li = document.createElement('li');
  li.innerText = text;
  ul.appendChild(li);
};

socket.on('welcome', (user, newCount) => {
  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${user} arrived!`);
});

socket.on('bye', (left, newCount) => {
  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${left} left ㅠㅠ`);
});

socket.on('new_message', addMessage);

socket.on('room_change', (rooms) => {
  const roomList = welcome.querySelector('ul');
  if (rooms.length === 0) {
    roomList.innerHTML = '';
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.innerText = 'enter';
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      socket.emit('enter_room', room, showRoom);
      roomName = room;
    });
    li.innerText = room;
    li.appendChild(btn);
    roomList.appendChild(li);
  });
});
