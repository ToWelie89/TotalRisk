var io = require('socket.io').listen(1119);
console.log('listening on *:' + 1119);

let socketList = [];
let rooms = {};

const newRoomTemplate = {
  messages: [],
  users: []
}

io.on('connection', function(socket){
  console.log('User connected!');
  socket.emit('connected');

  socket.on('addUserToRoom', (roomId, userUid) => {
    if (!rooms[roomId]) {
      rooms[roomId] = Object.assign(newRoomTemplate, {});
    }

    if (!rooms[roomId].users.includes(userUid)) {
      rooms[roomId].users.push(userUid);

      for(let room in rooms) {
        if (room !== roomId) {
          rooms[room].users = rooms[room].users.filter(uid => uid !== userUid);
        }
      }
    }

    console.log(rooms);
  });

  socketList = [...socketList, socket];

  socket.on('disconnect', socket => {
    console.log('Got disconnected!', socket);
    // remove user from user list for room
  });

  socket.on('sendMessage', (roomId, msg) => {
    if (!rooms[roomId]) {
      rooms[roomId] = Object.assign(newRoomTemplate, {});
    }

    rooms[roomId].messages = [...rooms[roomId].messages, msg];

    socketList.forEach(currentSocket => {
      currentSocket.emit('messagesUpdated', rooms[roomId].messages);
    });
  });

  socket.on('getMessagesByRoomId', (roomId) => {
    if (!rooms[roomId]) {
      rooms[roomId] = Object.assign(newRoomTemplate, {});
    }
    socket.emit('messagesUpdated', rooms[roomId].messages);
  });

  socket.on('updateView', function(msg1) {
    console.log(msg1);
    socket.emit('chat_message', "Reply from server");
  });
});