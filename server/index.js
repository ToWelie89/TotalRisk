'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const { PLAYER_COLORS, PLAYER_TYPES, avatars } = require('./../js/player/playerConstants');
const { getRandomInteger, randomIntFromInterval, delay } = require('./../js/helpers');
const { getTerritoryByName } = require('./../js/map/mapHelpers');
const { VICTORY_GOALS, TURN_PHASES, TURN_LENGTHS } = require('./../js/gameConstants');
const GameEngine = require('./../js/gameEngine');
const AiHandler = require('./../js/ai/aiHandler');
const Player = require('./../js/player/player');
const Card = require('./../js/card/card');

const PORT = process.env.PORT || 5000;
const MAIN_INDEX = path.join(__dirname, '../index.html');
const TEST_INDEX = path.join(__dirname, 'test.html');

const states = {
  LOBBY: 'LOBBY',
  IN_GAME: 'IN_GAME',
  RESULT_SCREEN: 'RESULT_SCREEN'
};

var app = module.exports.app = express();

app.use('/js', express.static(path.join(__dirname, '../js')));
app.use('/assetsDist', express.static(path.join(__dirname, '../assetsDist')));
app.use('/node_modules/', express.static(path.join(__dirname, '../node_modules/')));
app.use('/cssLibs/', express.static(path.join(__dirname, '../cssLibs/')));
app.use('/src/', express.static(path.join(__dirname, '../src/')));
app.use('/assets/', express.static(path.join(__dirname, '../assets/')));
app.use('/audio/', express.static(path.join(__dirname, '../audio/')));
app.use('/package.json', express.static(path.join(__dirname, '../package.json')));
app.use('/icon.ico', express.static(path.join(__dirname, '../icon.ico')));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', (req, res, next) => {
  res.sendFile(MAIN_INDEX)
});
app.get('/debug', (req, res, next) => {
  res.sendFile(TEST_INDEX)
});
app.post('/lobbies/playerCanJoinRoom', (req, res, next) => {
  const game = games.find(game => game.id === Number(req.body.lobbyId));
  if (game) {
    const player = game.players.find(player => player.userUid === req.body.userUid);
    if (player) {
      // User already exists in room
      res.send({ userExistsInRoom: true });
    } else {
      res.send({ userExistsInRoom: false });
    }
  } else {
    res.send({ userExistsInRoom: false });
  }
});

const server = http.createServer(app);
const io = socketIO.listen(server);  //pass a http.Server instance
server.listen(PORT, () => console.log(`Listening on ${ PORT }`));

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
      players: game.players.map(p => ({ userName: p.userName, userUid: p.userUid })),
      turnLength: game.turnLength,
      aiSpeed: game.aiSpeed,
      chosenGoal: game.chosenGoal
    })));
  });
};

const getRandomUnusedColor = roomId => {
  const game = games.find(game => game.id === roomId);
  const usedColors = game.players.map(socket => socket.color);
  const allColors = Array.from(Object.keys(PLAYER_COLORS).map((key, index) => PLAYER_COLORS[key]));

  const availableColors = allColors.filter(color => !usedColors.includes(color));

  const colorToReturn = availableColors[getRandomInteger(0, (availableColors.length - 1))];
  return colorToReturn;
};

const getUnusedAvatar = roomId => {
  const game = games.find(game => game.id === roomId);
  const usedAvatars = game.players.map(socket => socket.avatar);
  const allAvatars = Array.from(Object.keys(avatars).map((key, index) => ({ name: key, avatar: avatars[key] })));
  const availableAvatars = allAvatars.filter(avatar => !usedAvatars.includes(avatar.avatar));

  const avatarToReturn = availableAvatars[getRandomInteger(0, (availableAvatars.length - 1))];
  return avatarToReturn;
};

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
};

const setPlayers = (roomId) => {
  const game = games.find(game => game.id === roomId);

  if (game) {
    game.players.forEach(playerSocket => {
      playerSocket.emit('updatedPlayers', game.players.map(p => ({
        userUid: p.userUid,
        userName: p.userName,
        isHost: p.isHost,
        color: p.color,
        avatar: p.avatar,
        ai: p.ai
      })));
    });
  }
};

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
};

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
    player.emit('skipToNextPlayer');
  });

  if (turn.newPlayer && turn.player.type === PLAYER_TYPES.HUMAN) {
    startTimer(game.id);
  } else {
    handleAi(game);
  }
};

