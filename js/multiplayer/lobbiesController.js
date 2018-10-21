import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import {hashString} from './../helpers';
import {GAME_PHASES, CONSTANTS} from './../gameConstants';

export default class LobbiesController {
    constructor($scope, $rootScope, $uibModal, $timeout, toastService, soundService) {
        this.vm = this;
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$uibModal = $uibModal;
        this.$timeout = $timeout;
        this.toastService = toastService;
        this.soundService = soundService;

        this.vm.isAuthenticated = false;

        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                this.vm.isAuthenticated = true;
                this.$scope.$apply();
            } else {
                this.vm.isAuthenticated = false;
                this.$scope.$apply();
            }
        });

        this.vm.lobbies = [];

        firebase.database().ref('rooms').on('value', snapshot => {
            const rooms = snapshot.val();

            this.vm.lobbies = [];
            for (let room in rooms) {
                this.vm.lobbies.push(Object.assign({
                    id: room
                }, rooms[room]));
            }

            this.vm.lobbies = this.vm.lobbies.filter(lobby => {
                const threeHoursToMS = 1000 * 60 * 60 * 3;
                return lobby.creationTimestamp > (Date.now() - threeHoursToMS);
            });

            this.vm.lobbies.map(lobby => {
                const date = new Date(lobby.creationTimestamp);
                let hours = date.getHours();
                let minutes = date.getMinutes();

                if (hours < 10) {
                    hours = `0${hours}`;
                }
                if (minutes < 10) {
                    minutes = `0${minutes}`;
                }

                lobby.normalizedTime = `${hours}:${minutes}`;
                lobby.private = lobby.password !== hashString('');
            });

            this.vm.lobbies.sort((a, b) => {
                return b.creationTimestamp - a.creationTimestamp;
            });

            console.log('Game lobbies', this.vm.lobbies);
            this.$timeout(() => {
                this.$scope.$apply();
            }, 1);
        });

        this.vm.hostNewGame = this.hostNewGame;
        this.vm.joinLobby = this.joinLobby;
    }

    joinLobby(lobby) {
        this.soundService.tick.play();
        if (lobby.private) {
            this.$uibModal.open({
                templateUrl: 'joinPrivateLobby.html',
                backdrop: 'static',
                windowClass: 'riskModal joinPrivateLobby',
                controller: 'joinPrivateLobbyController',
                controllerAs: 'joinPrivate',
                keyboard: false
            }).result.then((closeResponse) => {
                if (closeResponse && closeResponse.password) {
                    if (hashString(closeResponse.password) === lobby.password) {
                        console.log('correct password');
                        this.$rootScope.currentLobbyId = lobby.id;
                        this.$rootScope.currentGamePhase = GAME_PHASES.PLAYER_SETUP_MULTIPLAYER;
                    } else {
                        console.log('incorrect password');
                        this.toastService.errorToast('', 'Incorrect password');
                    }
                }
            });
        } else {
            this.$rootScope.currentLobbyId = lobby.id;
            this.$rootScope.currentGamePhase = GAME_PHASES.PLAYER_SETUP_MULTIPLAYER;
        }
    }

    hostNewGame() {
        this.soundService.tick.play();
        this.$uibModal.open({
            templateUrl: 'hostNewGameModal.html',
            backdrop: 'static',
            windowClass: 'riskModal hostNewGameModal',
            controller: 'hostNewGameModalController',
            controllerAs: 'hostNewGame',
            keyboard: false
        }).result.then((closeResponse) => {
            if (closeResponse && closeResponse.gameName) {
                const id = Math.floor((Math.random() * 1000000000) + 1);
                const user = firebase.auth().currentUser;
                const creator = user.displayName ? user.displayName : user.email;
                firebase.database().ref('rooms/' + id).set({
                    roomName: closeResponse.gameName,
                    password: hashString(closeResponse.password),
                    creationTimestamp: Date.now(),
                    creator,
                    creatorUid: user.uid,
                    currentNumberOfPlayers: 0,
                    maxNumberOfPlayer: CONSTANTS.MAX_NUMBER_OF_PLAYERS,
                    hostIp: this.$rootScope.myIp,
                    version: this.$rootScope.appVersion
                })
                .then(() => {
                    this.$rootScope.currentLobbyId = id;
                    this.$rootScope.currentGamePhase = GAME_PHASES.PLAYER_SETUP_MULTIPLAYER;
                    this.$rootScope.$apply();
                });
            }
        });
    }

}
