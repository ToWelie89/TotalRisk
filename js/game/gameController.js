const {
    GAME_PHASES,
    TURN_PHASES,
    IN_GAME_MUSIC,
    AI_MUSIC,
    MAX_CARDS_ON_HAND,
    ATTACK_MUSIC,
    PAUSE_MODES
} = require('./../gameConstants');
const {getTerritoryByName, getTerritoriesByOwner, getTerritoriesForMovement} = require('./../map/mapHelpers');
const Player = require('./../player/player');
const {PLAYER_COLORS, avatars, PLAYER_TYPES} = require('./../player/playerConstants');
const {delay, loadSvgIntoDiv, lightenDarkenColor} = require('./../helpers');
const {CARD_TYPE} = require('./../card/cardConstants');
const {displayReinforcementNumbers} = require('./../animations/animations');

const Chart = require('chart.js');

class GameController {

    constructor($scope, $rootScope, $sce, $uibModal, $timeout, gameEngine, soundService, mapService, tutorialService, aiHandler, settings, gameAnnouncerService, socketService) {
        this.vm = this;

        // PUBLIC FUNCTIONS
        this.vm.filterByOwner = this.filterByOwner;
        this.vm.filterByRegion = this.filterByRegion;
        this.vm.nextTurn = this.nextTurn;
        this.vm.turnInCards = this.turnInCards;
        this.vm.checkIfNextIsDisabled = this.checkIfNextIsDisabled;
        this.vm.getCurrentPlayerColor = this.getCurrentPlayerColor;
        this.vm.testAttackPhase = this.testAttackPhase;
        this.vm.testPresentationModal = this.testPresentationModal;
        this.vm.pause = this.pause;
        this.vm.openMenu = this.openMenu;
        this.vm.toArray = this.toArray;
        this.vm.lightenDarkenColor = this.lightenDarkenColor;
        this.vm.CARD_TYPE = CARD_TYPE;
        this.vm.PLAYER_TYPES = PLAYER_TYPES;

        this.vm.turn = {};

        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$sce = $sce;
        this.$uibModal = $uibModal;
        this.$timeout = $timeout;
        this.gameEngine = gameEngine;
        this.soundService = soundService;
        this.mapService = mapService;
        this.aiHandler = aiHandler;
        this.settings = settings;
        this.gameAnnouncerService = gameAnnouncerService;
        this.tutorialService = tutorialService;
        this.socketService = socketService;

        this.elementIds = {
            ownageChart: 'ownageChartSingleplayer',
            troopChart: 'troopChartSingleplayer'
        };

        $(document).ready(function() {
            if ($('[data-toggle="tooltip"]').length) {
                $('[data-toggle="tooltip"]').tooltip();
            }
        });

        this.$scope.$watch('this.gameEngine.troopsToDeploy', (newValue, oldValue) => {
            this.vm.troopsToDeploy = this.gameEngine.troopsToDeploy;
        });

        this.$scope.$watch('gameEngine.troopsToDeploy', (newValue, oldValue) => {
            this.vm.troopsToDeploy = this.gameEngine.troopsToDeploy;
        });

        this.setCurrentGamePhaseWatcher();

        this.startMenuIsOpen = false;
        this.escapeWasPressed = false;
        this.turnPresenterIsOpen = false;

        this.vm.pauseModes = PAUSE_MODES;
        this.vm.gamePaused = PAUSE_MODES.NOT_PAUSED;

        console.log('Initialization of gameController');
    }

    lightenDarkenColor(colorCode, amount) {
        return lightenDarkenColor(colorCode, amount);
    }

    setListeners() {
        this.boundListener = evt => this.escapeEventListener(evt);
        document.addEventListener('keyup', this.boundListener);

        document.querySelectorAll('.country').forEach(country => {
            var clone = country.cloneNode(true);
            country.parentNode.replaceChild(clone, country);

            clone.addEventListener('click', (e) => {
                this.clickCountry(e);
            });
        });
        document.querySelectorAll('.troopCounter').forEach(country => {
            var clone = country.cloneNode(true);
            country.parentNode.replaceChild(clone, country);

            clone.addEventListener('click', (e) => {
                this.clickCountry(e);
            });
        });
        document.querySelectorAll('.troopCounterText').forEach(country => {
            var clone = country.cloneNode(true);
            country.parentNode.replaceChild(clone, country);

            clone.addEventListener('click', (e) => {
                this.clickCountry(e);
            });
        });
    }

