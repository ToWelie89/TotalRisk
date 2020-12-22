import moment from 'moment';

const {GAME_PHASES, VICTORY_GOALS, MAPS} = require('./gameConstants');
const {randomIntFromInterval, randomDoubleFromInterval, runningElectron, electronDevVersion, devMode, loadSvgIntoDiv} = require('./helpers');
const Player = require('./player/player');
const {PLAYER_COLORS, avatars, PLAYER_TYPES} = require('./player/playerConstants');
const {ERROR_TYPES} = require('./autoUpdating/updaterConstants');
const { getTerritoryByName } = require('./map/mapHelpers');

class MainController {

    constructor($scope, $rootScope, $compile, gameEngine, soundService, $uibModal, toastService, mapService) {
        this.vm = this;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$uibModal = $uibModal;
        this.gameEngine = gameEngine;
        this.soundService = soundService;
        this.toastService = toastService;
        this.$compile = $compile;
        this.mapService = mapService;
        // PUBLIC FUNCTIONS
        this.vm.toggleMusicVolume = this.toggleMusicVolume;
        this.vm.startGame = this.startGame;
        this.vm.startTutorial = this.startTutorial;
        this.vm.goBackToMenu = this.goBackToMenu;
        this.vm.setGamePhase = this.setGamePhase;
        this.vm.startNewLocalGame = this.startNewLocalGame;
        this.vm.aiTester = this.aiTester;
        this.vm.quit = this.quit;
        this.vm.testEndScreen = this.testEndScreen;
        this.vm.testAttackModal = this.testAttackModal;
        this.vm.testMovementModal = this.testMovementModal;
        this.vm.closePatchNotes = this.closePatchNotes;

        this.vm.gamePhases = GAME_PHASES;
        this.vm.currentGamePhase = GAME_PHASES.MAIN_MENU;
        this.vm.showOnlineBox = false;

        this.$rootScope.currentGamePhase = this.vm.currentGamePhase;
        this.$rootScope.$watch('currentGamePhase', () => {
            this.vm.currentGamePhase = this.$rootScope.currentGamePhase;
            // Ugly fix for the setting slider bug
            if (this.vm.currentGamePhase === GAME_PHASES.SETTINGS) {
                setTimeout(() => {
                    window.dispatchEvent(new Event('resize'));
                }, 50);
            } else if (this.vm.currentGamePhase === GAME_PHASES.MULTIPLAYER_LOBBIES) {
                setTimeout(() => {
                    document.querySelectorAll('.chatMessagesContainer').forEach(el => {
                        el.scrollTop = el.scrollHeight;
                    });
                }, 20);
            }
        });

        this.vm.runningElectron = runningElectron();
        this.vm.devMode = devMode();

        if (this.vm.runningElectron) {
            this.openUpdaterModal();
            if (electronDevVersion()) {
                $('head title').html('TotalRisk DEV VERSION');
            }

            var shell = electron.shell;
            //open links externally by default
            $(document).on('click', 'a[href^="http"]', function(event) {
                event.preventDefault();
                shell.openExternal(this.href);
            });

            this.vm.appVersion = electron.remote.app.getVersion();

            fetch(`http://martinsonesson.se/totalrisk/patchlog.json?${randomIntFromInterval(111111111111,9999999999999)}`).then(resp => resp.json())
            .then(patchLog => {
                this.vm.currentPatchVersion = this.vm.appVersion;
                this.vm.currentPatchNotes = patchLog[this.vm.appVersion];

                this.vm.patchLogKeys = Object.keys(patchLog);
                this.vm.patchLog = patchLog;
                this.vm.patchLogKeys.forEach((key, i) => {
                    //this.vm.patchLog[key].minimized = i === 0 ? false : true;
                    this.vm.patchLog[key].minimized = true;
                    this.vm.patchLog[key].timestampNormalized = (this.vm.patchLog[key].timestamp) ? moment(Number(this.vm.patchLog[key].timestamp)).format('ll') : undefined;
                });
            });
            this.$rootScope.appVersion = this.vm.appVersion;
        } else {
            fetch('./package.json')
                .then(resp => resp.json())
                .then(data => {
                    this.vm.appVersion = data.version;
                    this.$rootScope.appVersion = this.vm.appVersion;
                    $scope.$apply();
                });
        }

        console.log('Initialization of mainController');
    }

    closePatchNotes() {
        this.soundService.tick.play();
        this.vm.currentPatchNotes = null;
    }

