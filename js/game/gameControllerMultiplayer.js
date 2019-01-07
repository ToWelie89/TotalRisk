const firebase = require('firebase/app');
require('firebase/auth');
require('firebase/database');
const {
    GAME_PHASES,
    TURN_PHASES,
    ATTACK_MUSIC
} = require('./../gameConstants');
const { normalizeTimeFromTimestamp, getRandomColor } = require('./../helpers');
const { displayReinforcementNumbers, displayDamageNumbers } = require('./../animations/animations');
const { getTerritoryByName } = require('./../map/mapHelpers');
const { PLAYER_TYPES } = require('./../player/playerConstants');

const GameController = require('./gameController');

class GameControllerMultiplayer extends GameController {
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
        this.vm.timerWidth = 0;

        this.$rootScope.$watch('currentLobby', () => {
            this.vm.currentLobby = this.$rootScope.currentLobby;
        });

        this.globalChatColor = getRandomColor();

        this.vm.isMyTurn = this.isMyTurn;

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

        this.socketService.gameSocket.emit('sendMessage', this.vm.currentLobby.id, {
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

    nextTurn() {
        if (this.checkIfNextIsDisabled()) {
            this.soundService.denied.play();
            return;
        }
        this.socketService.gameSocket.emit('nextTurn');
    }

    isMyTurn() {
        return this.gameEngine.turn.player.userUid === this.vm.myUid;
    }

    turnInCards() {
        if (!this.isMyTurn()) {
            return;
        }

        this.soundService.tick.play();

        this.$uibModal.open({
            templateUrl: 'src/modals/cardTurnInModal.html',
            backdrop: 'static',
            windowClass: 'riskModal',
            controller: 'cardTurnInModalController',
            controllerAs: 'cardTurnIn',
            resolve: {
                data: () => {
                    return {
                        type: 'normal'
                    }
                }
            }
        }).result.then(closeResponse => {
            if (closeResponse && closeResponse.newTroops) {
                console.log(`Cards turned in for ${closeResponse.newTroops} new troops`);
                $('.mainTroopIndicator').addClass('animated infinite bounce');
                this.soundService.cardTurnIn.play();
                this.gameEngine.troopsToDeploy += closeResponse.newTroops;
                this.vm.troopsToDeploy = this.gameEngine.troopsToDeploy;
                setTimeout(() => {
                    this.$scope.$apply();
                }, 100);
                setTimeout(() => {
                    $('.mainTroopIndicator').removeClass('animated infinite bounce');
                }, 1000);

                // Update stats
                this.gameEngine.players.get(this.gameEngine.turn.player.name).statistics.cardCombinationsUsed += 1;
            }
        });
    }

    engageAttackPhase(clickedTerritory) {
        this.$uibModal.open({
            templateUrl: 'src/modals/attackModal.html',
            backdrop: 'static',
            windowClass: 'riskModal',
            controller: 'attackModalController',
            controllerAs: 'attack',
            keyboard: false,
            resolve: {
                attackData: () => {
                    return {
                        territoryAttacked: clickedTerritory,
                        attackFrom: this.gameEngine.selectedTerritory,
                        attacker: this.gameEngine.players.get(this.gameEngine.selectedTerritory.owner),
                        defender: this.gameEngine.players.get(clickedTerritory.owner),
                        multiplayer: true
                    }
                }
            }
        }).result.then(closeResponse => {
            this.gameEngine.setMusic();
            console.log('Battle is over ', closeResponse);
            this.updatePlayerDataAfterAttack(closeResponse);
            this.gameEngine.checkIfPlayerWonTheGame();
        });
    }

    setCurrentGamePhaseWatcher() {
        this.$rootScope.$watch('currentGamePhase', () => {
            if (this.$rootScope.currentGamePhase === GAME_PHASES.GAME_MULTIPLAYER) {
                this.initiateTimer();

                const user = firebase.auth().currentUser;
                this.vm.myUid = user.uid;
                this.mapService.init('multiplayerMap', true, this.vm.myUid);
                this.setListeners();
                this.startGame(this.$rootScope.players, this.$rootScope.chosenGoal);
                this.setSocketListeners();
                this.socketService.gameSocket.emit('getMessages');
                this.vm.troopsToDeploy = this.gameEngine.troopsToDeploy;
                this.mapService.updateMapForMultiplayer(this.gameEngine.filter, this.vm.myUid);
            }
        });
    }

    clickCountry(evt) {
        if (this.gameEngine.turn.player.type !== PLAYER_TYPES.HUMAN || !this.isMyTurn()) {
            return;
        }

        let country = evt.target.getAttribute('id');
        if (!country) {
            country = evt.target.getAttribute('for');
        }
        const clickedTerritory = getTerritoryByName(this.gameEngine.map, country);

        if (this.gameEngine.turn.turnPhase === TURN_PHASES.DEPLOYMENT) {
            if (this.gameEngine.troopsToDeploy > 0 && clickedTerritory.owner === this.gameEngine.turn.player.name) {
                // this.soundService.addTroopSound.play();
                displayReinforcementNumbers(clickedTerritory.name);

                this.socketService.gameSocket.emit('troopAddedToTerritory', clickedTerritory.name)
            } else {
                this.soundService.denied.play();
            }
        } else if (this.gameEngine.turn.turnPhase === TURN_PHASES.ATTACK) {
            if (this.gameEngine.selectedTerritory &&
                clickedTerritory.owner !== this.gameEngine.turn.player.name &&
                clickedTerritory.adjacentTerritories.includes(this.gameEngine.selectedTerritory.name) &&
                this.gameEngine.selectedTerritory.numberOfTroops > 1) {

                this.gameEngine.setMusic(ATTACK_MUSIC);
                this.engageAttackPhase(clickedTerritory);
            } else {
                this.gameEngine.selectedTerritory = clickedTerritory;
                this.mapService.updateMapForMultiplayer(this.gameEngine.filter, this.vm.myUid);
                this.mapService.hightlightTerritory(country);
            }
        } else if (this.gameEngine.turn.turnPhase === TURN_PHASES.MOVEMENT) {
            if (this.gameEngine.selectedTerritory &&
                this.gameEngine.selectedTerritory.name === clickedTerritory.name) {
                this.gameEngine.selectedTerritory = undefined;
                this.mapService.updateMapForMultiplayer(this.gameEngine.filter, this.vm.myUid);
            } else if (this.gameEngine.selectedTerritory &&
                       clickedTerritory.owner === this.gameEngine.turn.player.name &&
                       this.gameEngine.selectedTerritory.numberOfTroops > 1 &&
                       clickedTerritory.name !== this.gameEngine.selectedTerritory.name &&
                       this.mapService.getTerritoriesForMovement(this.gameEngine.selectedTerritory).includes(clickedTerritory.name)) {
                // move troops
                this.engageMovementPhase(clickedTerritory);
            } else {
                this.gameEngine.selectedTerritory = clickedTerritory;
                this.mapService.updateMapForMultiplayer(this.gameEngine.filter, this.vm.myUid);
                if (this.gameEngine.selectedTerritory.numberOfTroops > 1) {
                    this.mapService.hightlightTerritory(country);
                }
            }
        }
    }

    checkIfNextIsDisabled() {
        if (!this.gameEngine.turn) {
            return;
        }
        if (!this.isMyTurn()) {
            return true;
        }
        if (this.gameEngine.turn.turnPhase === TURN_PHASES.DEPLOYMENT && this.gameEngine.troopsToDeploy > 0) {
            return true;
        }
        return false;
    }

    updateGameAfterMovement(closeResponse) {
        const movementFromTerritory = getTerritoryByName(this.gameEngine.map, closeResponse.from.name);
        movementFromTerritory.numberOfTroops = closeResponse.from.numberOfTroops === 0 ? 1 : closeResponse.from.numberOfTroops;

        const movementToTerritory = getTerritoryByName(this.gameEngine.map, closeResponse.to.name);
        movementToTerritory.numberOfTroops = closeResponse.to.numberOfTroops;

        this.socketService.gameSocket.emit('updateMovement', movementFromTerritory.name, movementFromTerritory.numberOfTroops, movementToTerritory.name, movementToTerritory.numberOfTroops);

        this.mapService.updateMapForMultiplayer(this.gameEngine.filter, this.vm.myUid);
    }

    initiateTimer() {
        clearInterval(this.turnTimer);
        const turnLength = this.$rootScope.turnLength;
        const turnLengthMs = (turnLength * 1000);
        this.turnTimerSeconds = turnLengthMs;
        this.turnTimerFunction = () => {
            this.turnTimerSeconds -= 100;
            const totalWidth = $("#timerBar").width();
            const widthPercentage = (this.turnTimerSeconds === 0) ? 100 : ((turnLengthMs - this.turnTimerSeconds) / turnLengthMs);
            this.vm.timerWidth = Math.floor(widthPercentage * totalWidth);
            this.vm.secondsLeft = Math.floor(this.turnTimerSeconds / 1000);

            this.$scope.$apply();
            if (this.turnTimerSeconds <= 0) {
              clearInterval(this.turnTimer);
            }
        };
        this.turnTimer = setInterval(this.turnTimerFunction, 100);
    }

    setSocketListeners() {
        this.socketService.gameSocket.on('playerWonNotifier', () => {

        });

        this.socketService.gameSocket.on('troopAddedToTerritoryNotifier', (territoryName) => {
            this.gameEngine.addTroopToTerritory(territoryName);
            this.vm.troopsToDeploy = this.gameEngine.troopsToDeploy;
            this.$scope.$apply();

            this.soundService.addTroopSound.play();
            displayReinforcementNumbers(territoryName);

            this.mapService.updateMapForMultiplayer(this.gameEngine.filter, this.vm.myUid);
        });

        this.socketService.gameSocket.on('nextTurnNotifier', (turn, reinforcements) => {
            if (turn.newPlayer) {
                this.initiateTimer();
            }

            this.gameEngine.turn = turn;
            this.vm.turn = this.gameEngine.turn;
            if (reinforcements) {
                this.gameEngine.troopsToDeploy = reinforcements;
                this.vm.troopsToDeploy = this.gameEngine.troopsToDeploy;
            }
            this.$scope.$apply();

            this.soundService.tick.play();

            if (this.settings.showAnnouncer) {
                this.turnPresenterIsOpen = true;
                this.$uibModal.open({
                    templateUrl: 'src/modals/turnPresentationModal.html',
                    backdrop: 'static',
                    windowClass: 'riskModal',
                    controller: 'turnPresentationController',
                    controllerAs: 'turnPresentation',
                    keyboard: false,
                    resolve: {
                        data: () => {
                            return {
                                type: 'newTurn'
                            };
                        }
                    }
                }).result.then(closeResponse => {
                    this.mapService.updateMapForMultiplayer(this.gameEngine.filter, this.vm.myUid);
                    this.turnPresenterIsOpen = false;
                    if (this.escapeWasPressed) {
                        this.openPauseModal();
                    }
                });
            } else {
                this.mapService.updateMapForMultiplayer(this.gameEngine.filter, this.vm.myUid);
            }
        });

        this.socketService.gameSocket.on('battleFoughtNotifier', (battleData) => {
            getTerritoryByName(this.gameEngine.map, battleData.attackerTerritory).numberOfTroops = battleData.attackerNumberOfTroops;
            getTerritoryByName(this.gameEngine.map, battleData.defenderTerritory).numberOfTroops = battleData.defenderNumberOfTroops;

            if (battleData.attackerCasualties) {
                displayDamageNumbers(battleData.attackerTerritory, battleData.attackerCasualties);
            }
            if (battleData.defenderCasualties) {
                displayDamageNumbers(battleData.defenderTerritory, battleData.defenderCasualties);
            }
            if (battleData.attackerCasualties || battleData.defenderCasualties) {
                this.soundService.muskets.play();
            }

            this.mapService.updateMapForMultiplayer(this.gameEngine.filter, this.vm.myUid);
        });

        this.socketService.gameSocket.on('updateOwnerAfterSuccessfulInvasionNotifier', (updateOwnerData) => {
            getTerritoryByName(this.gameEngine.map, updateOwnerData.attackerTerritory).numberOfTroops = updateOwnerData.attackerTerritoryNumberOfTroops;
            getTerritoryByName(this.gameEngine.map, updateOwnerData.defenderTerritory).numberOfTroops = updateOwnerData.defenderTerritoryNumberOfTroops;
            getTerritoryByName(this.gameEngine.map, updateOwnerData.defenderTerritory).owner = updateOwnerData.owner;

            this.mapService.updateMapForMultiplayer(this.gameEngine.filter, this.vm.myUid);
            this.soundService.movement.play();
        });

        this.socketService.gameSocket.on('updateMovementNotifier', (map) => {
            this.gameEngine.map.getAllTerritoriesAsList().forEach(t => {
                const territoryFromServer = map.find(x => x.name === t.name);
                t.owner = territoryFromServer.owner;
                t.numberOfTroops = territoryFromServer.numberOfTroops;
            });
        });

        this.socketService.gameSocket.on('messagesUpdated', (messages) => {
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

}

module.exports = GameControllerMultiplayer;