    setCurrentGamePhaseWatcher() {
        this.$rootScope.$watch('currentGamePhase', () => {
            if (this.$rootScope.currentGamePhase === GAME_PHASES.GAME) {
                this.mapService.init('map');
                this.setListeners();
                this.startGame(this.$rootScope.players, this.$rootScope.chosenGoal);
            } else if (this.$rootScope.currentGamePhase === GAME_PHASES.AI_TESTING) {
                this.startGame(this.$rootScope.players, this.$rootScope.chosenGoal, true);
            } else if (this.$rootScope.currentGamePhase === GAME_PHASES.END_SCREEN) {
                if (this.gameEngine.aiTesting) {
                    this.$rootScope.currentGamePhase = GAME_PHASES.AI_TESTING;
                }
                this.handleVictory();
            }
        });
    }

    startGame(players, winningCondition, aiTesting = false) {
        this.gameEngine.startGame(players, winningCondition, aiTesting);
        this.gameEngine.currentGameIsMultiplayer = false;
        this.vm.troopsToDeploy = this.gameEngine.troopsToDeploy;
        this.vm.chosenGoal = this.gameEngine.winningCondition.percentage;

        this.vm.turn = this.gameEngine.turn;
        this.vm.filter = this.gameEngine.filter;
        this.mapService.updateMap(this.gameEngine.filter);

        this.vm.aiTurn = this.gameEngine.turn.player.type !== PLAYER_TYPES.HUMAN;

        this.setChartData();

        const callback = () => {
            if (this.gameEngine.turn.player.type === PLAYER_TYPES.HUMAN) {
                this.checkIfPlayerMustTurnInCards();
            } else {
                this.handleAi();
            }
        };

        if (this.settings.showAnnouncer) {
            this.turnPresenterIsOpen = true;
            this.$uibModal.open({
                templateUrl: 'src/modals/turnPresentationModal.html',
                backdrop: 'static',
                windowClass: 'riskModal turnPresentationModalWrapper',
                controller: 'turnPresentationController',
                controllerAs: 'turnPresentation',
                keyboard: false,
                resolve: {
                    data: () => {
                        return {
                            type: 'startGame'
                        };
                    }
                }
            }).result.then(closeResponse => {
                callback();
                this.turnPresenterIsOpen = false;
                if (this.escapeWasPressed) {
                    this.openPauseModal();
                }
            });
        } else {
            callback();
        }
    }

    setChartData() {
        if (this.ownageChart) {
            this.ownageChart.destroy();
        }
        if (this.troopChart) {
            this.troopChart.destroy();
        }

        const options = {
            segmentShowStroke: false,
            legend: {
                display: false
            },
            tooltips: {
                 enabled: false
            },
            hover: {
                mode: null
            }
        };

        // Init ownage percentage chart
        const ownageChartCtx = document.getElementById(this.elementIds.ownageChart);
        this.ownageChart = new Chart(ownageChartCtx, {
            type: 'pie',
            data: {
                datasets: [{
                    data: this.gameEngine.standings.map(x => x.percentageOwned),
                    backgroundColor: this.gameEngine.standings.map(x => x.name).map(name => this.gameEngine.players.get(name).color.mainColor),
                    borderWidth: 0
                }]
            },
            options
        });
        // Init troop chart
        const troopChartCtx = document.getElementById(this.elementIds.troopChart);
        this.troopChart = new Chart(troopChartCtx, {
            type: 'pie',
            data: {
                datasets: [{
                    data: this.gameEngine.standings.map(x => x.totalTroops),
                    backgroundColor: this.gameEngine.standings.map(x => x.name).map(name => this.gameEngine.players.get(name).color.mainColor),
                    borderWidth: 0
                }]
            },
            options
        });

        this.updateChartData();
    }

