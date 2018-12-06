const { PLAYER_COLORS, avatars } = require('./../js/player/playerConstants');
const { getRandomInteger } = require('./../js/helpers');

const GameEngine = require('./../js/gameEngine');

let gameSocketList = {};
let messages = [];
let currentLockedSlots = {};

let turnTimerSeconds;
let turnTimerFunction;
let turnTimer;

const getRandomUnusedColor = () => {
  const usedColors = Object.values(gameSocketList).map(socket => socket.color);
  const allColors = Array.from(Object.keys(PLAYER_COLORS).map((key, index) => PLAYER_COLORS[key]));

  const availableColors = allColors.filter(color => !usedColors.includes(color));

  const colorToReturn = availableColors[getRandomInteger(0, (availableColors.length - 1))];
  return colorToReturn;
}

const getUnusedAvatar = () => {
  const usedAvatars = Object.values(gameSocketList).map(socket => socket.avatar);
  const allAvatars = Array.from(Object.keys(avatars).map((key, index) => avatars[key]));
  const availableAvatars = allAvatars.filter(avatar => !usedAvatars.includes(avatar));

  const avatarToReturn = availableAvatars[getRandomInteger(0, (availableAvatars.length - 1))];
  return avatarToReturn;
}

const addNewMessage = (roomId, msg) => {
  if (msg.uid && msg.uid !== 'SERVER') {
    msg.color = gameSocketList[msg.uid].color.mainColor;
  }
  msg.roomId = roomId;
  messages.push(msg);

  for (let currentSocket in gameSocketList) {
    gameSocketList[currentSocket].emit('messagesUpdated', messages);
  }
}

const setPlayers = (roomId) => {
  const currentPlayersInRoom = Object.values(gameSocketList).filter(s => s.roomId === roomId).map(x => ({
    userUid: x.userUid,
    userName: x.userName,
    isHost: x.isHost,
    color: x.color,
    avatar: x.avatar
  }));

  for (let socket in gameSocketList) {
    if (gameSocketList[socket].roomId === roomId) {
      gameSocketList[socket].emit('updatedPlayers', currentPlayersInRoom);
    }
  }
}

exports = module.exports = (io, lobbies) => {
    io
    .of('game')
    .on('connection', (socket) => {

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

          delete gameSocketList[socket.userUid];

          const usersInSameRoom = Object.values(gameSocketList).filter(s => s.roomId === socket.roomId);

          if (usersInSameRoom.length === 0) {
            messages = [];
          }

          if (usersInSameRoom.length === 0 || usersInSameRoom.find(s => s.isHost) === undefined) {
            // remove room
            // firebase.database().ref('/rooms/' + socket.roomId).remove();
            for (let socket in gameSocketList) {
              gameSocketList[socket].emit('hostLeft');
            }
          }

          setPlayers(socket.roomId);
        });

        socket.on('sendMessage', (roomId, msg) => {
          addNewMessage(roomId, msg);
        });

        socket.on('updateAvatar', (userUid, avatar) => {
          gameSocketList[userUid].avatar = avatar;
          const roomId = gameSocketList[userUid].roomId;
          setPlayers(roomId);
        });

        socket.on('setUser', (userUid, userName, roomId, isHost) => {
          socket.userUid = userUid;
          socket.userName = userName;
          socket.roomId = roomId;
          socket.isHost = isHost;
          socket.color = getRandomUnusedColor();
          socket.avatar = getUnusedAvatar();

          if (currentLockedSlots[roomId]) {
            socket.emit('updatedLockedSlots', currentLockedSlots[roomId]);
          }

          gameSocketList[userUid] = socket;
          const currentPlayersInRoom = Object.values(gameSocketList).filter(s => s.roomId === roomId).map(x => ({
            userUid: x.userUid,
            userName: x.userName,
            isHost: x.isHost,
            color: x.color,
            avatar: x.avatar
          }));

          for (let socket in gameSocketList) {
            if (gameSocketList[socket].roomId === roomId) {
              gameSocketList[socket].emit('updatedPlayers', currentPlayersInRoom);
            }
          }

          lobbies.updatePlayersInRoom(roomId, currentPlayersInRoom.length)
        });

        socket.on('lockedSlots', (lockedSlots, roomId) => {
          currentLockedSlots[roomId] = lockedSlots;
          for (let socket in gameSocketList) {
            if (gameSocketList[socket].roomId === roomId) {
              gameSocketList[socket].emit('updatedLockedSlots', lockedSlots);
            }
          }
        });

        socket.on('kickPlayer', (roomId, userUid) => {
          addNewMessage(socket.roomId, {
            sender: 'SERVER',
            uid: 'SERVER',
            message: `${gameSocketList[userUid].userName} was kicked from room`,
            timestamp: Date.now()
          });

          gameSocketList[userUid].emit('kicked');
          delete gameSocketList[userUid];

          setPlayers(roomId);
        });

        socket.on('startGame', chosenGoal => {
          //currentState = states.IN_GAME;

          // FIX!!!

          /*const playerList = Object.values(gameSocketList).map(x => new Player(
            x.userName,
            x.color,
            x.avatar,
            PLAYER_TYPES.HUMAN,
            x.userUid,
            x.isHost
          ));

          gameEngine.startGame(playerList, chosenGoal);

          startTimer();

          for (let currentSocket in gameSocketList) {
            gameSocketList[currentSocket].emit('gameStarted', playerList, chosenGoal, gameEngine.map.getAllTerritoriesAsList(), gameEngine.turn, gameEngine.troopsToDeploy);
          }

          addNewMessage(socket.roomId, {
            sender: 'SERVER',
            uid: 'SERVER',
            message: `GAME STARTED!`,
            timestamp: Date.now()
          });*/
        });
    });
}