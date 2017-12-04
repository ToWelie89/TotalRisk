import {GAME_PHASES} from './../gameConstants';

export default class MainController {

    constructor($scope, $rootScope, gameEngine) {
        this.vm = this;
        this.$rootScope = $rootScope;

        // PUBLIC FUNCTIONS
        this.vm.toggleMusicVolume = this.toggleMusicVolume;
        this.vm.playSound = true;
        this.vm.startGame = this.startGame;
        this.vm.startTutorial = this.startTutorial;
        this.vm.goBackToMenu = this.goBackToMenu;

        this.vm.gamePhases = GAME_PHASES;
        this.vm.currentGamePhase = GAME_PHASES.PLAYER_SETUP;

        this.$rootScope.currentGamePhase = this.vm.currentGamePhase;
        this.$rootScope.$watch('currentGamePhase', () => {
            this.vm.currentGamePhase = this.$rootScope.currentGamePhase;
        });

        this.$scope = $scope;
        this.gameEngine = gameEngine;

        fetch('./package.json')
        .then((resp) => resp.json())
        .then((data) => {
            this.vm.version = data.version;
            $scope.$apply();
        });

        console.log('Initialization of mainController');
    }

    toggleMusicVolume() {
        this.vm.playSound = !this.vm.playSound;
        this.gameEngine.toggleSound(this.vm.playSound);
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