    updateChartData() {
        this.gameEngine.updateStandings();

        this.ownageChart.data.datasets[0].data = this.gameEngine.standings.map(x => x.percentageOwned);
        this.ownageChart.update();

        this.troopChart.data.datasets[0].data = this.gameEngine.standings.map(x => x.totalTroops);
        this.troopChart.update();

        this.vm.currentOwnagePercentage = this.gameEngine.standings.find(x => x.name === this.gameEngine.turn.player.name).percentageOwned;

        // Ownage percentage chart tooltip
        let ownageHtml = '<div class="mapControlTooltip"><h3>Map control</h3>';

        const percentageStandings = this.gameEngine.standings.sort((a, b) => b.percentageOwned - a.percentageOwned);
        percentageStandings.forEach(standing => {
            ownageHtml += `
                <div class="textLeft">
                    <div class="mapControlTooltip__colorBox" style="background-color: ${this.gameEngine.players.get(standing.name).color.mainColor}"></div>
                    <div class="mapControlTooltip__nameBox">${standing.name} (${standing.percentageOwned}%)</div>
                </div>
            `;
        });
        ownageHtml += '</div>'
        this.vm.ownageChartTooltip = this.$sce.trustAsHtml(ownageHtml);

        // Troop chart tooltip
        let troopHtml = '<div class="mapControlTooltip"><h3>Total troops</h3>';
        const troopStandings = this.gameEngine.standings.sort((a, b) => b.totalTroops - a.totalTroops);
        troopStandings.forEach(standing => {
            troopHtml += `
                <div class="textLeft">
                    <div class="mapControlTooltip__colorBox" style="background-color: ${this.gameEngine.players.get(standing.name).color.mainColor}"></div>
                    <div class="mapControlTooltip__nameBox">${standing.name} (${standing.totalTroops} troops)</div>
                </div>
            `;
        });
        troopHtml += '</div>'
        this.vm.troopChartTooltip = this.$sce.trustAsHtml(troopHtml);
    }

    toArray(num) {
        return new Array(num);
    }

    handleVictory() {
        this.vm.playerWhoWon = this.gameEngine.players.get(this.gameEngine.playerWhoWon);
        if (this.vm.playerWhoWon.avatar.svg) {
            loadSvgIntoDiv(this.vm.playerWhoWon.avatar.svg, '#victoryPortraitSinglePlayer');
        }

        var flagW = 250;
        var flagElementW = 2;
        var len = flagW/flagElementW;
        var delay = 10;
        var flag = document.getElementById('victoryFlagSingleplayer');
        flag.innerHTML = '';
        for(var i = 0; i < len; i++){
            var fe = document.createElement('div');
            fe.className = 'flag-element';
            fe.style.backgroundSize = 250 + 'px 100%';
            fe.style.backgroundPosition = -i*flagElementW+'px 0';
            fe.style.webkitAnimationDelay = i*delay+'ms';
            fe.style.animationDelay = i * delay + 'ms';
            fe.style.webkitAnimationDelay = i*delay+'ms';
            flag.appendChild(fe);
        }
        $('#victoryFlagSingleplayer .flag-element').css('background-image', `url(${this.vm.playerWhoWon.avatar.flag})`);
    }

    handleAi() {
        this.aiHandler.update();

        this.aiHandler.updateCallback = () => {
            this.$timeout(() => {
                this.vm.troopsToDeploy = this.gameEngine.troopsToDeploy;
                this.$scope.$apply();
            });
        };

        Promise.resolve()
        .then(() => this.pauser())
        .then(() => this.aiHandler.turnInCards())
        .then(() => this.pauser())
        .then(() => this.aiHandler.contemplateAlternativesForAttack())
        .then(() => this.pauser())
        .then(() => this.aiHandler.deployTroops(() => {
            this.vm.troopsToDeploy = this.gameEngine.troopsToDeploy;
            this.updateChartData();
            this.$scope.$apply();
        }))
        .then(() => this.pauser())
        .then(() => this.nextTurnAI())
        .then(() => this.pauser())
        .then(() => this.aiHandler.attackTerritories(() => {
            this.updateChartData();
        }))
        .then(() => this.pauser())
        .then(() => this.nextTurnAI())
        .then(() => this.pauser())
        .then(() => this.aiHandler.movementPhase())
        .then(() => this.pauser())
        .then(() => {
            this.nextTurn();
            this.$scope.$apply();
        })
        .catch((reason) => {
            if (reason === 'playerWon') {
                console.log('GAME OVER!');
            } else {
                console.log('AI error', reason);
            }
        });
    }

