'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const { PLAYER_COLORS, PLAYER_TYPES, avatars } = require('./../js/player/playerConstants');
const { getRandomInteger } = require('./../js/helpers');
const { getTerritoryByName } = require('./../js/map/mapHelpers');
const { VICTORY_GOALS, TURN_PHASES, TURN_LENGTHS } = require('./../js/gameConstants');
const GameEngine = require('./../js/gameEngine');
const Player = require('./../js/player/player');

const PORT = process.env.PORT || 5000;
const INDEX = path.join(__dirname, 'index.html');

const states = {
  LOBBY: 'LOBBY',
  IN_GAME: 'IN_GAME',
  RESULT_SCREEN: 'RESULT_SCREEN'
};

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

const updateLobbies = () => {
  lobbiesSocketList.forEach(s => {
    s.emit('currentLobbies', games.map(game => ({
      id: game.id,
      roomName: game.roomName,
      password: game.password,
      creationTimestamp: game.creationTimestamp,
      creator: game.creator,
      creatorUid: game.creatorUid,
      maxNumberOfPlayer: game.maxNumberOfPlayer,
      version: game.version,
      map: game.map,
      state: game.state,
      players: game.players.map(p => ({}))
    })));
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

  game.players.forEach(playerSocket => {
    playerSocket.emit('messagesUpdated', game.messages);
  })
}

const setPlayers = (roomId) => {
  const game = games.find(game => game.id === roomId);

  if (game) {
    game.players.forEach(playerSocket => {
      playerSocket.emit('updatedPlayers', game.players.map(p => ({
        userUid: p.userUid,
        userName: p.userName,
        isHost: p.isHost,
        color: p.color,
        avatar: p.avatar
      })));
    });
  }
}

const startTimer = roomId => {
  const game = games.find(game => game.id === roomId);
  if (game.timer && game.timer.turnTimer) {
    clearInterval(game.timer.turnTimer);
  }
  game.timer.turnTimerSeconds = game.turnLength + 2;
  game.timer.turnTimerFunction = () => {
      game.timer.turnTimerSeconds--;
      if (game.timer.turnTimerSeconds <= 0) {
        skipToNextPlayer(roomId);
      }
  };
  game.timer.turnTimer = setInterval(game.timer.turnTimerFunction, 1000);
}

const skipToNextPlayer = roomId => {
  console.log('Skipping to next player due to time being up');
  const game = games.find(game => game.id === roomId);
  clearInterval(game.timer.turnTimer);
  let turn = { newPlayer: false };

  while(!turn.newPlayer) {
    turn = game.gameEngine.nextTurn();
  }

  game.players.forEach(player => {
    player.emit('nextTurnNotifier', turn, game.gameEngine.troopsToDeploy);
  });

  game.timer.turnTimerSeconds = game.turnLength + 2;
  game.timer.turnTimer = setInterval(game.timer.turnTimerFunction, 1000);
}

io
.of('lobbies')
.on('connection', (socket) => {
    lobbiesSocketList.push(socket);

    updateLobbies();

    socket.on('createNewRoom', newRoom => {
      newRoom.chosenGoal = VICTORY_GOALS[VICTORY_GOALS.length - 1];
      newRoom.players = [];
      newRoom.messages = [];
      newRoom.currentLockedSlots = [];
      newRoom.timer = {};
      newRoom.state = states.LOBBY;
      newRoom.turnLength = TURN_LENGTHS[1];
      games.push(newRoom);
      updateLobbies();
      socket.emit('createNewRoomResponse', newRoom);
    });

    socket.on('setMaxNumberOfPlayers', (maxAmount, roomId) => {
      games.find(game => game.id === roomId).maxNumberOfPlayer = maxAmount;
      updateLobbies();
    });
});

io
.of('game')
.on('connection', (socket) => {
    socket.on('disconnect', reason => {
      const game = games.find(game => game.id === socket.roomId);

      console.log('Got disconnected because of reason ', reason);
      if (game && game.timer && game.timer.turnTimer) {
        clearInterval(game.timer.turnTimer);
      }

      if (reason === 'transport close') {
        // User was disconnected by closing game/refrehsing window
        addNewMessage(socket.roomId, {
          sender: 'SERVER',
          uid: 'SERVER',
          message: `${socket.userName} left the room`,
          timestamp: Date.now()
        });
      }

      if (game) {
        game.players = game.players.filter(player => player.userUid !== socket.userUid);
      }

      if (game && game.players.length === 0) {
        clearInterval(game.timer.turnTimer);
        games = games.filter(game => game.id !== socket.roomId);
      }

      if (game && (game.players.length === 0 || game.players.find(player => player.isHost) === undefined)) {
        // Host left
        clearInterval(game.timer.turnTimer);
        game.players.forEach(playerSocket => {
          playerSocket.emit('hostLeft');
        });
        games = games.filter(game => game.id !== socket.roomId);
      }

      updateLobbies();

      setPlayers(socket.roomId);
    });

    socket.on('sendMessage', (roomId, msg) => {
      addNewMessage(roomId, msg);
    });

    socket.on('updateAvatar', (roomId, userUid, avatar) => {
      const game = games.find(game => game.id === roomId);
      const player = game.players.find(player => player.userUid === userUid);
      player.avatar = avatar;
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

      game.players.forEach(player => {
        player.emit('updatedPlayers', game.players.map(p => ({
          userUid: p.userUid,
          userName: p.userName,
          isHost: p.isHost,
          color: p.color,
          avatar: p.avatar
        })));

        player.emit('setGoalNotifier', game.chosenGoal);
        player.emit('setTurnLengthNotifier', game.turnLength);
      });

      updateLobbies(roomId);
    });

    socket.on('setGoal', (roomId, chosenGoal) => {
      const game = games.find(game => game.id === roomId);
      game.chosenGoal = chosenGoal;

      game.players.forEach(playerSocket => {
        playerSocket.emit('setGoalNotifier', game.chosenGoal);
      });
    });

    socket.on('setTurnLength', (roomId, turnLength) => {
      const game = games.find(game => game.id === roomId);
      game.turnLength = turnLength;

      game.players.forEach(playerSocket => {
        playerSocket.emit('setTurnLengthNotifier', game.turnLength);
      });
    });

    socket.on('lockedSlots', (lockedSlots, roomId) => {
      const game = games.find(game => game.id === roomId);
      game.currentLockedSlots = lockedSlots;
      game.players.forEach(playerSocket => {
        playerSocket.emit('updatedLockedSlots', game.currentLockedSlots);
      });
    });

    socket.on('kickPlayer', (roomId, userUid) => {
      const game = games.find(game => game.id === roomId);
      const player = game.players.find(player => player.userUid === userUid);
      addNewMessage(socket.roomId, {
        sender: 'SERVER',
        uid: 'SERVER',
        message: `${player.userName} was kicked from room`,
        timestamp: Date.now()
      });

      player.emit('kicked');
      game.players = game.players.filter(player => player.userUid !== userUid);

      setPlayers(roomId);
      updateLobbies(roomId);
    });

    // GAME EVENTS

    socket.on('startGame', (roomId) => {
      const game = games.find(game => game.id === roomId);

      game.state = states.IN_GAME;

      updateLobbies();

      game.gameEngine = new GameEngine({}, {});

      const playerList = game.players.map(x => new Player(
        x.userName,
        x.color,
        x.avatar,
        PLAYER_TYPES.HUMAN,
        x.userUid,
        x.isHost
      ));

      game.gameEngine.startGame(playerList, game.chosenGoal);

      startTimer(game.id);

      game.players.forEach(player => {
        player.emit('gameStarted', playerList, game.chosenGoal, game.gameEngine.map.getAllTerritoriesAsList(), game.gameEngine.turn, game.gameEngine.troopsToDeploy);
      });

      addNewMessage(socket.roomId, {
        sender: 'SERVER',
        uid: 'SERVER',
        message: `GAME STARTED!`,
        timestamp: Date.now()
      });
    });

    socket.on('troopAddedToTerritory', (territoryName) => {
      const game = games.find(game => game.id === socket.roomId);

      getTerritoryByName(game.gameEngine.map, territoryName).numberOfTroops++;

      game.players.forEach(player => {
        player.emit('troopAddedToTerritoryNotifier', territoryName);
      });
    });

    socket.on('nextTurn', () => {
      const game = games.find(game => game.id === socket.roomId);

      const turn = game.gameEngine.nextTurn();
      let reinforcements = 0;
      if (turn.turnPhase === TURN_PHASES.DEPLOYMENT) {
        reinforcements = game.gameEngine.troopsToDeploy;
      }

      if (turn.newPlayer) {
        startTimer();
      }

      game.players.forEach(player => {
        player.emit('nextTurnNotifier', turn, reinforcements);
      });
    });

    socket.on('battleFought', (battleData) => {
      const game = games.find(game => game.id === socket.roomId);

      getTerritoryByName(game.gameEngine.map, battleData.attackerTerritory).numberOfTroops = battleData.attackerNumberOfTroops;
      getTerritoryByName(game.gameEngine.map, battleData.defenderTerritory).numberOfTroops = battleData.defenderNumberOfTroops;

      game.players.forEach(player => {
        player.emit('battleFoughtNotifier', battleData);
      });
    });

    socket.on('updateOwnerAfterSuccessfulInvasion', (updateOwnerData) => {
      const game = games.find(game => game.id === socket.roomId);

      getTerritoryByName(game.gameEngine.map, updateOwnerData.attackerTerritory).numberOfTroops = updateOwnerData.attackerTerritoryNumberOfTroops;
      getTerritoryByName(game.gameEngine.map, updateOwnerData.defenderTerritory).numberOfTroops = updateOwnerData.defenderTerritoryNumberOfTroops;
      getTerritoryByName(game.gameEngine.map, updateOwnerData.defenderTerritory).owner = updateOwnerData.owner;

      game.players.forEach(player => {
        player.emit('updateOwnerAfterSuccessfulInvasionNotifier', updateOwnerData);
      });

      const response = game.gameEngine.checkIfPlayerWonTheGame();
      if (response.playerWon) {
        game.players.forEach(player => {
          player.emit('playerWonNotifier');
        });
      }
    });

    socket.on('updateMovement', (movementFromTerritoryName, movementFromTerritoryNumberOfTroops, movementToTerritoryName, movementToTerritoryNumberOfTroops) => {
      const game = games.find(game => game.id === socket.roomId);

      getTerritoryByName(game.gameEngine.map, movementFromTerritoryName).numberOfTroops = movementFromTerritoryNumberOfTroops;
      getTerritoryByName(game.gameEngine.map, movementToTerritoryName).numberOfTroops = movementToTerritoryNumberOfTroops;

      game.players.forEach(player => {
        player.emit('updateMovementNotifier', game.gameEngine.map.getAllTerritoriesAsList());
      });
    });
});