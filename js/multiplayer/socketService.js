const io = require('socket.io-client');
const firebase = require('firebase/app');
const {GAME_PHASES} = require('./../gameConstants');
const {displayReinforcementNumbers} = require('./../animations/animations');
const { getTerritoryByName } = require('./../map/mapHelpers');

class SocketService {
    constructor(gameEngine, $rootScope, mapService, soundService) {
        this.gameEngine = gameEngine;
        this.mapService = mapService;
        this.$rootScope = $rootScope;
        this.soundService = soundService;
    }

    createSocket(url, port, roomId, userUid, userName) {
        if (!url || !port) {
            return;
        }

        this.socket = io.connect(`${url}:${port}`, {transports: ['websocket', 'polling', 'flashsocket']});

        this.socket.on('connected', () => {
            const isHost = (url === 'http://127.0.0.1');
            if (isHost) {
                console.log('You are now hosting!');
            } else {
                console.log('You are connected to host ' + url);
            }
            const user = firebase.auth().currentUser;
            this.userUid = user.uid;
            const userName = user.displayName ? user.displayName : user.email;
            this.socket.emit('setUserAndRoom', user.uid, userName, roomId, isHost);
            this.sendMessage('SERVER', 'SERVER', `${userName} connected to the room`, Date.now(), roomId);
        });

        this.socket.on('gameStarted', (players, victoryGoal, map, turn, troopsToDeploy) => {
            console.log('troopsToDeploy', troopsToDeploy);
            this.gameEngine.currentGameIsMultiplayer = true;
            this.gameEngine.turn = turn;
            this.gameEngine.troopsToDeploy = troopsToDeploy;

            this.gameEngine.map.getAllTerritoriesAsList().forEach(t => {
                const territoryFromServer = map.find(x => x.name === t.name);
                t.owner = territoryFromServer.owner;
                t.numberOfTroops = territoryFromServer.numberOfTroops;
            });

            this.$rootScope.players = players;
            this.$rootScope.chosenGoal = victoryGoal;

            this.$rootScope.currentGamePhase = GAME_PHASES.GAME_MULTIPLAYER;

            this.$rootScope.$apply();
        });
    }

    getMessages() {
        this.socket.emit('getMessages');
    }

    sendMessage(sender, uid, message, timestamp, roomId) {
        this.socket.emit('sendMessage', roomId, {
            sender,
            uid,
            message,
            timestamp
        });
    }

    updateLockedSlotsForRoom(lockedSlots, roomId) {
        this.socket.emit('lockedSlots', lockedSlots, roomId);
    }

    leaveLobby(roomId, userName) {
        this.sendMessage('SERVER', 'SERVER', `${userName} left the room`, Date.now(), roomId);
        this.socket.disconnect();
    }

    kickPlayer(roomId, userUid) {
        this.socket.emit('kickPlayer', roomId, userUid);
    }

    updateAvatar(userUid, avatar) {
        this.socket.emit('updateAvatar', userUid, avatar);
    }

    startGame() {
        this.socket.emit('startGame');
    }

    troopAddedToTerritory(territoryName) {
        this.socket.emit('troopAddedToTerritory', territoryName, this.userUid);
    }

    nextTurn() {
        this.socket.emit('nextTurn');
    }

    battleFought(battleData) {
        this.socket.emit('battleFought', battleData);
    }

    updateOwnerAfterSuccessfulInvasion(updateOwnerData) {
        this.socket.emit('updateOwnerAfterSuccessfulInvasion', updateOwnerData);
    }
}

module.exports = SocketService;