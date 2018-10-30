import io from 'socket.io-client';
import firebase from 'firebase/app';
import {GAME_PHASES} from './../gameConstants';

export default class SocketService {
    constructor(gameEngine, $rootScope, mapService) {
        this.gameEngine = gameEngine;
        this.mapService = mapService;
        this.$rootScope = $rootScope;
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
            const userName = user.displayName ? user.displayName : user.email;
            this.socket.emit('setUserAndRoom', user.uid, userName, roomId, isHost);
            this.sendMessage('SERVER', 'SERVER', `${userName} connected to the room`, Date.now(), roomId);
        });

        this.socket.on('gameStarted', (players, victoryGoal, map, turn) => {
            this.$rootScope.players = players;
            this.$rootScope.chosenGoal = victoryGoal;

            this.$rootScope.currentGamePhase = GAME_PHASES.GAME;
            this.$rootScope.$apply();

            this.gameEngine.map.getAllTerritoriesAsList().forEach(t => {
                const territoryFromServer = map.find(x => x.name === t.name);
                t.owner = territoryFromServer.owner;
            });
            this.gameEngine.turn = turn;

            this.mapService.updateMap(this.gameEngine.filter);
        });
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
}
