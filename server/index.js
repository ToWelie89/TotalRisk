'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const { PLAYER_COLORS, avatars } = require('./../js/player/playerConstants');
const { getRandomInteger } = require('./../js/helpers');
const GameEngine = require('./../js/gameEngine');

const PORT = process.env.PORT || 5000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
    .get('/', (req, res, next) => {
        res.sendFile(INDEX)
    })
    .get('/lobbies', function (req, res, next) {
        res.send({msg: 'test'})
    })
    .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);

let lobbiesSocketList = [];
let games = [];

let gameSocketList = {};
let messages = [];

/*const games = [{
    id: 42738942,
    messages: [],
    playerIds: [],
    messages: [],
    currentLockedSlots: [],
    timer: {
        turnTimerSeconds,
        turnTimerFunction,
        turnTimer
    }
}]*/

let turnTimerSeconds;
let turnTimerFunction;
let turnTimer;

const updatePlayersInRoom = () => {
  lobbiesSocketList.forEach(s => {
    s.emit('currentLobbies', games);
  });
}

const getRandomUnusedColor = roomId => {
  const game = games.find(game => game.id === roomId);
  const usedColors = game.players.map(socket => socket.color);
  const allColors = Array.from(Object.keys(PLAYER_COLORS).map((key, index) => PLAYER_COLORS[key]));

  const availableColors = allColors.filter(color => !usedColors.includes(color));

  const colorToReturn = availableColors[getRandomInteger(0, (availableColors.length - 1))];
  return colorToReturn;
}

const getUnusedAvatar = roomId => {
  const game = games.find(game => game.id === roomId);
  const usedAvatars = game.players.map(socket => socket.avatar);
  const allAvatars = Array.from(Object.keys(avatars).map((key, index) => avatars[key]));
  const availableAvatars = allAvatars.filter(avatar => !usedAvatars.includes(avatar));

  const avatarToReturn = availableAvatars[getRandomInteger(0, (availableAvatars.length - 1))];
  return avatarToReturn;
}

const addNewMessage = (roomId, msg) => {
  const game = games.find(game => game.id === roomId);
  if (msg.uid && msg.uid !== 'SERVER') {
    const player = game.players.find(player => player.userUid === msg.uid);
    msg.color = player.color.mainColor;
  }
  game.messages.push(msg);

  for (let playerSocket in game.players) {
    playerSocket.emit('messagesUpdated', game.messages);
  }
}

const setPlayers = (roomId) => {
  const game = games.find(game => game.id === roomId);
  for (let playerSocket in game.players) {
    playerSocket.emit('updatedPlayers', game.players);
  }
}

io
.of('lobbies')
.on('connection', (socket) => {
    lobbiesSocketList.push(socket);

    socket.emit('currentLobbies', games);

    socket.on('createNewRoom', newRoom => {
        newRoom.players = [];
        newRoom.currentLockedSlots = [];
        games.push(newRoom);
        lobbiesSocketList.forEach(s => {
            s.emit('currentLobbies', games);
        });
        socket.emit('createNewRoomResponse', newRoom);
    });

    socket.on('setMaxNumberOfPlayers', (maxAmount, roomId) => {
        games.find(lobby => lobby.id === roomId).maxNumberOfPlayer = maxAmount;
        lobbiesSocketList.forEach(s => {
            s.emit('currentLobbies', games);
        });
    });
});

io
.of('game')
.on('connection', (socket) => {
    socket.on('disconnect', reason => {
      const game = games.find(game => game.id === roomId);

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

      game.players = game.players.filter(player => player.userUid !== socket.userUid);

      if (game.players.length === 0) {
        games = games.filter(game => game.id !== socket.roomId);
        lobbiesSocketList.forEach(s => {
          s.emit('currentLobbies', games);
        });
      }

      if (game.players.length === 0 || game.players.find(player => player.isHost) === undefined) {
        // Host left
        games = games.filter(game => game.id !== socket.roomId);
        lobbiesSocketList.forEach(s => {
            s.emit('currentLobbies', games);
        });
        for (let playerSocket in game.players) {
          playerSocket.emit('hostLeft');
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
      socket.color = getRandomUnusedColor(roomId);
      socket.avatar = getUnusedAvatar(roomId);

      const game = games.find(game => game.id === roomId);

      game.players.push(socket);

      socket.emit('updatedLockedSlots', game.currentLockedSlots);

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

      updatePlayersInRoom(roomId)
    });

    socket.on('lockedSlots', (lockedSlots, roomId) => {
      const game = games.find(game => game.id === roomId);
      game.currentLockedSlots = lockedSlots;
      for (let socket in game.players) {
        gameSocketList[socket].emit('updatedLockedSlots', lockedSlots);
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