    testMovementModal() {
        const players = Array.from(
            new Array(6), (x, i) =>
                new Player(
                    Object.keys(avatars)[i],
                    Object.keys(PLAYER_COLORS).map(key => PLAYER_COLORS[key])[i],
                    Object.keys(avatars).map(key => avatars[key])[i],
                    PLAYER_TYPES.HUMAN
                )
        );
        this.gameEngine.initMap()
        this.gameEngine.startGame(players, {});
        loadSvgIntoDiv("assets/maps/worldMap/worldMap.svg", '#mapBackgroundForTestingMovement', () => {
            const argentina = getTerritoryByName(this.gameEngine.map, 'Argentina');
            const brazil = getTerritoryByName(this.gameEngine.map, 'Brazil');

            brazil.owner = players[0].name;
            brazil.numberOfTroops = 2;
            argentina.owner = players[0].name;
            argentina.numberOfTroops = 12;

            this.mapService.init('mapBackgroundForTestingMovement');
            this.mapService.updateMap();

            this.$uibModal.open({
                templateUrl: 'src/modals/movementModal.html',
                backdrop: 'static',
                windowClass: 'riskModal',
                controller: 'movementModalController',
                windowClass: 'riskModal movementModalWrapper',
                controllerAs: 'movement',
                keyboard: false,
                resolve: {
                    data: () => {
                        return {
                            moveTo: brazil,
                            moveFrom: argentina,
                            mapSelector: '#mapBackgroundForTestingMovement'
                        };
                    }
                }
            }).result.then(() => {
                $('#mapBackgroundForTestingMovement').html('');
            });
        });

    }