const nextTurn = roomId => {
  const game = games.find(game => game.id === roomId);

  const turn = game.gameEngine.nextTurn();
  let reinforcements = 0;
  if (turn.turnPhase === TURN_PHASES.DEPLOYMENT) {
    reinforcements = game.gameEngine.troopsToDeploy;
  }

  if (turn.newPlayer && turn.player.type === PLAYER_TYPES.HUMAN) {
    startTimer(game.id);
  }

  game.players.forEach(player => {
    player.emit('nextTurnNotifier', turn, reinforcements);
  });

  if (turn.player.type === PLAYER_TYPES.AI) {
    handleAi(game);
  }
};

const handleAi = game => {
  game.aiHandler = new AiHandler(game.gameEngine, {}, {
    updateMap: filter => {
      console.log('update map in multiplayer ai handler')
      updateMapState(game.id);
    }
  }, {});
  game.aiHandler.multiplayerMode = true;

  clearInterval(game.timer.turnTimer);
  game.aiHandler.updateCallback = () => {
      // do something
  };

  let speed;

  if (game.aiSpeed === 'Fast') {
    speed = 100;
  } else if (game.aiSpeed === 'Medium') {
    speed = 400;
  } else {
    speed = 800;
  }

  game.aiHandler.DELAY_BETWEEN_EACH_TROOP_DEPLOY = speed;
  game.aiHandler.DELAY_BETWEEN_EACH_BATTLE = speed;
  game.aiHandler.DELAY_BEFORE_MOVE = speed;

  delay(1500)
  .then(() => game.aiHandler.turnInCards((userUid, newHand, newTroops) => {
    game.players.forEach(player => {
      player.emit('updatedCardsForPlayer', userUid, newHand);
      player.emit('newReinforcements', newTroops);
    });
  }))
  .then(() => game.aiHandler.contemplateAlternativesForAttack())
  .then(() => game.aiHandler.deployTroops((territoryName) => {
      game.players.forEach(player => {
        player.emit('troopAddedToTerritoryNotifier', territoryName);
      });
  }))
  .then(() => {
    game.gameEngine.nextTurn();
    game.players.forEach(player => {
      player.emit('nextTurnNotifier', game.gameEngine.turn);
    });
  })
  .then(() => game.aiHandler.attackTerritories((battleData) => {
      game.players.forEach(player => {
        player.emit('battleFoughtNotifier', battleData);
      });
  }, (userUid, newHand) => {
    game.players.forEach(player => {
      player.emit('updatedCardsForPlayer', userUid, newHand);
    });
  }))
  .then(() => {
    game.gameEngine.nextTurn();
    game.players.forEach(player => {
      player.emit('nextTurnNotifier', game.gameEngine.turn);
    });
  })
  .then(() => game.aiHandler.movementPhase())
  .then(() => {
      updateMapState(game.id);
      nextTurn(game.id);
  })
  .catch((reason) => {
      if (reason === 'playerWon') {
          console.log('GAME OVER!');

          const stats = game.players.map(player => ({
            name: player.name,
            uid: player.userUid,
            statistics: game.gameEngine.players.get(player.name).statistics
          }));

          game.players.forEach(player => {
            player.emit('playerWonNotifier', stats);
          });
      } else {
          console.log('AI error', reason);
      }
  });
}

