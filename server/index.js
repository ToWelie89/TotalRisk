'use strict';

const firebaseAdmin = require('firebase-admin');
const serviceAccount = require('./firebaseCredentials.json');

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: 'https://totalrisk-e2899.firebaseio.com'
});

const BEHIND_PROXY = process.env.BEHIND_PROXY;

const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const {
    PLAYER_COLORS,
    PLAYER_TYPES,
    avatars
} = require('./../js/player/playerConstants');
const {
    getRandomInteger,
    randomIntFromInterval,
    delay
} = require('./../js/helpers');
const {
    getTerritoryByName,
    getCurrentOwnershipStandings
} = require('./../js/map/mapHelpers');
const {
    VICTORY_GOALS,
    TURN_PHASES,
    TURN_LENGTHS
} = require('./../js/gameConstants');
const GameEngine = require('./../js/gameEngine');
const AiHandler = require('./../js/ai/aiHandler');
const Player = require('./../js/player/player');
const Card = require('./../js/card/card');
const {
    playMatch,
    getNewRating
} = require('./trueSkill');

const PORT = process.env.PORT || 5000;
const MAIN_INDEX = path.join(__dirname, '../index.html');
const TEST_INDEX = path.join(__dirname, 'test.html');

const states = {
    LOBBY: 'LOBBY',
    IN_GAME: 'IN_GAME'
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
app.use(bodyParser.urlencoded({
    extended: true
}));
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
            res.send({
                userExistsInRoom: true
            });
        } else {
            res.send({
                userExistsInRoom: false
            });
        }
    } else {
        res.send({
            userExistsInRoom: false
        });
    }
});

