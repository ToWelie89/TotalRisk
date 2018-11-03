const firebase = require('firebase/app');
require('firebase/auth');
require('firebase/database');
const {hashString} = require('./../helpers');
const {GAME_PHASES, CONSTANTS} = require('./../gameConstants');
const {normalizeTimeFromTimestamp, getRandomColor, lightenDarkenColor, objectsAreEqual, loadSvgIntoDiv} = require('./../helpers');
const {avatars, PLAYER_COLORS} = require('./../player/playerConstants');

class LobbiesController {
    constructor($scope, $rootScope, $timeout, $uibModal, soundService, socketService, toastService) {
        this.vm = this;
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$timeout = $timeout;
        this.soundService = soundService;
        this.socketService = socketService;
        this.toastService = toastService;
        this.$uibModal = $uibModal;

        this.$rootScope.$watch('currentLobbyId', () => {
            this.initLobby();
        });

        this.vm.players = [];

        this.vm.lobbyChatMessage = '';
        this.vm.lobbyChatMessages = [];
        this.vm.globalChatMessage = '';
        this.vm.globalChatMessages = [];
        this.vm.unreadLobbyMessages = 0;
        this.vm.unreadGlobalMessages = 0;
        this.vm.chatMaxLengthMessage = 150;
        this.vm.muteChat = false;
        this.firstLoad = true;

        this.globalChatColor = getRandomColor();

        firebase.database().ref('globalChat').on('value', snapshot => {
            if (!this.vm.muteChat && this.$rootScope.currentGamePhase === GAME_PHASES.PLAYER_SETUP_MULTIPLAYER && !this.firstLoad && !this.vm.showLobbyChat) {
                this.soundService.newMessage.play();
            }
            if (this.vm.showLobbyChat && !this.firstLoad) {
                this.vm.unreadGlobalMessages++;
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

        this.vm.leaveLobby = this.leaveLobby;
        this.vm.sendMessage = this.sendMessage;
        this.vm.charactersLeft = this.charactersLeft;
        this.vm.switchChat = this.switchChat;
        this.vm.lightenDarkenColor = this.lightenDarkenColor;
        this.vm.lockUnlockSlot = this.lockUnlockSlot;
        this.vm.existingPlayers = this.existingPlayers;
        this.vm.kickPlayer = this.kickPlayer;
        this.vm.openSelectionScreen = this.openSelectionScreen;
        this.vm.startGameIsDisabled = this.startGameIsDisabled;
        this.vm.startGame = this.startGame;
    }

    initLobby() {
        this.vm.currentLobbyId = this.$rootScope.currentLobbyId;
        if (this.vm.currentLobbyId) {
            const user = firebase.auth().currentUser;
            this.vm.myUid = user.uid;
            this.vm.lockedSlots = [];
            this.vm.unreadLobbyMessages = 0;
            this.vm.unreadGlobalMessages = 0;
            this.vm.showLobbyChat = true;
            this.vm.lobbyChatMessage = '';
            this.vm.globalChatMessage = '';
            firebase.database().ref('/rooms/' + this.vm.currentLobbyId).once('value').then(snapshot => {
                this.vm.room = Object.assign(snapshot.val(), {
                    id: snapshot.key
                });
                console.log('This room', this.vm.room);

                loadSvgIntoDiv('./assets/maps/worldMap/worldMap.svg', '#lobbyMapContainer');

                this.vm.userIsHost = this.vm.room.creatorUid === user.uid;
                this.$scope.$apply();
                const userName = user.displayName ? user.displayName : user.email;

                if (this.vm.userIsHost) {
                    this.socketService.createSocket('http://127.0.0.1', 1119, this.vm.room.id, user.uid, userName);
                } else {
                    this.socketService.createSocket(`http://${this.vm.room.hostIp}`, 1119, this.vm.room.id, user.uid, userName);
                }

                this.addSocketListeners();
            });
        }
    }

    switchChat(showLobbyChat) {
        this.vm.showLobbyChat = showLobbyChat;
        if (this.vm.showLobbyChat) {
            this.vm.unreadLobbyMessages = 0;
        } else {
            this.vm.unreadGlobalMessages = 0;
        }
        this.$timeout(() => {
            document.querySelectorAll('.chatMessagesContainer').forEach(el => {
                el.scrollTop = el.scrollHeight;
            });
        }, 20);
    }

    charactersLeft () {
        return this.vm.showLobbyChat ? (this.vm.chatMaxLengthMessage - this.vm.lobbyChatMessage.length)
                                     : (this.vm.chatMaxLengthMessage - this.vm.globalChatMessage.length);
    }

    openSelectionScreen(clickedPlayer) {
        const user = firebase.auth().currentUser;
        const uid = user.uid;
        const currentSelectedPlayer = this.vm.players.find(x => x.userUid === uid);

        if (clickedPlayer.userUid !== uid) {
            return;
        }

        this.$uibModal.open({
            templateUrl: 'src/modals/characterSelectionModal.html',
            backdrop: 'static',
            windowClass: 'riskModal characterSelect',
            controller: 'characterSelectionController',
            controllerAs: 'characterSelection',
            keyboard: false,
            resolve: {
                currentSelectedPlayer: () => currentSelectedPlayer,
                selectedPlayers: () => this.vm.players
            }
        }).result.then(closeResponse => {
            $('.mainWrapper').css('filter', 'none');
            $('.mainWrapper').css('-webkit-filter', 'none');

            if (!objectsAreEqual(closeResponse.avatar, currentSelectedPlayer.avatar)) {
                // update to BE
                this.socketService.updateAvatar(uid, closeResponse.avatar);
            }

            console.log(closeResponse);
        });
    }

    addSocketListeners() {
        this.socketService.socket.on('messagesUpdated', (messages) => {
            if (!this.vm.muteChat && this.$rootScope.currentGamePhase === GAME_PHASES.PLAYER_SETUP_MULTIPLAYER && this.vm.showLobbyChat) {
                this.soundService.newMessage.play();
            }

            if (!this.vm.showLobbyChat) {
                this.vm.unreadLobbyMessages++;
            }

            this.vm.lobbyChatMessages = messages;
            this.vm.lobbyChatMessages.map(message => {
                message.normalizedTime = normalizeTimeFromTimestamp(message.timestamp);
            });
            this.$scope.$apply();

            this.$timeout(() => {
                document.querySelectorAll('.chatMessagesContainer').forEach(el => {
                    el.scrollTop = el.scrollHeight;
                });
            }, 20);

            console.log('Lobby messages', this.vm.lobbyChatMessages);
        });

        this.socketService.socket.on('kicked', () => {
            this.$rootScope.currentLobbyId = '';
            this.$rootScope.currentGamePhase = GAME_PHASES.MULTIPLAYER_LOBBIES;
            this.toastService.errorToast('', 'You have been kicked = require(the lobby.');
            this.socketService.socket.disconnect();
        });

        this.socketService.socket.on('hostLeft', () => {
            const user = firebase.auth().currentUser;
            const userName = user.displayName ? user.displayName : user.email;
            this.socketService.leaveLobby(this.vm.room.id, userName);
            this.$rootScope.currentLobbyId = '';
            this.$rootScope.currentGamePhase = GAME_PHASES.MULTIPLAYER_LOBBIES;
            this.toastService.infoToast('', 'The host has left the lobby. Lobby removed.')
        });

        this.socketService.socket.on('updatedPlayers', players => {
            this.setPlayers(players);
            console.log('Players updated in room', this.vm.players);
        });

        this.socketService.socket.on('updatedLockedSlots', lockedSlots => {
            this.vm.lockedSlots = lockedSlots;
            this.setPlayers(this.vm.players);
            this.vm.room.maxNumberOfPlayer = (CONSTANTS.MAX_NUMBER_OF_PLAYERS - this.vm.lockedSlots.length);
        });
    }

    setPlayers(players) {
        if (players.filter(x => x !== undefined).length === 0) {
            return;
        }
        this.vm.players = new Array(CONSTANTS.MAX_NUMBER_OF_PLAYERS).fill(undefined);
        players.forEach(p => {
            const indexes = Array.from(Array(CONSTANTS.MAX_NUMBER_OF_PLAYERS).keys());
            const indexToUse = indexes.find(i => !this.vm.lockedSlots.includes(i) && this.vm.players[i] === undefined);
            this.vm.players[indexToUse] = p;
        });

        this.vm.players.forEach(player => {
            if (player) {
                player.type = 0;
            }
        });

        this.$scope.$apply();
    }

    lightenDarkenColor(colorCode, amount) {
        return lightenDarkenColor(colorCode, amount);
    }

    sendMessageLobby() {
        this.vm.disableSendButton = true;
        this.$timeout(() => {
            this.vm.disableSendButton = false;
        }, 1000);

        if (!this.vm.muteChat) {
            this.soundService.tick.play();
        }
        const user = firebase.auth().currentUser;
        const userName = user.displayName ? user.displayName : user.email;
        this.socketService.sendMessage(userName, user.uid, this.vm.lobbyChatMessage, Date.now(), this.vm.room.id);
        this.vm.lobbyChatMessage = '';
    }

    sendMessageGlobal() {
        this.vm.disableSendButton = true;
        this.$timeout(() => {
            this.vm.disableSendButton = false;
        }, 1000);

        if (!this.vm.muteChat) {
            this.soundService.tick.play();
        }
        const id = Math.floor((Math.random() * 100000000000) + 1);
        const user = firebase.auth().currentUser;
        const creator = user.displayName ? user.displayName : user.email;
        const message = this.vm.globalChatMessage;
        this.vm.globalChatMessage = '';
        firebase.database().ref('globalChat/' + id).set({
            timestamp: Date.now(),
            creator,
            creatorUid: user.uid,
            message,
            color: this.globalChatColor
        });
    }

    leaveLobby() {
        this.soundService.bleep2.play();
        const user = firebase.auth().currentUser;
        const userName = user.displayName ? user.displayName : user.email;
        this.socketService.leaveLobby(this.vm.room.id, userName);
        this.$rootScope.currentLobbyId = '';
        this.$rootScope.currentGamePhase = GAME_PHASES.MULTIPLAYER_LOBBIES;
    }

    kickPlayer(player) {
        this.socketService.kickPlayer(this.vm.room.id, player.userUid);
    }

    lockUnlockSlot(index) {
        if (this.vm.lockedSlots.includes(index)) {
            this.vm.lockedSlots = this.vm.lockedSlots.filter(x => x !== index);
        } else {
            this.vm.lockedSlots.push(index);
        }

        this.socketService.updateLockedSlotsForRoom(this.vm.lockedSlots, this.vm.room.id);

        const updates = {};
        updates[`rooms/${this.vm.room.id}/maxNumberOfPlayer`] = (CONSTANTS.MAX_NUMBER_OF_PLAYERS - this.vm.lockedSlots.length);
        firebase.database().ref().update(updates);

        this.vm.room.maxNumberOfPlayer = (CONSTANTS.MAX_NUMBER_OF_PLAYERS - this.vm.lockedSlots.length);
    }

    existingPlayers() {
        return this.vm.players.filter(x => x !== undefined);
    }

    startGameIsDisabled() {
        return this.existingPlayers().length < CONSTANTS.MIN_NUMBER_OF_PLAYERS;
    }

    startGame() {
        this.socketService.startGame();
    }
}

module.exports = LobbiesController;