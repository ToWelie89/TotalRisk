var io = require('socket.io').listen(1119);
console.log('listening on *:' + 1119);

let socketList = [];
const names = ['Pelle', 'Kalle'];
let rooms = {};
let name;

io.on('connection', function(socket){
  console.log('User connected!');
  socket.emit('connected');

  socket.userName = names[socketList.length];
  socketList = [...socketList, socket];

  socket.on('sendMessage', (roomId, msg) => {
    if (!rooms[roomId]) {
      rooms[roomId] = {
        messages: []
      };
    }

    rooms[roomId].messages = [...rooms[roomId].messages, msg];

    socketList.forEach(currentSocket => {
      currentSocket.emit('messagesUpdated', rooms[roomId].messages);
    });
  });

  socket.on('getMessagesByRoomId', (roomId) => {
    if (!rooms[roomId]) {
      rooms[roomId] = {
        messages: []
      };
    }
    socket.emit('messagesUpdated', rooms[roomId].messages);
  });

  socket.on('updateView', function(msg1) {
    console.log(msg1);
    socket.emit('chat_message', "Reply from server");
  });
});