    testAttackModal() {
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
                        territoryAttacked: {name: 'Brazil', owner: 'Kalle', numberOfTroops: 11},
                        attackFrom: {name: 'Argentina', owner: 'Pelle', numberOfTroops: 18},
                        attacker: new Player(
                            'Pelle',
                            Object.keys(PLAYER_COLORS).map(key => PLAYER_COLORS[key])[4],
                            Object.keys(avatars).map(key => avatars[key])[0],
                            PLAYER_TYPES.HUMAN
                        ),
                        defender: new Player(
                            'Kalle',
                            Object.keys(PLAYER_COLORS).map(key => PLAYER_COLORS[key])[1],
                            Object.keys(avatars).map(key => avatars[key])[3],
                            PLAYER_TYPES.HUMAN
                        ),
                        multiplayer: false
                    };
                }
            }
        }).result.then(() => {});
    }

    testEndScreen(multiplayer = false) {
        const players = Array.from(
            new Array(6), (x, i) =>
                new Player(
                    Object.keys(avatars)[i],
                    Object.keys(PLAYER_COLORS).map(key => PLAYER_COLORS[key])[i],
                    Object.keys(avatars).map(key => avatars[key])[i],
                    PLAYER_TYPES.HUMAN
                )
        );
        this.gameEngine.initMap();
        this.gameEngine.startGame(players, {});

        players.forEach(p => {
            this.gameEngine.players.get(p.name).statistics = {
                battlesWon: 0,
                battlesLost: 0,
                troopsKilled: 0,
                troopsLost: 0,
                totalReinforcements: 0,
                cardCombinationsUsed: 0,
                retreats: 0
            };
        });

        if (multiplayer) {
            players.forEach((x, i) => {
                x.rank = (i + 1);
                if (i === 0) {
                    x.newRating = {
                        mu: 29.958612022864408,
                        sigma: 7.749228804079122
                    };
                    x.oldRating = {
                        mu: 25,
                        sigma: 8.333333333333334
                    };
                } else if (i === 5) {
                    x.newRating = {
                        mu: 25,
                        sigma: 7.192066920294255
                    };
                    x.oldRating = {
                        mu: 25,
                        sigma: 7.606688663292058
                    };
                } else {
                    x.newRating = {
                        mu: 21.2754611450882,
                        sigma: 7.192066920294255
                    };
                    x.oldRating = {
                        mu: 26.85053513218652,
                        sigma: 7.606688663292058
                    };
                }
            });
            players[4].type = PLAYER_TYPES.AI;
            players[5].dead = true;
            players[5].deadTurn = 15;
            this.$rootScope.endScreenData = {
                playersAsList: players
            };
        } else {
            this.$rootScope.endScreenData = undefined;
        }

        this.$rootScope.currentGamePhase = GAME_PHASES.END_SCREEN;
    }

    goToSettings() {
        this.setGamePhase(this.gamePhases.SETTINGS);
    }

    openUpdaterModal() {
        this.$uibModal.open({
            templateUrl: 'src/modals/autoUpdaterModal.html',
            backdrop: 'static',
            windowClass: 'riskModal autoUpdaterModal',
            controller: 'autoUpdaterModalController',
            controllerAs: 'updater',
            keyboard: false
        }).result.then((closeResponse = {}) => {
            if (!closeResponse.error) {
                this.toastService.successToast('', 'The game is up to date');
            } else if (closeResponse.error && closeResponse.state === ERROR_TYPES.CONNECTION_TIMED_OUT) {
                const id = `toast${Math.floor((Math.random() * 1000000000000) + 1)}`;
                this.toastService.errorToast(
                    'Connection problems',
                    ' ',
                    10000,
                    id,
                    () => {
                        var html = this.$compile('<span>Could not connect to the internet to check for updates. Make sure you are connected to the internet. If you are behind a proxy you can setup proxy settings under <strong class="fakeLink" ng-click="main.goToSettings()">Settings</strong></span>')(this.$scope);
                        angular.element(document.querySelector(`#${id} .iziToast-message`)).prepend(html);
                    }
                );
            } else if (closeResponse.error && closeResponse.state === ERROR_TYPES.UNKNOWN) {
                this.toastService.errorToast(
                    'Unknown error',
                    'An unknown error occured'
                );
            } else if (closeResponse.error && closeResponse.state === ERROR_TYPES.NO_RELEASES_COULD_BE_FETCHED) {
                this.toastService.errorToast(
                    '',
                    'No releases could be fetched from the server'
                );
            }
        });
    }

    aiTester() {
        window.aiTestingResults = {
            games: []
        };

        const players = Array.from(
            new Array(2), (x, i) =>
                new Player(
                    Object.keys(avatars).map(key => key)[i],
                    Object.keys(PLAYER_COLORS).map(key => PLAYER_COLORS[key])[i],
                    Object.keys(avatars).map(key => avatars[key])[i],
                    PLAYER_TYPES.AI_EXPERT
                )
        );

        players[1].aiValues = {
            closeToCaptureRegionPercentage: randomIntFromInterval(55, 80),
            opportunityToEliminatePlayer: randomIntFromInterval(1, 10),
            belongsToBigThreat: randomIntFromInterval(1, 10),
            mostTroopsInThisRegion: randomIntFromInterval(1, 10),
            closeToCaptureRegion: randomIntFromInterval(1, 10),
            canBeAttackedToBreakUpRegion: randomIntFromInterval(1, 10),
            lastTerritoryLeftInRegion: randomIntFromInterval(1, 10),
            bonusTroopsForRegionMultiplier: randomDoubleFromInterval(0.1, 1.5),
            bigThreatMultiplier: randomDoubleFromInterval(1.1, 2.0),
            extraPointsForBreakUpRegionForBigThreat: randomIntFromInterval(1, 10),
            movementTerritoryIsFrontlineForControlledRegion: randomIntFromInterval(1, 10),
            movementTerritoryHasBorderWithEnemy: randomIntFromInterval(1, 10),
            movmentTotalBorderingTroopsMultiplier: randomDoubleFromInterval(0.2, 1.5),
            movementTerritoryIsFrontlineRegionBonusTroopsMultiplier: randomDoubleFromInterval(1.0, 3.0),
            movementPlayerThreatPointsLessThanTotalBordering: randomIntFromInterval(1, 10),
            movementPlayerThreatPointsLessThanTotalBorderingTroopMultiplier: randomDoubleFromInterval(0.2, 0.8),
            movementTerritoryWithSafeBordersAmountOfTroops: randomIntFromInterval(1, 10),
            movementTerritoryWithSafeBordersExtraTroops: randomIntFromInterval(1, 10)
        };

        this.$rootScope.players = players;
        this.$rootScope.chosenGoal = VICTORY_GOALS[3];
        this.$rootScope.currentGamePhase = GAME_PHASES.AI_TESTING;
    }

    startNewLocalGame() {
        this.soundService.tick.play();
        this.$uibModal.open({
            templateUrl: 'src/modals/scenarioSelectorModal.html',
            backdrop: 'static',
            windowClass: 'riskModal scenarioSelectorModal',
            controller: 'scenarioSelectorModalController',
            controllerAs: 'scenario',
            keyboard: false
        }).result.then((closeResponse) => {
            if (!closeResponse.cancel) {
                // handle scenario somehow
                const selectedScenario = closeResponse.selectedScenario;
                this.setGamePhase(selectedScenario.setupPhase);
            }
        });
    }

    setGamePhase(phase) {
        this.vm.currentGamePhase = phase;
        this.$rootScope.currentGamePhase = this.vm.currentGamePhase;
        this.soundService.tick.play();
    }

    startGame(players, chosenGoal) {
        this.soundService.tick.play();
        
        loadSvgIntoDiv(this.gameEngine.selectedMap.mainMap, '#singleplayerMap', () => {
            this.gameEngine.initMap();
            this.$rootScope.players = players;
            this.$rootScope.chosenGoal = chosenGoal;
            this.$rootScope.currentGamePhase = GAME_PHASES.GAME;
            this.$rootScope.$apply();
        });
    }

    goBackToMenu() {
        this.soundService.tick.play();
        this.vm.currentGamePhase = GAME_PHASES.MAIN_MENU;
        $('.flag-element').remove();
        this.gameEngine.setMusic();
    }

    startTutorial() {
        this.soundService.tick.play();
        this.gameEngine.selectedMap = MAPS[0];
        this.gameEngine.initMap();
        this.$rootScope.currentGamePhase = GAME_PHASES.TUTORIAL;
    }

    quit() {
        window.close();
    }
}

module.exports = MainController;