const server = http.createServer(app);
const io = socketIO.listen(server); //pass a http.Server instance
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
            players: game.players.map(p => ({
                userName: p.userName,
                userUid: p.userUid
            })),
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
    const allAvatars = Array.from(Object.keys(avatars).map((key, index) => ({
        name: key,
        avatar: avatars[key]
    })));
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
    });
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
    let turn = {
        newPlayer: false
    };

    while (!turn.newPlayer) {
        turn = game.gameEngine.nextTurn();
    }

    game.players.forEach(player => {
        player.emit('nextTurnNotifier', turn, game.gameEngine.reinforcementData);
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
    let reinforcementData = {};
    if (turn.turnPhase === TURN_PHASES.DEPLOYMENT) {
        reinforcementData = game.gameEngine.reinforcementData;
    }

    if (turn.newPlayer && turn.player.type === PLAYER_TYPES.HUMAN) {
        startTimer(game.id);
    }

    game.players.forEach(player => {
        player.emit('nextTurnNotifier', turn, reinforcementData);
    });

    if (turn.player.type === PLAYER_TYPES.AI) {
        handleAi(game);
    }
};

const handleAi = game => {
    game.aiHandler = new AiHandler(game.gameEngine, {}, {
        updateMap: filter => {
            console.log('update map in multiplayer ai handler');
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
            return delay(50 * newTroops);
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
                handleGameOver(game);
            } else {
                console.log('AI error', reason);
            }
        });
};

const handleGameOver = game => {
    console.log('GAME OVER!');

    clearInterval(game.timer.turnTimer);

    updateMapState(game.id);

    const playersAsList = Array.from(game.gameEngine.players.values());

    const stats = game.players.map(player => ({
        name: player.userName,
        uid: player.userUid,
        statistics: game.gameEngine.players.get(player.userName).statistics
    }));

    const ownership = getCurrentOwnershipStandings(game.gameEngine.map, game.gameEngine.players);

    const playerWhoWon = game.gameEngine.playerWhoWon;

    playersAsList.sort((a, b) => {
        if (a.name === playerWhoWon) {
            return -1;
        } else if (a.dead && b.dead) {
            return a.deadTurn > b.deadTurn ? -1 : 1;
        } else if (a.dead) {
            return 1;
        } else if (b.dead) {
            return -1;
        } else {
            let aTotal = ownership.find(x => x.name === a.name).totalTerritories;
            let bTotal = ownership.find(x => x.name === b.name).totalTerritories;

            if (aTotal > bTotal) {
                return -1;
            } else if (aTotal < bTotal) {
                return 1;
            } else if (aTotal === bTotal) {
                aTotal = ownership.find(x => x.name === a.name).totalTroops;
                bTotal = ownership.find(x => x.name === b.name).totalTroops;

                if (aTotal > bTotal) {
                    return -1;
                } else if (aTotal < bTotal) {
                    return 1;
                } else {
                    return 0;
                }
            }
        }
    });

    playersAsList.map(x => {
        x.rank = (playersAsList.indexOf(x) + 1);
    });

    // Update ratings
    if (!BEHIND_PROXY) {
        // Get all users and pick out the ones that are in this game
        // Fetch the current rating and old ratings
        firebaseAdmin.database().ref('users').once('value').then(snapshot => {
            const users = snapshot.val();

            game.players.forEach(player => {
                const p = playersAsList.find(x => x.name === player.userName);
                if (p.type === PLAYER_TYPES.HUMAN || p.disconnected) {
                    const userFromDatabase = users[player.userUid];

                    p.oldRating = userFromDatabase.rating ? userFromDatabase.rating : getNewRating();
                    p.oldRatings = userFromDatabase.oldRatings ? userFromDatabase.oldRatings : [];

                    p.totalWins = userFromDatabase.totalWins ? userFromDatabase.totalWins : 0;
                    p.totalDefeats = userFromDatabase.totalDefeats ? userFromDatabase.totalDefeats : 0;
                    // TODO: handle disconnects
                    p.totalDisconnects = userFromDatabase.totalDisconnects ? userFromDatabase.totalDisconnects : 0;

                    p.recentGames = userFromDatabase.recentGames ? userFromDatabase.recentGames : [];
                } else {
                    p.oldRating = getNewRating();
                }
            });
        }).then(() => {
            // Use trueskill to play the match and get new ratings
            const arg1 = playersAsList.map(p => ({
                name: p.name,
                rating: p.oldRating
            }));
            const arg2 = playersAsList.map(p => p.rank);

            const result = playMatch(arg1, arg2);
            // Set new rating for each player from the result object
            console.log(result);
            console.log(result.newRatings);
            playersAsList.forEach((p, i) => {
                p.newRating = result.newRatings[i][0];
            });
        }).then(() => {
            // Update new rating for all players and store the old rating in the old ratings history
            const promises = [];
            playersAsList.filter(p => p.type === PLAYER_TYPES.HUMAN).forEach(p => {
                console.log(p.newRating)
                const promise = firebaseAdmin.database().ref('users/' + p.userUid + '/rating').set(p.newRating).then(() => {
                    const oldRatings = [...p.oldRatings, Object.assign({
                        timestamp: Date.now()
                    }, p.oldRating)];
                    return firebaseAdmin.database().ref('users/' + p.userUid + '/oldRatings').set(oldRatings);
                });
                promises.push(promise);
            });
            Promise.all(promises);
        }).then(() => {
            // Update new rating for all players and store the old rating in the old ratings history
            const promises = [];
            playersAsList.filter(p => p.type === PLAYER_TYPES.HUMAN).forEach(p => {
                if (p.name === playerWhoWon) {
                    const promise = firebaseAdmin.database().ref('users/' + p.userUid + '/totalWins').set(p.totalWins + 1);
                    promises.push(promise);
                } else {
                    const promise = firebaseAdmin.database().ref('users/' + p.userUid + '/totalDefeats').set(p.totalDefeats + 1);
                    promises.push(promise);
                }

                if (p.disconnected) {
                    const promise = firebaseAdmin.database().ref('users/' + p.userUid + '/totalDisconnects').set(p.totalDisconnects + 1);
                    promises.push(promise);
                }

                const newRecentGames = [...p.recentGames, {
                    timestamp: Date.now(),
                    nrOfPlayers: game.players.length,
                    placing: p.rank,
                    wasKilled: p.dead,
                    disconnected: p.disconnected ? p.disconnected : false,
                    ratingBeforeGame: p.oldRating,
                    ratingAfterGame: p.newRating,
                    nrOfTurns: game.gameEngine.turn.turnNumber
                }];

                const promise = firebaseAdmin.database().ref('users/' + p.userUid + '/recentGames').set(newRecentGames);
                promises.push(promise);
            });
            Promise.all(promises);
        }).then(() => {
            game.players.forEach(player => {
                player.emit('playerWonNotifier', {
                    playersAsList,
                    stats,
                    winner: playerWhoWon
                });
            });
        });
    } else {
        game.players.forEach(player => {
            player.emit('playerWonNotifier', {
                playersAsList,
                stats,
                winner: playerWhoWon
            });
        });
    }

    // Remove game
    games = games.filter(g => g.id !== game.id);
    updateLobbies();
};

const updateMapState = roomId => {
    const game = games.find(game => game.id === roomId);

    const territories = [];

    if (game) {
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
    }
};

const updateOnlineUsers = (callback = () => {}) => {
    const onlineUsers = lobbiesSocketList
        .map(x => ({
            userName: x.userName,
            userUid: x.userUid,
            tooltipInfo: x.tooltipInfo
        }))
        .filter(x => x.userName !== null &&
            x.userName !== undefined &&
            x.userUid !== null &&
            x.userUid !== undefined
        );
    lobbiesSocketList.forEach(s => {
        s.emit('onlineUsers', onlineUsers);
    });
    callback();
};

io
    .of('lobbies')
    .on('connection', (socket) => {
        lobbiesSocketList.push(socket);

        updateOnlineUsers();
        updateLobbies();

        socket.on('setUser', (userName, userUid) => {
            socket.userName = userName;
            socket.userUid = userUid;

            updateOnlineUsers(() => {
                if (!BEHIND_PROXY) {
                    firebaseAdmin.database().ref('users/' + userUid).once('value').then(snapshot => {
                        const user = snapshot.val();
                        socket.tooltipInfo = {
                            countryCode: user.countryCode ? user.countryCode : '',
                            bio: user.bio ? user.bio : '',
                            rating: user.rating ? user.rating : undefined,
                            uid: userUid
                        };

                        lobbiesSocketList.forEach(s => {
                            s.emit('updatedBioOfUserNotifier', socket.tooltipInfo);
                        });
                    });
                } else {
                    socket.tooltipInfo = {
                        countryCode: 'SE',
                        bio: 'test bio',
                        rating: {
                            mu: 25,
                            sigma: 5
                        },
                        uid: userUid
                    };
                    lobbiesSocketList.forEach(s => {
                        s.emit('updatedBioOfUserNotifier', socket.tooltipInfo);
                    });
                }

                updateLobbies();
            });
        });

        socket.on('signOutUser', uid => {
            const onlineUsers = lobbiesSocketList
                .map(x => ({
                    userName: x.userName,
                    userUid: x.userUid,
                    tooltipInfo: x.tooltipInfo
                }))
                .filter(x => x.userName !== null &&
                    x.userName !== undefined &&
                    x.userUid !== null &&
                    x.userUid !== undefined &&
                    x.userUid !== socket.userUid
                );
            lobbiesSocketList.forEach(s => {
                s.emit('onlineUsers', onlineUsers);
            });
            lobbiesSocketList = lobbiesSocketList.filter(s => s.userUid !== socket.userUid);
        });

        socket.on('removeUser', () => {
            lobbiesSocketList = lobbiesSocketList.filter(s => s.userUid !== socket.userUid);
            updateOnlineUsers();
        });

        socket.on('disconnect', reason => {
            lobbiesSocketList = lobbiesSocketList.filter(s => s.userUid !== socket.userUid);
            updateOnlineUsers();
        });

        socket.on('updatedBioOfUser', uid => {
            if (!uid) {
                return;
            }
            const u = lobbiesSocketList.find(x => x.userUid === uid);
            if (!BEHIND_PROXY) {
                firebaseAdmin.database().ref('users/' + uid).once('value').then(snapshot => {
                    const user = snapshot.val();

                    if (u) {
                        u.tooltipInfo = {
                            countryCode: user.countryCode ? user.countryCode : '',
                            bio: user.bio ? user.bio : '',
                            rating: user.rating ? user.rating : undefined,
                            uid
                        };

                        lobbiesSocketList.forEach(s => {
                            s.emit('updatedBioOfUserNotifier', u.tooltipInfo);
                        });
                    }
                });
            } else {
                u.tooltipInfo = {
                    countryCode: 'SE',
                    bio: 'UPDATED test bio',
                    rating: {
                        mu: 25,
                        sigma: 5
                    },
                    uid
                };
                lobbiesSocketList.forEach(s => {
                    s.emit('updatedBioOfUserNotifier', u.tooltipInfo);
                });
            }
        });

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
            if (game && game.state === states.IN_GAME) {
                game.gameEngine.setPlayerType(socket.userName, PLAYER_TYPES.AI);
                game.gameEngine.players.get(socket.userName).disconnected = true;
                game.players.find(p => p.userUid === socket.userUid).ai = true;
                game.players.find(p => p.userUid === socket.userUid).emit = () => {};

                if (game.players.some(x => !x.ai)) {
                    // There are still human players left
                    skipToNextPlayer(socket.roomId);

                    addNewMessage(socket.roomId, {
                        sender: 'SERVER',
                        uid: 'SERVER',
                        message: `${socket.userName} left the game. Player will be replaced by AI`,
                        timestamp: Date.now()
                    });
                } else {
                    // No humans left, end game
                    clearInterval(game.timer.turnTimer);
                    const promises = [];
                    game.players.forEach(p => {
                        if (p.disconnected) {
                            const promise = firebaseAdmin.database().ref('users/' + p.userUid).once('value').then(snapshot => {
                                const user = snapshot.val();
                                const totalDisconnects = user.totalDisconnects ? user.totalDisconnects : 0;
                                return firebaseAdmin.database().ref('users/' + p.userUid + '/totalDisconnects').set(totalDisconnects + 1);
                            });
                            promises.push(promise);
                        }
                    });

                    Promise.all(promises)
                        .then(() => {
                            games = games.filter(game => game.id !== socket.roomId);
                            updateLobbies();
                        });
                }
            } else if (game && game.state === states.LOBBY) {
                const userWasHost = game.players.find(player => player.userUid === socket.userUid).isHost;
                game.players = game.players.filter(player => player.userUid !== socket.userUid);

                if (userWasHost) {
                    game.players.forEach(playerSocket => {
                        playerSocket.emit('hostLeft');
                    });
                    games = games.filter(game => game.id !== socket.roomId);
                } else if (game.players.length === 0) {
                    games = games.filter(game => game.id !== socket.roomId);
                } else {
                    addNewMessage(socket.roomId, {
                        sender: 'SERVER',
                        uid: 'SERVER',
                        message: `${socket.userName} left the room`,
                        timestamp: Date.now()
                    });
                }

                updateLobbies();
                setPlayers(socket.roomId);
            }
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
                message: 'GAME STARTED!',
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
                handleGameOver(game);
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