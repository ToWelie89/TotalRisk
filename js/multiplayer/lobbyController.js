const io = require('socket.io-client');
const firebase = require('firebase/app');
require('firebase/auth');
require('firebase/database');
const { hashString } = require('./../helpers');
const { GAME_PHASES, CONSTANTS, VICTORY_GOALS, TURN_LENGTHS } = require('./../gameConstants');
const { normalizeTimeFromTimestamp, getRandomColor, lightenDarkenColor, objectsAreEqual, loadSvgIntoDiv } = require('./../helpers');
const { avatars, PLAYER_COLORS } = require('./../player/playerConstants');

class LobbiesController {
    constructor($scope, $rootScope, $timeout, $uibModal, soundService, toastService, gameEngine, socketService) {
        this.vm = this;
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$timeout = $timeout;
        this.soundService = soundService;
        this.toastService = toastService;
        this.$uibModal = $uibModal;
        this.gameEngine = gameEngine;
        this.socketService = socketService;

        this.$rootScope.$watch('currentLobby', () => {
            this.initLobby();
        });

        this.vm.victoryGoals = VICTORY_GOALS;

        this.vm.turnLengthSliderOptions = {
            showTicks: true,
            stepsArray: TURN_LENGTHS,
            onChange: () => {
                this.socketService.gameSocket.emit('setTurnLength', this.vm.room.id, this.vm.turnLength);
            }
        };

        this.vm.aiSpeedSliderOptions = {
            showTicks: true,
            stepsArray: ['Slow', 'Medium', 'Fast'],
            onChange: () => {
                this.socketService.gameSocket.emit('setAiSpeed', this.vm.room.id, this.vm.aiSpeed);
            }
        };

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
        this.vm.updateColorOfPlayer = this.updateColorOfPlayer;
        this.vm.addAi = this.addAi;
        this.vm.addAiDisabled = this.addAiDisabled;
    }

    addAi() {
        this.socketService.gameSocket.emit('addAiPlayer', this.vm.room.id);
    }

    addAiDisabled() {
        return this.vm.players.filter(x => x !== undefined).length === CONSTANTS.MAX_NUMBER_OF_PLAYERS;
    }

    updateColorOfPlayer(player, color) {
        this.socketService.gameSocket.emit('setPlayerColor', this.vm.room.id, player.userUid, color.name);
    }

    setGoal(goal) {
        this.vm.chosenGoal = goal;
        this.soundService.changeColor.play();
        this.socketService.gameSocket.emit('setGoal', this.vm.room.id, this.vm.chosenGoal);
    }

    initLobby() {
        this.vm.room = this.$rootScope.currentLobby;
        if (this.vm.room) {
            const user = firebase.auth().currentUser;
            this.vm.myUid = user.uid;
            this.vm.lockedSlots = [];
            this.vm.unreadLobbyMessages = 0;
            this.vm.unreadGlobalMessages = 0;
            this.vm.showLobbyChat = true;
            this.vm.lobbyChatMessage = '';
            this.vm.globalChatMessage = '';

            console.log('This room', this.vm.room);

            loadSvgIntoDiv('./assets/maps/worldMap/worldMap.svg', '#lobbyMapContainer');

            this.vm.userIsHost = this.vm.room.creatorUid === user.uid;
            this.vm.turnLengthSliderOptions.disabled = !this.vm.userIsHost;
            this.vm.aiSpeedSliderOptions.disabled = !this.vm.userIsHost;
            const userName = user.displayName ? user.displayName : user.email;

            if (!this.socketService.lobbiesSocket) {
                this.socketService.createLobbiesSocket();
            }
            if (!this.socketService.gameSocket) {
                this.socketService.createGameSocket();
            }

            this.addSocketListeners();

            firebase.database().ref('/users/' + user.uid).once('value').then(snapshot => {
                const userData = snapshot.val();
                let chosenAvatar;

                if (userData) {
                    if (userData.defaultAvatar) {
                        if (userData.characters && userData.characters.find(c => c.id === userData.defaultAvatar)) {
                            const chosenDefaultAvatar = userData.characters.find(c => c.id === userData.defaultAvatar);
                            chosenDefaultAvatar.customCharacter = true;

                            chosenAvatar = chosenDefaultAvatar;
                        } else if (Object.values(avatars).find(x => x.id === userData.defaultAvatar)) {
                            const chosenDefaultAvatar = Object.values(avatars).find(x => x.id === userData.defaultAvatar);
                            chosenDefaultAvatar.customCharacter = false;

                            chosenAvatar = chosenDefaultAvatar;
                        }
                    }
                }

                this.socketService.gameSocket.emit('setUser', user.uid, userName, this.vm.room.id, this.vm.userIsHost, chosenAvatar);
                this.socketService.gameSocket.emit('sendMessage', this.vm.room.id, {
                    sender: 'SERVER',
                    uid: 'SERVER',
                    message: `${userName} connected to the room`,
                    timestamp: Date.now()
                });
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
                selectedPlayers: () => this.vm.players,
                multiplayer: () => true
            }
        }).result.then(closeResponse => {
            $('.mainWrapper').css('filter', 'none');
            $('.mainWrapper').css('-webkit-filter', 'none');

            if (!objectsAreEqual(closeResponse.avatar, currentSelectedPlayer.avatar)) {
                this.socketService.gameSocket.emit('updateAvatar', this.vm.room.id, uid, closeResponse.avatar);
            }

            console.log(closeResponse);
        });
    }

