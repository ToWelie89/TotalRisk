const io = require('socket.io-client');
const firebase = require('firebase/app');
require('firebase/auth');
require('firebase/database');
const {hashString} = require('./../helpers');
const {GAME_PHASES, CONSTANTS, MAPS} = require('./../gameConstants');
const {normalizeTimeFromTimestamp, getRandomColor, startGlobalLoading, stopGlobalLoading} = require('./../helpers');

class LobbiesController {
    constructor($scope, $rootScope, $uibModal, $timeout, toastService, soundService) {
        this.vm = this;
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$uibModal = $uibModal;
        this.$timeout = $timeout;
        this.toastService = toastService;
        this.soundService = soundService;

        this.vm.isAuthenticated = false;
        this.vm.searchText = '';
        this.vm.chatMessage = '';
        this.vm.chatMaxLengthMessage = 150;
        this.vm.muteChat = false;
        this.firstLoad = true;

        this.userChatColor = getRandomColor();

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
        this.vm.globalChatMessages = [];

        firebase.database().ref('globalChat').on('value', snapshot => {
            if (!this.vm.muteChat && this.$rootScope.currentGamePhase === GAME_PHASES.MULTIPLAYER_LOBBIES && !this.firstLoad) {
                this.soundService.newMessage.play();
            }
            this.firstLoad = false;
            const messages = snapshot.val();

            this.vm.globalChatMessages = [];
            for (let message in messages) {
                this.vm.globalChatMessages.push(messages[message]);
            }

            this.vm.globalChatMessages.map(message => {
                message.normalizedTime = normalizeTimeFromTimestamp(message.timestamp);
            });

            this.vm.globalChatMessages.sort((a, b) => {
                return a.timestamp - b.timestamp;
            });

            // Get last 100
            this.vm.globalChatMessages = this.vm.globalChatMessages.slice(this.vm.globalChatMessages.length - 100, this.vm.globalChatMessages.length);

            console.log('Global chat messags', this.vm.globalChatMessages);
            this.$timeout(() => {
                this.$scope.$apply();
                document.querySelectorAll('.chatMessagesContainer').forEach(el => {
                    el.scrollTop = el.scrollHeight;
                });
            }, 1);
        });

        this.setupSocket();

        // PUBLIC METHODS
        this.vm.hostNewGame = this.hostNewGame;
        this.vm.joinLobby = this.joinLobby;
        this.vm.filterRooms = this.filterRooms;
        this.vm.sendChatMessage = this.sendChatMessage;
        this.vm.charactersLeft = this.charactersLeft;
    }

    charactersLeft () {
        return (this.vm.chatMaxLengthMessage - this.vm.chatMessage.length);
    }

    joinLobby(lobby) {
        this.soundService.tick.play();

        const joinRoom = () => {
            this.$rootScope.currentLobby = lobby;
            this.$rootScope.currentGamePhase = GAME_PHASES.PLAYER_SETUP_MULTIPLAYER;
        }

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
                        joinRoom();
                    } else {
                        console.log('incorrect password');
                        this.toastService.errorToast('', 'Incorrect password');
                    }
                }
            });
        } else {
            joinRoom();
        }
    }

    hostNewGame() {
        this.soundService.tick.play();
        this.$uibModal.open({
            templateUrl: 'src/modals/hostNewGameModal.html',
            backdrop: 'static',
            windowClass: 'riskModal hostNewGameModal',
            controller: 'hostNewGameModalController',
            controllerAs: 'hostNewGame',
            keyboard: false
        }).result.then((closeResponse) => {
            if (closeResponse && closeResponse.gameName) {
                startGlobalLoading()
                const id = Math.floor((Math.random() * 1000000000) + 1);
                const user = firebase.auth().currentUser;
                const creator = user.displayName ? user.displayName : user.email;
                const newRoom = {
                    id,
                    roomName: closeResponse.gameName,
                    password: hashString(closeResponse.password),
                    creationTimestamp: Date.now(),
                    creator,
                    creatorUid: user.uid,
                    maxNumberOfPlayer: CONSTANTS.MAX_NUMBER_OF_PLAYERS,
                    version: this.$rootScope.appVersion,
                    map: MAPS.WORLD_MAP
                };
                this.lobbiesSocket.emit('createNewRoom', newRoom);
            }
        });
    }

    setupSocket() {
        this.lobbiesSocket = io.connect(`http://127.0.0.1:5000/lobbies`, {transports: ['websocket', 'polling', 'flashsocket']});

        this.lobbiesSocket.on('currentLobbies', lobbies => {
            this.vm.lobbies = [];
            console.log(lobbies)
            lobbies.forEach(lobby => {
                this.vm.lobbies.push(lobby);
            });

            this.vm.lobbies = this.vm.lobbies.filter(lobby => {
                const threeHoursToMS = 1000 * 60 * 60 * 3;
                return lobby.creationTimestamp > (Date.now() - threeHoursToMS);
            });

            this.vm.lobbies.map(lobby => {
                lobby.normalizedTime = normalizeTimeFromTimestamp(lobby.creationTimestamp);
                lobby.private = lobby.password !== hashString('');
            });

            this.vm.lobbies.sort((a, b) => {
                return b.creationTimestamp - a.creationTimestamp;
            });

            console.log('Game lobbies', this.vm.lobbies);
            this.vm.filteredLobbies = this.vm.lobbies;
            this.$timeout(() => {
                this.$scope.$apply();
            }, 1);
        });
        this.lobbiesSocket.on('createNewRoomResponse', room => {
            this.$rootScope.currentLobby = room;
            this.$rootScope.currentGamePhase = GAME_PHASES.PLAYER_SETUP_MULTIPLAYER;
            this.$rootScope.$apply();
            stopGlobalLoading();
        });
    }

    filterRooms() {
        if (this.vm.searchText === '') {
            this.vm.filteredLobbies = this.vm.lobbies;
            return;
        }
        this.vm.filteredLobbies = this.vm.lobbies.filter(
            x =>
                x.roomName.toLowerCase().includes(this.vm.searchText.toLowerCase()) ||
                x.creator.toLowerCase().includes(this.vm.searchText.toLowerCase())
         );
    }

    sendChatMessage() {
        this.vm.disableSendButton = true;
        this.$timeout(() => {
            this.vm.disableSendButton = false;
        }, 1000);
        this.soundService.tick.play();
        const id = Math.floor((Math.random() * 100000000000) + 1);
        const user = firebase.auth().currentUser;
        const creator = user.displayName ? user.displayName : user.email;
        const message = this.vm.chatMessage;
        this.vm.chatMessage = '';
        firebase.database().ref('globalChat/' + id).set({
            timestamp: Date.now(),
            creator,
            creatorUid: user.uid,
            message,
            color: this.userChatColor
        });
    }

}

module.exports = LobbiesController;