    openMenu() {
        this.soundService.tick.play();
        this.openPauseModal();
    }

    escapeEventListener(e) {
        if (this.$rootScope.currentGamePhase === GAME_PHASES.TUTORIAL) {
            if (e.keyCode === 27) {
                this.gameEngine.isTutorialMode = false;
                this.vm.isTutorialMode = false;
                this.$rootScope.currentGamePhase = GAME_PHASES.MAIN_MENU;
                this.gameEngine.setMusic(IN_GAME_MUSIC);
                this.gameEngine.setMusicVolume(this.settings.musicVolume);
                this.gameAnnouncerService.mute();
                this.$scope.$apply();
            }
        } else if (this.$rootScope.currentGamePhase === GAME_PHASES.GAME || this.$rootScope.currentGamePhase === GAME_PHASES.GAME_MULTIPLAYER) {
            if (e.keyCode === 27) {
                this.escapeWasPressed = true;
            }

            if (this.turnPresenterIsOpen) return;

            if (e.keyCode === 27 && !this.startMenuIsOpen) {
                this.openPauseModal();
            }
        }
    }

    openPauseModal() {
        this.startMenuIsOpen = true;
        if (this.aiTurn && this.vm.gamePaused !== PAUSE_MODES.PAUSED) {
            this.vm.gamePaused = PAUSE_MODES.PAUSED;
        }

        this.$uibModal.open({
            templateUrl: 'src/modals/pauseMenuModal.html',
            backdrop: 'static',
            windowClass: 'riskModal',
            controller: 'pauseMenuModalController',
            controllerAs: 'pauseMenu',
            keyboard: false
        }).result.then(closeResponse => {
            if (this.aiTurn && this.vm.gamePaused === PAUSE_MODES.PAUSED) {
                this.vm.gamePaused = PAUSE_MODES.NOT_PAUSED;
            }
            this.startMenuIsOpen = false;
            this.escapeWasPressed = false;
        });
    }

    pause() {
        this.vm.gamePaused = (this.vm.gamePaused === PAUSE_MODES.NOT_PAUSED) ? PAUSE_MODES.PAUSING : PAUSE_MODES.NOT_PAUSED;

        if (this.vm.gamePaused === PAUSE_MODES.PAUSING) {
            this.vm.pausingDots = '';
            this.dotAnimationInterval = setInterval(() => {
                if (this.vm.pausingDots === '...') {
                    this.vm.pausingDots = '.';
                } else {
                    this.vm.pausingDots += '.';
                }
                this.$scope.$apply();
            }, 500);
        }
    }

    pauser() {
        if (this.vm.gamePaused === PAUSE_MODES.NOT_PAUSED) {
            return;
        }
        clearInterval(this.dotAnimationInterval);
        this.vm.gamePaused = PAUSE_MODES.PAUSED;
        this.$scope.$apply();
        return delay(500).then(() => this.pauser());
    }

    checkIfPlayerMustTurnInCards() {
        if (this.vm.turn.turnPhase === TURN_PHASES.DEPLOYMENT) {
            this.vm.troopsToDeploy = this.gameEngine.troopsToDeploy;

            if (this.vm.turn.player.cards.length >= MAX_CARDS_ON_HAND) {
                this.turnInCards();
            }
        }
    }

