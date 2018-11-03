import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import {
    GAME_PHASES
} from './../gameConstants';
import { normalizeTimeFromTimestamp, getRandomColor } from './../helpers';
import { displayReinforcementNumbers } from './../animations/animations';

import GameController from './gameController';

export default class GameControllerMultiplayer extends GameController {
    constructor($scope, $rootScope, $uibModal, $timeout, gameEngine, soundService, mapService, tutorialService, aiHandler, settings, gameAnnouncerService, socketService) {
        super($scope, $rootScope, $uibModal, $timeout, gameEngine, soundService, mapService, tutorialService, aiHandler, settings, gameAnnouncerService, socketService);

        this.vm.lobbyChatMessage = '';
        this.vm.lobbyChatMessages = [];
        this.vm.globalChatMessage = '';
        this.vm.globalChatMessages = [];
        this.vm.unreadLobbyMessages = 0;
        this.vm.unreadGlobalMessages = 0;
        this.vm.chatMaxLengthMessage = 150;
        this.vm.muteChat = false;
        this.firstLoad = true;
        this.vm.showLobbyChat = true;

        this.$rootScope.$watch('currentLobbyId', () => {
            this.vm.currentLobbyId = this.$rootScope.currentLobbyId;
        });

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
        this.socketService.sendMessage(userName, user.uid, this.vm.lobbyChatMessage, Date.now(), this.vm.currentLobbyId);
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

    setCurrentGamePhaseWatcher() {
        this.$rootScope.$watch('currentGamePhase', () => {
            if (this.$rootScope.currentGamePhase === GAME_PHASES.GAME_MULTIPLAYER) {
                const user = firebase.auth().currentUser;
                this.mapService.init('multiplayerMap');
                this.setListeners();
                this.startGame(this.$rootScope.players, this.$rootScope.chosenGoal);
                this.setSocketListeners();
                this.vm.troopsToDeploy = this.gameEngine.troopsToDeploy;
                this.emit('getMessages');
            }
        });
    }

    setSocketListeners() {
        this.socketService.socket.on('troopAddedToTerritoryNotifier', (territoryName) => {
            this.gameEngine.addTroopToTerritory(territoryName);
            this.vm.troopsToDeploy = this.gameEngine.troopsToDeploy;
            this.$scope.$apply();

            this.soundService.addTroopSound.play();
            displayReinforcementNumbers(territoryName);

            this.mapService.updateMap(this.gameEngine.filter);
        });

        this.socketService.socket.on('messagesUpdated', (messages) => {
            if (!this.vm.muteChat && this.$rootScope.currentGamePhase === GAME_PHASES.GAME_MULTIPLAYER && this.vm.showLobbyChat) {
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
    }

    emit(functionName, args) {
        this.socketService[functionName](...args);
    }

}
