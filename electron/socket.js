const firebase = require('firebase');
const { getRandomInteger } = require('./../js/helpers');
const { PLAYER_COLORS, avatars, PLAYER_TYPES } = require('./../js/player/playerConstants');
const Player = require('./../js/player/player');
const GameEngine = require('./../js/gameEngine');
const FirebaseSettings = require('./../js/firebaseSettings');
const { VICTORY_GOALS, TURN_PHASES } = require('./../js/gameConstants');
const { getTerritoryByName } = require('./../js/map/mapHelpers');

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

let turnTimerSeconds;
let turnTimerFunction;
let turnTimer;

const turnLength = 62;

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

const skipToNextPlayer = () => {
  console.log('Skipping to next player due to time being up');
  clearInterval(turnTimer);
  let turn = { newPlayer: false };

  while(!turn.newPlayer) {
    turn = gameEngine.nextTurn();
  }

  for (let currentSocket in socketList) {
    socketList[currentSocket].emit('nextTurnNotifier', turn, gameEngine.troopsToDeploy);
  }

  turnTimerSeconds = turnLength;
  turnTimer = setInterval(turnTimerFunction, 1000);
}

const startTimer = () => {
  clearInterval(turnTimer);
  turnTimerSeconds = turnLength;
  turnTimerFunction = () => {
      turnTimerSeconds--;
      if (turnTimerSeconds <= 0) {
        skipToNextPlayer();
      }
  };
  turnTimer = setInterval(turnTimerFunction, 1000);
}

io.on('connection', function(socket){
  console.log('User connected!');
  socket.emit('connected');
  messages = [];

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

    startTimer();

    for (let currentSocket in socketList) {
      socketList[currentSocket].emit('gameStarted', playerList, victoryGoal, gameEngine.map.getAllTerritoriesAsList(), gameEngine.turn, gameEngine.troopsToDeploy);
    }

    addNewMessage(socket.roomId, {
      sender: 'SERVER',
      uid: 'SERVER',
      message: `GAME STARTED!`,
      timestamp: Date.now()
    });
  });

  socket.on('troopAddedToTerritory', (territoryName, senderUid) => {
    getTerritoryByName(gameEngine.map, territoryName).numberOfTroops++;

    for (let currentSocket in socketList) {
      if (socketList[currentSocket].userUid !== senderUid) {
        socketList[currentSocket].emit('troopAddedToTerritoryNotifier', territoryName);
      }
    }
  });

  socket.on('nextTurn', () => {
    const turn = gameEngine.nextTurn();
    let reinforcements = 0;
    if (turn.turnPhase === TURN_PHASES.DEPLOYMENT) {
      reinforcements = gameEngine.troopsToDeploy;
    }

    if (turn.newPlayer) {
      startTimer();
    }

    for (let currentSocket in socketList) {
      socketList[currentSocket].emit('nextTurnNotifier', turn, reinforcements);
    }
  });

  socket.on('battleFought', (battleData) => {
    getTerritoryByName(gameEngine.map, battleData.attackerTerritory).numberOfTroops = battleData.attackerNumberOfTroops;
    getTerritoryByName(gameEngine.map, battleData.defenderTerritory).numberOfTroops = battleData.defenderNumberOfTroops;

    for (let currentSocket in socketList) {
      socketList[currentSocket].emit('battleFoughtNotifier', battleData);
    }
  });

  socket.on('updateOwnerAfterSuccessfulInvasion', (updateOwnerData) => {
    getTerritoryByName(gameEngine.map, updateOwnerData.attackerTerritory).numberOfTroops = updateOwnerData.attackerTerritoryNumberOfTroops;
    getTerritoryByName(gameEngine.map, updateOwnerData.defenderTerritory).numberOfTroops = updateOwnerData.defenderTerritoryNumberOfTroops;
    getTerritoryByName(gameEngine.map, updateOwnerData.defenderTerritory).owner = updateOwnerData.owner;

    for (let currentSocket in socketList) {
      socketList[currentSocket].emit('updateOwnerAfterSuccessfulInvasionNotifier', updateOwnerData);
    }
  });

  socket.on('updateMovement', (movementFromTerritoryName, movementFromTerritoryNumberOfTroops, movementToTerritoryName, movementToTerritoryNumberOfTroops) => {
    getTerritoryByName(gameEngine.map, movementFromTerritoryName).numberOfTroops = movementFromTerritoryNumberOfTroops;
    getTerritoryByName(gameEngine.map, movementToTerritoryName).numberOfTroops = movementToTerritoryNumberOfTroops;

    for (let currentSocket in socketList) {
      socketList[currentSocket].emit('updateMovementNotifier', gameEngine.map.getAllTerritoriesAsList());
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
    console.log('Player kicked = require(lobby');

    addNewMessage(socket.roomId, {
      sender: 'SERVER',
      uid: 'SERVER',
      message: `${socketList[userUid].userName} was kicked = require(the room`,
      timestamp: Date.now()
    });

    socketList[userUid].emit('kicked');
    delete socketList[userUid];

    updateCurrentPlayersInRoom(roomId);
  });

  socket.on('disconnect', reason => {
    console.log('Got disconnected because of reason ', reason);
    clearInterval(turnTimer);

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

  socket.on('getMessages', () => {
    for (let currentSocket in socketList) {
      socketList[currentSocket].emit('messagesUpdated', messages);
    }
  });

  const updateCurrentPlayersInRoom = roomId => {
    const updates = {};
    updates[`rooms/${roomId}/currentNumberOfPlayers`] = Object.values(socketList).filter(s => s.roomId === roomId).length;
    firebase.database().ref().update(updates);

    setPlayers(roomId);
  }

  const addNewMessage = (roomId, msg) => {
    console.log('roomId', roomId)
    console.log('msg', msg)
    if (msg.uid && msg.uid !== 'SERVER') {
      msg.color = socketList[msg.uid].color.mainColor;
    }
    msg.roomId = roomId;
    messages.push(msg);

    for (let currentSocket in socketList) {
      socketList[currentSocket].emit('messagesUpdated', messages);
    }
  }
});