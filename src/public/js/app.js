const messageList = document.querySelector('ul');
const messageForm = document.querySelector('form');
const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener('open', () => {
  console.log('Connected to Server ✅');
});

socket.addEventListener('message', (message) => {
  const msg = document.createElement('li');
  msg.innerText = message.data;
  messageList.appendChild(msg);
});

socket.addEventListener('close', () => {
  console.log('Disconnected from Server ❌');
});

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.querySelector('input');
  const message = input.value;
  input.value = '';

  socket.send(message);
});