    turnInCards() {
        if (this.gameEngine.turn.player.type !== PLAYER_TYPES.HUMAN || this.gameEngine.turn.turnPhase !== TURN_PHASES.DEPLOYMENT) {
            return;
        }

        this.soundService.tick.play();

        this.$uibModal.open({
            templateUrl: 'src/modals/cardTurnInModal.html',
            backdrop: 'static',
            windowClass: 'riskModal cardTurnInModalWrapper',
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

                this.gameEngine.turn.player.cards = closeResponse.newHand;

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
                if (!this.gameEngine.currentGameIsMultiplayer) {
                    this.gameEngine.players.get(this.gameEngine.turn.player.name).statistics.cardCombinationsUsed += 1;
                }
            }
        });
    }

    nextTurn() {
        if (this.checkIfNextIsDisabled()) {
            this.soundService.denied.play();
            return;
        }

        const callback = () => {
            this.mapService.updateMap(this.gameEngine.filter);
            if (this.gameEngine.turn.player.type === PLAYER_TYPES.HUMAN) {
                this.checkIfPlayerMustTurnInCards();
            }
            console.log('New turn: ', this.vm.turn);
            console.log('Current carddeck: ', this.gameEngine.cardDeck);

            this.gameEngine.setMusic(this.gameEngine.turn.player.type === PLAYER_TYPES.HUMAN ? IN_GAME_MUSIC : AI_MUSIC);

            if (this.gameEngine.turn.player.type !== PLAYER_TYPES.HUMAN) {
                this.handleAi();
            }

            this.vm.currentOwnagePercentage = this.gameEngine.standings.find(x => x.name === this.gameEngine.turn.player.name).percentageOwned;
        };

        this.soundService.tick.play();
        this.vm.turn = this.gameEngine.nextTurn();
        this.vm.aiTurn = this.gameEngine.turn.player.type !== PLAYER_TYPES.HUMAN;

        if (this.settings.showAnnouncer) {
            this.turnPresenterIsOpen = true;
            this.$uibModal.open({
                templateUrl: 'src/modals/turnPresentationModal.html',
                backdrop: 'static',
                windowClass: 'riskModal turnPresentationModalWrapper',
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
                callback();
                this.turnPresenterIsOpen = false;
                if (this.escapeWasPressed) {
                    this.openPauseModal();
                }
            });
        } else {
            callback();
        }
    }

    nextTurnAI () {
        this.vm.turn = this.gameEngine.nextTurn();
        if (this.settings.showAnnouncer) {
            return new Promise((resolve, reject) => {
                this.turnPresenterIsOpen = true;
                return this.$uibModal.open({
                    templateUrl: 'src/modals/turnPresentationModal.html',
                    backdrop: 'static',
                    windowClass: 'riskModal turnPresentationModalWrapper',
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
                    this.mapService.updateMap(this.gameEngine.filter);
                    this.turnPresenterIsOpen = false;
                    if (this.escapeWasPressed) {
                        this.openPauseModal();
                    }
                    resolve();
                });
            });
        } else {
            return new Promise((resolve, reject) => {
                this.mapService.updateMap(this.gameEngine.filter);
                resolve();
            });
        }
    }

    filterByOwner() {
        this.soundService.tick.play();
        this.vm.filter = 'byOwner';
        this.gameEngine.filter = 'byOwner';
        this.mapService.updateMap(this.gameEngine.filter);
    }

    filterByRegion() {
        this.soundService.tick.play();
        this.vm.filter = 'byRegion';
        this.gameEngine.filter = 'byRegion';
        this.mapService.updateMap(this.gameEngine.filter);
    }

    checkIfNextIsDisabled() {
        if (!this.gameEngine.turn) {
            return;
        }
        if (this.gameEngine.turn.turnPhase === TURN_PHASES.DEPLOYMENT && this.gameEngine.troopsToDeploy > 0) {
            return true;
        }
        return false;
    }

    getCurrentPlayerColor() {
        if (!this.vm.turn || !this.vm.turn.player) {
            return;
        }

        return this.gameEngine.players && this.gameEngine.players.get(this.vm.turn.player.name) ?
                        this.gameEngine.players.get(this.vm.turn.player.name).color.mainColor : '';
    }

    testAttackPhase(players) {
        this.gameEngine.startGame(players);
        this.vm.turn = this.gameEngine.turn;
        const clickedTerritory = getTerritoryByName(this.gameEngine.map, 'Egypt');
        const attackFrom = getTerritoryByName(this.gameEngine.map, 'Scandinavia');
        clickedTerritory.owner = 'Julius Caesar';
        clickedTerritory.numberOfTroops = 5;
        attackFrom.owner = 'Napoleon Bonaparte';
        attackFrom.numberOfTroops = 3;
        this.gameEngine.selectedTerritory = attackFrom;

        this.gameEngine.setMusic(ATTACK_MUSIC);
        this.engageAttackPhase(clickedTerritory);
    }

    engageAttackPhase(clickedTerritory) {
        this.$uibModal.open({
            templateUrl: 'src/modals/attackModal.html',
            backdrop: 'static',
            windowClass: 'riskModal attackModalWrapper',
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
                        multiplayer: false
                    }
                }
            }
        }).result.then(closeResponse => {
            this.gameEngine.setMusic(IN_GAME_MUSIC);
            console.log('Battle is over ', closeResponse);
            this.updatePlayerDataAfterAttack(closeResponse);
            this.updateChartData();
            this.gameEngine.checkIfPlayerWonTheGame();
        });
    }

    updatePlayerDataAfterAttack(closeResponse) {
        const territoryAttacking = getTerritoryByName(this.gameEngine.map, closeResponse.attackFrom.name);

        territoryAttacking.owner = closeResponse.attackFrom.owner;
        territoryAttacking.numberOfTroops = closeResponse.attackFrom.numberOfTroops === 0 ? 1 : closeResponse.attackFrom.numberOfTroops;

        const territoryAttacked = getTerritoryByName(this.gameEngine.map, closeResponse.attackTo.name);

        territoryAttacked.owner = closeResponse.attackTo.owner;
        territoryAttacked.numberOfTroops = closeResponse.attackTo.numberOfTroops;

        if (closeResponse.battleWasWon) {
            if (!this.gameEngine.turn.playerHasWonAnAttackThisTurn) {
                this.soundService.cardSelect.play();
            }
            this.gameEngine.takeCard(closeResponse.attackFrom.owner);

            const territories = getTerritoriesByOwner(this.gameEngine.map, closeResponse.previousOwner);
            if (territories.length === 0) {
                // The losing player was defeated entirely
                const resp = this.gameEngine.handleDefeatedPlayer(closeResponse.previousOwner, territoryAttacking.owner);
                if (resp.length > 0) {
                    this.soundService.cardSelect.play();
                }
            }
        }

        if (!this.gameEngine.currentGameIsMultiplayer) {
            // Update statistics
            const attacker = closeResponse.attackFrom.owner;
            const defender = closeResponse.battleWasWon ? closeResponse.previousOwner : closeResponse.attackTo.owner;

            if (closeResponse.battleWasWon) {
                this.gameEngine.players.get(attacker).statistics.battlesWon += 1;
                this.gameEngine.players.get(defender).statistics.battlesLost += 1;
            } else if (closeResponse.retreat) {
                this.gameEngine.players.get(attacker).statistics.retreats += 1;
            } else {
                this.gameEngine.players.get(attacker).statistics.battlesLost += 1;
                this.gameEngine.players.get(defender).statistics.battlesWon += 1;
            }

            this.gameEngine.players.get(attacker).statistics.troopsKilled += closeResponse.defenderTotalCasualites;
            this.gameEngine.players.get(attacker).statistics.troopsLost += closeResponse.attackerTotalCasualites;
            this.gameEngine.players.get(defender).statistics.troopsKilled += closeResponse.attackerTotalCasualites;
            this.gameEngine.players.get(defender).statistics.troopsLost += closeResponse.defenderTotalCasualites;
        }

        this.mapService.updateMap(this.vm.filter);
    }

    clickCountry(evt) {
        if (this.gameEngine.turn.player.type !== PLAYER_TYPES.HUMAN) {
            return;
        }

        let country = evt.target.getAttribute('id');
        if (!country) {
            country = evt.target.getAttribute('for');
        }
        const clickedTerritory = getTerritoryByName(this.gameEngine.map, country);

        if (this.gameEngine.turn.turnPhase === TURN_PHASES.DEPLOYMENT) {
            if (this.gameEngine.troopsToDeploy > 0 && clickedTerritory.owner === this.gameEngine.turn.player.name) {
                this.soundService.addTroopSound.play();
                displayReinforcementNumbers(clickedTerritory.name);
            } else {
                this.soundService.denied.play();
            }
            this.gameEngine.addTroopToTerritory(country);
            this.updateChartData();
            this.mapService.updateMap(this.gameEngine.filter);
            this.vm.troopsToDeploy = this.gameEngine.troopsToDeploy;
            this.$scope.$apply();
        } else if (this.gameEngine.turn.turnPhase === TURN_PHASES.ATTACK) {
            if (this.gameEngine.selectedTerritory &&
                clickedTerritory.owner !== this.gameEngine.turn.player.name &&
                clickedTerritory.adjacentTerritories.includes(this.gameEngine.selectedTerritory.name) &&
                this.gameEngine.selectedTerritory.numberOfTroops > 1) {

                this.gameEngine.setMusic(ATTACK_MUSIC);
                this.engageAttackPhase(clickedTerritory);
            } else {
                this.gameEngine.selectedTerritory = clickedTerritory;
                this.mapService.updateMap(this.gameEngine.filter);
                this.mapService.hightlightTerritory(country);
            }
        } else if (this.gameEngine.turn.turnPhase === TURN_PHASES.MOVEMENT) {
            if (this.gameEngine.selectedTerritory &&
                this.gameEngine.selectedTerritory.name === clickedTerritory.name) {
                this.gameEngine.selectedTerritory = undefined;
                this.mapService.updateMap(this.gameEngine.filter);
            } else if (this.gameEngine.selectedTerritory &&
                       clickedTerritory.owner === this.gameEngine.turn.player.name &&
                       this.gameEngine.selectedTerritory.numberOfTroops > 1 &&
                       clickedTerritory.name !== this.gameEngine.selectedTerritory.name &&
                       getTerritoriesForMovement(this.gameEngine.selectedTerritory, this.gameEngine.map).includes(clickedTerritory.name)) {
                // move troops
                this.engageMovementPhase(clickedTerritory);
            } else {
                this.gameEngine.selectedTerritory = clickedTerritory;
                this.mapService.updateMap(this.gameEngine.filter);
                if (this.gameEngine.selectedTerritory.numberOfTroops > 1) {
                    this.mapService.hightlightTerritory(country);
                }
            }
        }
    }

    engageMovementPhase(toTerritory) {
        this.$uibModal.open({
            templateUrl: 'src/modals/movementModal.html',
            backdrop: 'static',
            windowClass: 'riskModal',
            controller: 'movementModalController',
            controllerAs: 'movement',
            keyboard: false,
            resolve: {
                data: () => {
                    return {
                        moveTo: toTerritory,
                        moveFrom: this.gameEngine.selectedTerritory
                    };
                }
            }
        }).result.then(closeResponse => {
            if (closeResponse === 'cancelled') {
                return;
            }

            this.gameEngine.setMusic(IN_GAME_MUSIC);
            console.log('Movement complete ', closeResponse);
            this.updateGameAfterMovement(closeResponse);
            this.soundService.movement.play();
            this.nextTurn();
        });
    }

    updateGameAfterMovement(closeResponse) {
        const movementFromTerritory = getTerritoryByName(this.gameEngine.map, closeResponse.from.name);
        movementFromTerritory.numberOfTroops = closeResponse.from.numberOfTroops === 0 ? 1 : closeResponse.from.numberOfTroops;

        const movementToTerritory = getTerritoryByName(this.gameEngine.map, closeResponse.to.name);
        movementToTerritory.numberOfTroops = closeResponse.to.numberOfTroops;

        this.mapService.updateMap(this.vm.filter);
    }
}

module.exports = GameController;