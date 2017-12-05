import {GAME_PHASES} from './../gameConstants';

export default class MainController {

    constructor($scope, $rootScope, gameEngine, soundService) {
        this.vm = this;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.gameEngine = gameEngine;
        this.soundService = soundService;
        // PUBLIC FUNCTIONS
        this.vm.toggleMusicVolume = this.toggleMusicVolume;
        this.vm.startGame = this.startGame;
        this.vm.startTutorial = this.startTutorial;
        this.vm.goBackToMenu = this.goBackToMenu;
        this.vm.setGamePhase = this.setGamePhase;

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

        fetch('./package.json')
        .then((resp) => resp.json())
        .then((data) => {
            this.vm.version = data.version;
            $scope.$apply();
        });

        console.log('Initialization of mainController');
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
