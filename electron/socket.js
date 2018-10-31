import firebase from 'firebase';
import { getRandomInteger } from './../js/helpers';
import { PLAYER_COLORS, avatars, PLAYER_TYPES } from './../js/player/playerConstants';
import Player from './../js/player/player';
import GameEngine from './../js/gameEngine';
import FirebaseSettings from './../js/firebaseSettings';
import { VICTORY_GOALS } from './../js/gameConstants';
import { getTerritoryByName } from './../js/map/mapHelpers';

const states = {
  LOBBY: 'LOBBY',
  IN_GAME: 'IN_GAME',
  RESULT_SCREEN: 'RESULT_SCREEN'
};

let currentState = states.LOBBY;

const gameEngine = new GameEngine({}, {});

const io = require('socket.io').listen(1119);
console.log('Llistening on *:' + 1119);

firebase.initializeApp(FirebaseSettings);

let socketList = {};
let currentLockedSlots = {};
let messages = [];
let playerList = [];

const setPlayers = (roomId) => {
  const currentPlayersInRoom = Object.values(socketList).filter(s => s.roomId === roomId).map(x => ({
    userUid: x.userUid,
    userName: x.userName,
    isHost: x.isHost,
    color: x.color,
    avatar: x.avatar
  }));

  for (let socket in socketList) {
    if (socketList[socket].roomId === roomId) {
      socketList[socket].emit('updatedPlayers', currentPlayersInRoom);
    }
  }
}

const getRandomUnusedColor = () => {
    const usedColors = Object.values(socketList).map(socket => socket.color);
    const allColors = Array.from(Object.keys(PLAYER_COLORS).map((key, index) => PLAYER_COLORS[key]));

    const availableColors = allColors.filter(color => !usedColors.includes(color));

    const colorToReturn = availableColors[getRandomInteger(0, (availableColors.length - 1))];
    return colorToReturn;
}

const getUnusedAvatar = () => {
    const usedAvatars = Object.values(socketList).map(socket => socket.avatar);
    const allAvatars = Array.from(Object.keys(avatars).map((key, index) => avatars[key]));
    const availableAvatars = allAvatars.filter(avatar => !usedAvatars.includes(avatar));

    const avatarToReturn = availableAvatars[getRandomInteger(0, (availableAvatars.length - 1))];
    return avatarToReturn;
}

io.on('connection', function(socket){
  console.log('User connected!');
  socket.emit('connected');

  // GAME EVENTS

  socket.on('startGame', () => {
    currentState = states.IN_GAME;

    playerList = Object.values(socketList).map(x => new Player(
      x.userName,
      x.color,
      x.avatar,
      PLAYER_TYPES.HUMAN,
      x.userUid,
      x.isHost
    ));

    const victoryGoal = VICTORY_GOALS.find(x => x.percentage === 100);

    gameEngine.startGame(playerList, victoryGoal);

    for (let currentSocket in socketList) {
      socketList[currentSocket].emit('gameStarted', playerList, victoryGoal, gameEngine.map.getAllTerritoriesAsList(), gameEngine.turn);
    }
  });

  socket.on('troopAddedToTerritory', (territoryName, senderUid) => {
    getTerritoryByName(gameEngine.map, territoryName).numberOfTroops++;

    for (let currentSocket in socketList) {
      if (socketList[currentSocket].userUid !== senderUid) {
        socketList[currentSocket].emit('troopAddedToTerritoryNotifier', territoryName);
      }
    }
  });

  // LOBBY EVENTS

  socket.on('setUserAndRoom', (userUid, userName, roomId, isHost) => {
    socket.userUid = userUid;
    socket.userName = userName;
    socket.roomId = roomId;
    socket.isHost = isHost;
    socket.color = getRandomUnusedColor();
    socket.avatar = getUnusedAvatar();

    if (currentLockedSlots[roomId]) {
      socket.emit('updatedLockedSlots', currentLockedSlots[roomId]);
    }

    socketList[userUid] = socket;
    updateCurrentPlayersInRoom(roomId);
  });

  socket.on('leaveLobby', roomId => {
    console.log('Player left lobby');

    delete socketList[socket.userUid];

    const usersInSameRoom = Object.values(socketList).filter(s => s.roomId === roomId);

    if (usersInSameRoom.length === 0 || usersInSameRoom.find(s => s.isHost) === undefined) {
      firebase.database().ref('/rooms/' + roomId).remove();
      for (let socket in socketList) {
        socketList[socket].emit('hostLeft');
      }
    }

    updateCurrentPlayersInRoom(roomId);
  });

  socket.on('kickPlayer', (roomId, userUid) => {
    console.log('Player kicked from lobby');

    addNewMessage(socket.roomId, {
      sender: 'SERVER',
      uid: 'SERVER',
      message: `${socketList[userUid].userName} was kicked from the room`,
      timestamp: Date.now()
    });

    socketList[userUid].emit('kicked');
    delete socketList[userUid];

    updateCurrentPlayersInRoom(roomId);
  });

  socket.on('disconnect', reason => {
    console.log('Got disconnected because of reason ', reason);

    if (reason === 'transport close') {
      // User was disconnected by closing game/refrehsing window
      addNewMessage(socket.roomId, {
        sender: 'SERVER',
        uid: 'SERVER',
        message: `${socket.userName} left the room`,
        timestamp: Date.now()
      });
    }

    delete socketList[socket.userUid];

    const usersInSameRoom = Object.values(socketList).filter(s => s.roomId === socket.roomId);

    if (usersInSameRoom.length === 0 || usersInSameRoom.find(s => s.isHost) === undefined) {
      firebase.database().ref('/rooms/' + socket.roomId).remove();
      for (let socket in socketList) {
        socketList[socket].emit('hostLeft');
      }
    }

    updateCurrentPlayersInRoom(socket.roomId);
  });

  socket.on('lockedSlots', (lockedSlots, roomId) => {
    currentLockedSlots[roomId] = lockedSlots;
    for (let socket in socketList) {
      if (socketList[socket].roomId === roomId) {
        socketList[socket].emit('updatedLockedSlots', lockedSlots);
      }
    }
  });

  socket.on('updateAvatar', (userUid, avatar) => {
    socketList[userUid].avatar = avatar;
    const roomId = socketList[userUid].roomId;
    setPlayers(roomId);
  });

  socket.on('sendMessage', (roomId, msg) => {
    addNewMessage(roomId, msg);
  });

  const updateCurrentPlayersInRoom = roomId => {
    const updates = {};
    updates[`rooms/${roomId}/currentNumberOfPlayers`] = Object.values(socketList).filter(s => s.roomId === roomId).length;
    firebase.database().ref().update(updates);

    setPlayers(roomId);
  }

  const addNewMessage = (roomId, msg) => {
    if (msg.uid && msg.uid !== 'SERVER') {
      msg.color = socketList[msg.uid].color.mainColor;
    }
    msg.roomId = roomId;
    messages.push(msg);

    for (let currentSocket in socketList) {
      if (socketList[currentSocket].roomId === roomId) {
        const allMessages = messages.filter(msg => msg.roomId === roomId);
        socketList[currentSocket].emit('messagesUpdated', allMessages);
      }
    }
  }
});