import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import {hashString} from './../helpers';
import {GAME_PHASES} from './../gameConstants';

export default class LobbiesController {
    constructor($scope, $rootScope, soundService, socketService, toastService) {
        this.vm = this;
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.soundService = soundService;
        this.socketService = socketService;
        this.toastService = toastService;

        this.$rootScope.$watch('currentLobbyId', () => {
            this.vm.currentLobbyId = this.$rootScope.currentLobbyId;
            if (this.vm.currentLobbyId) {
                firebase.database().ref('/rooms/' + this.vm.currentLobbyId).once('value').then(snapshot => {
                    this.room = Object.assign(snapshot.val(), {
                        id: snapshot.key
                    });
                    console.log('This room', this.room);
                    const user = firebase.auth().currentUser;
                    this.vm.userIsHost = this.room.creatorUid === user.uid;
                    this.$scope.$apply();
                    const userName = user.displayName ? user.displayName : user.email;

                    if (this.vm.userIsHost) {
                        this.socketService.createSocket('http://127.0.0.1', 1119, this.room.id, user.uid, userName);
                    } else {
                        this.socketService.createSocket(`http://${this.room.hostIp}`, 1119, this.room.id, user.uid, userName);
                    }

                    this.addSocketListeners();
                });
            }
        });

        this.vm.message = '';
        this.vm.messages = [];

        this.vm.leaveLobby = this.leaveLobby;
        this.vm.sendMessage = this.sendMessage;
    }

    addSocketListeners() {
        this.socketService.socket.on('messagesUpdated', (messages) => {
            this.vm.messages = messages;
            this.$scope.$apply();
        });

        this.socketService.socket.on('hostLeft', () => {
            const user = firebase.auth().currentUser;
            const userName = user.displayName ? user.displayName : user.email;
            this.socketService.leaveLobby(this.room.id, userName);
            this.$rootScope.currentLobbyId = '';
            this.$rootScope.currentGamePhase = GAME_PHASES.MULTIPLAYER_LOBBIES;
            this.toastService.infoToast('', 'The host has left the lobby. Lobby removed.')
        })
    }

    sendMessage() {
        const user = firebase.auth().currentUser;
        const userName = user.displayName ? user.displayName : user.email;
        this.socketService.sendMessage(userName, this.vm.message, Date.now(), this.room.id);
        this.vm.message = '';
    }

    leaveLobby() {
        this.soundService.bleep2.play();
        const user = firebase.auth().currentUser;
        const userName = user.displayName ? user.displayName : user.email;
        this.socketService.leaveLobby(this.room.id, userName);
        this.$rootScope.currentLobbyId = '';
        this.$rootScope.currentGamePhase = GAME_PHASES.MULTIPLAYER_LOBBIES;
    }
}