const updateMapState = roomId => {
  const game = games.find(game => game.id === roomId);

  const territories = [];
  game.gameEngine.map.getAllTerritoriesAsList().forEach(t => {
    territories.push({
      name: t.name,
      owner: t.owner,
      numberOfTroops: t.numberOfTroops
    });
  });

  game.players.forEach(player => {
    player.emit('updateMapState', territories);
  });
};

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
      newRoom.turnLength = TURN_LENGTHS[2];
      newRoom.aiSpeed = 'Fast';
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

    socket.on('setPlayerColor', (roomId, userUid, colorName) => {
      const game = games.find(game => game.id === roomId);
      const player = game.players.find(player => player.userUid === userUid);

      const playerWithColor = game.players.find(player => player.color.name === colorName);
      if (!playerWithColor) {
        // No player has the chosen color, it is available
        player.color = Object.values(PLAYER_COLORS).find(x => x.name === colorName);
        setPlayers(roomId);
      }
    });

    socket.on('updateAvatar', (roomId, userUid, avatar) => {
      const game = games.find(game => game.id === roomId);
      const player = game.players.find(player => player.userUid === userUid);
      player.avatar = avatar;
      setPlayers(roomId);
    });

    socket.on('setUser', (userUid, userName, roomId, isHost, chosenAvatar) => {
      const game = games.find(game => game.id === roomId);
      const usedAvatars = game.players.map(socket => socket.avatar.id);

      socket.userUid = userUid;
      socket.userName = userName;
      socket.roomId = roomId;
      socket.isHost = isHost;
      socket.ai = false;
      socket.color = getRandomUnusedColor(roomId);
      socket.avatar = (chosenAvatar && !usedAvatars.includes(chosenAvatar.id)) ? chosenAvatar : getUnusedAvatar(roomId).avatar;

      game.players.push(socket);

      socket.emit('updatedLockedSlots', game.currentLockedSlots);

      setPlayers(roomId);

      game.players.forEach(player => {
        player.emit('setGoalNotifier', game.chosenGoal);
        player.emit('setTurnLengthNotifier', game.turnLength);
        player.emit('setAiSpeedNotifier', game.aiSpeed);
      });

      updateLobbies(roomId);
    });

    socket.on('setGoal', (roomId, chosenGoal) => {
      const game = games.find(game => game.id === roomId);
      game.chosenGoal = chosenGoal;

      game.players.forEach(playerSocket => {
        playerSocket.emit('setGoalNotifier', game.chosenGoal);
      });

      updateLobbies();
    });

    socket.on('setTurnLength', (roomId, turnLength) => {
      const game = games.find(game => game.id === roomId);
      game.turnLength = turnLength;

      game.players.forEach(playerSocket => {
        playerSocket.emit('setTurnLengthNotifier', game.turnLength);
      });

      updateLobbies();
    });

    socket.on('setAiSpeed', (roomId, aiSpeed) => {
      const game = games.find(game => game.id === roomId);
      game.aiSpeed = aiSpeed;

      game.players.forEach(playerSocket => {
        playerSocket.emit('setAiSpeedNotifier', game.aiSpeed);
      });

      updateLobbies();
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

    socket.on('addAiPlayer', (roomId) => {
      const game = games.find(game => game.id === roomId);

      const avatar = getUnusedAvatar(roomId);

      game.players.push({
        userName: avatar.name,
        avatar: avatar.avatar,
        color: getRandomUnusedColor(roomId),
        ai: true,
        emit: () => {},
        userUid: randomIntFromInterval(10000000000000, 99999999999999)
      });

      setPlayers(roomId);
      updateLobbies(roomId);
    });

    // GAME EVENTS

    socket.on('startGame', (roomId) => {
      const game = games.find(game => game.id === roomId);

      game.state = states.IN_GAME;

      updateLobbies();

      game.gameEngine = new GameEngine({}, {}, {
        playSound: false
      });

      const playerList = game.players.map(x => new Player(
        x.userName,
        x.color,
        x.avatar,
        x.ai ? PLAYER_TYPES.AI : PLAYER_TYPES.HUMAN,
        x.userUid,
        x.isHost
      ));

      game.gameEngine.startGame(playerList, game.chosenGoal);

      startTimer(game.id);

      const territories = [];
      game.gameEngine.map.getAllTerritoriesAsList().forEach(t => {
        territories.push({
          name: t.name,
          owner: t.owner,
          numberOfTroops: t.numberOfTroops
        });
      });

      game.players.forEach(player => {
        player.emit('gameStarted', playerList, game.chosenGoal, territories, game.gameEngine.turn, game.gameEngine.troopsToDeploy);
      });

      addNewMessage(socket.roomId, {
        sender: 'SERVER',
        uid: 'SERVER',
        message: `GAME STARTED!`,
        timestamp: Date.now()
      });

      if (game.gameEngine.turn.player.type === PLAYER_TYPES.AI) {
        handleAi(game);
      }
    });

    socket.on('cardTurnIn', (newTroops, newHand) => {
      const game = games.find(game => game.id === socket.roomId);
      game.gameEngine.troopsToDeploy += newTroops;

      game.gameEngine.players.get(game.gameEngine.turn.player.name).cards = newHand.map(c => new Card(c.territoryName, c.cardType, c.regionName));

      game.gameEngine.troopsToDeploy += newTroops;

      game.gameEngine.players.get(game.gameEngine.turn.player.name).statistics.cardCombinationsUsed += 1;
      game.gameEngine.players.get(game.gameEngine.turn.player.name).statistics.totalReinforcements += newTroops;

      game.players.forEach(player => {
        player.emit('updatedCardsForPlayer', game.gameEngine.turn.player.userUid, newHand);
        player.emit('newReinforcements', newTroops);
      });
    });

    socket.on('updateStatisticAfterInvasion', invasionData => {
      const game = games.find(game => game.id === socket.roomId);

      const attacker = invasionData.attackFrom.owner;
      const defender = invasionData.battleWasWon ? invasionData.previousOwner : invasionData.attackTo.owner;

      if (invasionData.battleWasWon) {
        game.gameEngine.players.get(attacker).statistics.battlesWon += 1;
        game.gameEngine.players.get(defender).statistics.battlesLost += 1;
      } else if (invasionData.retreat) {
        game.gameEngine.players.get(attacker).statistics.retreats += 1;
      } else {
        game.gameEngine.players.get(attacker).statistics.battlesLost += 1;
        game.gameEngine.players.get(defender).statistics.battlesWon += 1;
      }

      game.gameEngine.players.get(attacker).statistics.troopsKilled += invasionData.defenderTotalCasualites;
      game.gameEngine.players.get(attacker).statistics.troopsLost += invasionData.attackerTotalCasualites;
      game.gameEngine.players.get(defender).statistics.troopsKilled += invasionData.attackerTotalCasualites;
      game.gameEngine.players.get(defender).statistics.troopsLost += invasionData.defenderTotalCasualites;
    });

    socket.on('troopAddedToTerritory', (territoryName) => {
      const game = games.find(game => game.id === socket.roomId);

      getTerritoryByName(game.gameEngine.map, territoryName).numberOfTroops++;

      game.players.forEach(player => {
        player.emit('troopAddedToTerritoryNotifier', territoryName);
      });
    });

    socket.on('nextTurn', () => {
      nextTurn(socket.roomId);
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

      if (!game.gameEngine.turn.playerHasWonAnAttackThisTurn) {
        game.gameEngine.takeCard(updateOwnerData.owner);
        const cards = [];
        game.gameEngine.players.get(updateOwnerData.owner).cards.forEach(c => {
          cards.push({
            territoryName: c.territoryName,
            cardType: c.cardType,
            regionName: c.regionName
          });
        });
        game.players.forEach(player => {
          player.emit('updatedCardsForPlayer', updateOwnerData.ownerUid, cards);
        });
      }

      const response = game.gameEngine.checkIfPlayerWonTheGame();
      if (response.playerWon) {

        const stats = game.players.map(player => ({
          name: player.name,
          uid: player.userUid,
          statistics: game.gameEngine.players.get(player.name).statistics
        }));

        game.players.forEach(player => {
          player.emit('playerWonNotifier', stats);
        });
      }
    });

    socket.on('updateMovement', (movementFromTerritoryName, movementFromTerritoryNumberOfTroops, movementToTerritoryName, movementToTerritoryNumberOfTroops) => {
      const game = games.find(game => game.id === socket.roomId);

      getTerritoryByName(game.gameEngine.map, movementFromTerritoryName).numberOfTroops = movementFromTerritoryNumberOfTroops;
      getTerritoryByName(game.gameEngine.map, movementToTerritoryName).numberOfTroops = movementToTerritoryNumberOfTroops;

      const territories = [];
      game.gameEngine.map.getAllTerritoriesAsList().forEach(t => {
        territories.push({
          name: t.name,
          owner: t.owner,
          numberOfTroops: t.numberOfTroops
        });
      });

      game.players.forEach(player => {
        player.emit('updateMovementNotifier', territories);
      });
    });
});