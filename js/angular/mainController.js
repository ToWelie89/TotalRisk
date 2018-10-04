import {GAME_PHASES, VICTORY_GOALS} from './../gameConstants';
import {randomIntFromInterval, randomDoubleFromInterval, runningElectron, electronDevVersion} from './../helpers';
import Player from './../player/player';
import {PLAYER_COLORS, avatars, PLAYER_TYPES} from './../player/playerConstants';
import {MESSAGE_TYPES} from './../autoUpdating/updaterConstants';

export default class MainController {

    constructor($scope, $rootScope, gameEngine, soundService, $uibModal) {
        this.vm = this;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$uibModal = $uibModal;
        this.gameEngine = gameEngine;
        this.soundService = soundService;
        // PUBLIC FUNCTIONS
        this.vm.toggleMusicVolume = this.toggleMusicVolume;
        this.vm.startGame = this.startGame;
        this.vm.startTutorial = this.startTutorial;
        this.vm.goBackToMenu = this.goBackToMenu;
        this.vm.setGamePhase = this.setGamePhase;
        this.vm.aiTester = this.aiTester;

        this.vm.gamePhases = GAME_PHASES;
        this.vm.currentGamePhase = GAME_PHASES.MAIN_MENU;

        this.$rootScope.currentGamePhase = this.vm.currentGamePhase;
        this.$rootScope.$watch('currentGamePhase', () => {
            this.vm.currentGamePhase = this.$rootScope.currentGamePhase;
            // Ugly fix for the setting slider bug
            if (this.vm.currentGamePhase === GAME_PHASES.SETTINGS) {
                setTimeout(() => {
                    window.dispatchEvent(new Event('resize'));
                }, 50);
            }
        });

        this.vm.runningElectron = runningElectron();

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
        } else {
            fetch('./package.json')
            .then((resp) => resp.json())
            .then((data) => {
                this.vm.appVersion = data.version;
                $scope.$apply();
            });
        }

        console.log('Initialization of mainController');
    }

    openUpdaterModal() {
        this.$uibModal.open({
            templateUrl: 'autoUpdaterModal.html',
            backdrop: 'static',
            windowClass: 'riskModal',
            controller: 'autoUpdaterModalController',
            controllerAs: 'updater',
            keyboard: false
        }).result.then(closeResponse => {
            // do shit
        });
    }

    aiTester() {
        window.aiTestingResults = {
            games: []
        };

        const players = Array.from(
            new Array(2), (x, i) =>
                new Player(Object.keys(avatars).map(key => key)[i],
                           Object.keys(PLAYER_COLORS).map(key => PLAYER_COLORS[key])[i],
                           Object.keys(avatars).map(key => avatars[key])[i],
                           PLAYER_TYPES.AI_EXPERT)
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

    setGamePhase(phase) {
        this.vm.currentGamePhase = phase;
        this.$rootScope.currentGamePhase = this.vm.currentGamePhase;
        this.soundService.bleep2.play();
    }

    startGame(players, chosenGoal) {
        this.$rootScope.players = players;
        this.$rootScope.chosenGoal = chosenGoal;
        this.$rootScope.currentGamePhase = GAME_PHASES.GAME;
    }

    goBackToMenu() {
        this.vm.currentGamePhase = GAME_PHASES.PLAYER_SETUP;
        $(".flag-element").remove();
        this.gameEngine.setMusic();
    }

    startTutorial() {
        this.$rootScope.currentGamePhase = GAME_PHASES.TUTORIAL;
    }
}
