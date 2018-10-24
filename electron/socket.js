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

firebase.database().ref('/rooms/').remove();

let socketList = {};
let rooms = {};
let messages = [];

const updateCurrentPlayersInRoom = roomId => {
  var updates = {};
  updates[`rooms/${roomId}/currentNumberOfPlayers`] = Object.values(socketList).filter(s => s.roomId === roomId).length;
  firebase.database().ref().update(updates);
}

io.on('connection', function(socket){
  console.log('User connected!');
  socket.emit('connected');

  socket.on('setUserAndRoom', (userUid, roomId, isHost) => {
    socket.userUid = userUid;
    socket.roomId = roomId;
    socket.isHost = isHost;

    socketList[userUid] = socket;
    updateCurrentPlayersInRoom(roomId);
  });

  socket.on('leaveLobby', roomId => {
    console.log('Player left lobby');

    delete socketList[socket.userUid];
    updateCurrentPlayersInRoom(roomId);

    const usersInSameRoom = Object.values(socketList).filter(s => s.roomId === roomId);

    if (usersInSameRoom.length === 0 || usersInSameRoom.find(s => s.isHost) === undefined) {
      firebase.database().ref('/rooms/' + roomId).remove();
      for (socket in socketList) {
        socketList[socket].emit('hostLeft');
      }
    }

    console.log(socketList);
  });

  socket.on('disconnect', reason => {
    console.log('Got disconnected because of reason ', reason);
    delete socketList[socket.userUid];
    updateCurrentPlayersInRoom(socket.roomId);

    const usersInSameRoom = Object.values(socketList).filter(s => s.roomId === socket.roomId);

    if (usersInSameRoom.length === 0 || usersInSameRoom.find(s => s.isHost) === undefined) {
      firebase.database().ref('/rooms/' + socket.roomId).remove();
      for (socket in socketList) {
        socketList[socket].emit('hostLeft');
      }
    }
    console.log(socketList);
  });

  socket.on('sendMessage', (roomId, msg) => {
    msg.roomId = roomId;
    messages.push(msg);

    for (currentSocket in socketList) {
      if (socketList[currentSocket].roomId === roomId) {
        const allMessages = messages.filter(msg => msg.roomId === roomId);
        socketList[currentSocket].emit('messagesUpdated', allMessages);
      }
    }
  });
});