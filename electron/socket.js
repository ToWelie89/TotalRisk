const firebase = require('firebase');

const io = require('socket.io').listen(1119);
console.log('Llistening on *:' + 1119);

const config = {
  apiKey: "AIzaSyDFz9b6u63g01thrhzSotBUfTgCZQ8U_Bw",
  authDomain: "totalrisk-e2899.firebaseapp.com",
  databaseURL: "https://totalrisk-e2899.firebaseio.com",
  projectId: "totalrisk-e2899",
  storageBucket: "totalrisk-e2899.appspot.com",
  messagingSenderId: "1086373539251"
};
firebase.initializeApp(config);

let socketList = [];
let rooms = {};

const newRoomTemplate = {
  messages: [],
  users: []
}

const updateCurrentPlayersInRoom = room => {
  var updates = {};
  updates[`rooms/${room}/currentNumberOfPlayers`] = rooms[room].users.length;
  firebase.database().ref().update(updates);
}

io.on('connection', function(socket){
  console.log('User connected!');
  socket.emit('connected');

  socketList = [...socketList, socket];

  socket.on('setUser', (userUid) => {
    socket.userUid = userUid;
  });

  socket.on('setHost', (roomId, uid) => {
    if (!rooms[roomId]) {
      rooms[roomId] = Object.assign(newRoomTemplate, {});
    }

    rooms[roomId].host = uid;
  });

  socket.on('addUserToRoom', (roomId) => {
    if (!rooms[roomId]) {
      rooms[roomId] = Object.assign(newRoomTemplate, {});
    }

    if (!rooms[roomId].users.includes(socket.userUid)) {
      rooms[roomId].users.push(socket.userUid);

      // Remove user from all other rooms
      for(let room in rooms) {
        if (room !== roomId) {
          rooms[room].users = rooms[room].users.filter(uid => uid !== socket.userUid);
        }
        updateCurrentPlayersInRoom(room);
      }
    }

    console.log(rooms);
  });

  socket.on('leaveLobby', roomId => {
    console.log('Player left lobby');

    rooms[roomId].users = rooms[roomId].users.filter(uid => uid !== socket.userUid);
    updateCurrentPlayersInRoom(roomId);

    if (rooms[roomId].users.length === 0 || !rooms[roomId].users.includes(rooms[roomId].host)) {
      firebase.database().ref('/rooms/' + roomId).remove();
      delete rooms[roomId];

      socketList.forEach(currentSocket => {
        currentSocket.emit('hostLeft');
      });
    }

    console.log(rooms);
  });

  socket.on('disconnect', reason => {
    console.log('Got disconnected because of reason ', reason);
    for(let room in rooms) {
      rooms[room].users = rooms[room].users.filter(uid => uid !== socket.userUid);
      updateCurrentPlayersInRoom(room);

      if (rooms[room].users.length === 0) {
        firebase.database().ref('rooms/' + room).remove();
        delete rooms[room];
      } else if (!rooms[room].users.includes(rooms[room].host)) {
        // Host left, kick all others
        socketList.forEach(currentSocket => {
          currentSocket.emit('hostLeft');
        });
      }
    }

    console.log(rooms);
  });

  socket.on('sendMessage', (roomId, msg) => {
    if (!rooms[roomId]) {
      rooms[roomId] = Object.assign(newRoomTemplate, {});
    }

    rooms[roomId].messages = [...rooms[roomId].messages, msg];

    socketList.forEach(currentSocket => {
      if (rooms[roomId].users.includes(currentSocket.userUid)) {
        currentSocket.emit('messagesUpdated', rooms[roomId].messages);
      }
    });
  });
});