    addSocketListeners() {
        this.socketService.gameSocket.on('updatedColorOfPlayer', (playerUid, playerColor) => {
            const player = this.vm.players.find(p => p.userUid === playerUid);
            if (player) {
                player.color = playerColor;
            }
        });

        this.socketService.gameSocket.on('messagesUpdated', (messages) => {
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

        this.socketService.gameSocket.on('kicked', () => {
            this.$rootScope.currentLobby = '';
            this.$rootScope.currentGamePhase = GAME_PHASES.MULTIPLAYER_LOBBIES;
            this.toastService.errorToast('', 'You have been kicked from the lobby.');
            this.socketService.disconnectGameSocket()
        });

        this.socketService.gameSocket.on('hostLeft', () => {
            this.$rootScope.currentLobby = '';
            this.$rootScope.currentGamePhase = GAME_PHASES.MULTIPLAYER_LOBBIES;
            this.toastService.infoToast('', 'The host has left the game.');
            this.socketService.disconnectGameSocket();
        });

        this.socketService.gameSocket.on('updatedPlayers', players => {
            this.setPlayers(players);
            console.log('Players updated in room', this.vm.players);
        });

        this.socketService.gameSocket.on('updatedLockedSlots', lockedSlots => {
            this.vm.lockedSlots = lockedSlots;
            this.setPlayers(this.vm.players);
            this.vm.room.maxNumberOfPlayer = (CONSTANTS.MAX_NUMBER_OF_PLAYERS - this.vm.lockedSlots.length);
        });

        this.socketService.gameSocket.on('setTurnLengthNotifier', turnLength => {
            this.vm.turnLength = turnLength;
            this.$rootScope.turnLength = turnLength;
            this.$scope.$apply();
            window.dispatchEvent(new Event('resize'));
        });

        this.socketService.gameSocket.on('setAiSpeedNotifier', aiSpeed => {
            this.vm.aiSpeed = aiSpeed;
            this.$scope.$apply();
            window.dispatchEvent(new Event('resize'));
        });

        this.socketService.gameSocket.on('setGoalNotifier', chosenGoal => {
            this.vm.chosenGoal = chosenGoal;
            this.$scope.$apply();
        });

        this.socketService.gameSocket.on('gameStarted', (players, victoryGoal, map, turn, troopsToDeploy) => {
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
        this.socketService.gameSocket.emit('sendMessage', this.vm.room.id, {
            sender: userName,
            uid: user.uid,
            message: this.vm.lobbyChatMessage,
            timestamp: Date.now()
        });
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

        this.socketService.gameSocket.emit('sendMessage', this.vm.room.id, {
            sender: 'SERVER',
            uid: 'SERVER',
            message: `${userName} left the room`,
            timestamp: Date.now()
        });

        this.$rootScope.currentLobby = '';
        this.$rootScope.currentGamePhase = GAME_PHASES.MULTIPLAYER_LOBBIES;
        this.socketService.disconnectGameSocket();
    }

    kickPlayer(player) {
        this.socketService.gameSocket.emit('kickPlayer', this.vm.room.id, player.userUid);
    }

    lockUnlockSlot(index) {
        if (this.vm.lockedSlots.includes(index)) {
            this.vm.lockedSlots = this.vm.lockedSlots.filter(x => x !== index);
        } else {
            this.vm.lockedSlots.push(index);
        }

        this.socketService.gameSocket.emit('lockedSlots', this.vm.lockedSlots, this.vm.room.id);

        this.vm.room.maxNumberOfPlayer = (CONSTANTS.MAX_NUMBER_OF_PLAYERS - this.vm.lockedSlots.length);
        this.socketService.lobbiesSocket.emit('setMaxNumberOfPlayers', this.vm.room.maxNumberOfPlayer, this.vm.room.id);
    }

    existingPlayers() {
        return this.vm.players.filter(x => x !== undefined);
    }

    startGameIsDisabled() {
        return this.existingPlayers().length < CONSTANTS.MIN_NUMBER_OF_PLAYERS;
    }

    startGame() {
        this.socketService.gameSocket.emit('startGame', this.vm.room.id);
    }
}

module.exports = LobbiesController;