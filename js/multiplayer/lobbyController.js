import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import {hashString} from './../helpers';
import {GAME_PHASES} from './../gameConstants';

export default class LobbiesController {
    constructor($scope, $rootScope, soundService, socketService) {
        this.vm = this;
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.soundService = soundService;
        this.socketService = socketService;

        this.$rootScope.$watch('currentLobbyId', () => {
            this.vm.currentLobbyId = this.$rootScope.currentLobbyId;
            if (this.vm.currentLobbyId) {
                firebase.database().ref('/rooms/' + this.vm.currentLobbyId).once('value').then(snapshot => {
                    this.room = Object.assign(snapshot.val(), {
                        id: snapshot.key
                    });
                    console.log('This room', this.room);
                    this.vm.userIsHost = this.room.creatorUid === firebase.auth().currentUser.uid;
                    this.$scope.$apply();

                    if (this.vm.userIsHost) {
                        this.socketService.createSocket('http://127.0.0.1', 1119);
                    } else {
                        this.socketService.createSocket(`http://${this.room.hostIp}`, 1119);
                    }
                    this.addSocketListeners();
                    this.room.currentNumberOfPlayers++;
                    this.updateCurrentPlayers();
                    this.socketService.socket.emit('getMessagesByRoomId', this.room.id);
                });
            }
        });

        this.vm.message = '';
        this.vm.messages = [];

        this.vm.leaveLobby = this.leaveLobby;
        this.vm.sendMessage = this.sendMessage;
    }

    addSocketListeners() {
        this.socketService.socket.on('messagesUpdated', messages => {
            this.vm.messages = messages;
            this.$scope.$apply();
        });
    }

    sendMessage() {
        const user = firebase.auth().currentUser;
        const userName = user.displayName ? user.displayName : user.email;
        this.socketService.sendMessage(userName, this.vm.message, Date.now(), this.room.id);
    }

    updateCurrentPlayers() {
        var updates = {};
        updates['/rooms/' + this.room.id + '/currentNumberOfPlayers'] = this.room.currentNumberOfPlayers;
        return firebase.database().ref().update(updates);
    }

    leaveLobby() {
        this.soundService.bleep2.play();

        this.room.currentNumberOfPlayers--;
        this.updateCurrentPlayers();

        this.$rootScope.currentGamePhase = GAME_PHASES.MULTIPLAYER_LOBBIES;
    }
}
