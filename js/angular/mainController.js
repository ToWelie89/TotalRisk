import {GAME_PHASES, VICTORY_GOALS} from './../gameConstants';
import Player from './../player/player';
import {PLAYER_COLORS, avatars, PLAYER_TYPES} from './../player/playerConstants';

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

        fetch('./package.json')
        .then((resp) => resp.json())
        .then((data) => {
            this.vm.version = data.version;
            $scope.$apply();
        });

        console.log('Initialization of mainController');
    }

    aiTester() {
        const players = Array.from(
            new Array(2), (x, i) =>
                new Player(Object.keys(avatars).map(key => key)[i],
                           Object.keys(PLAYER_COLORS).map(key => PLAYER_COLORS[key])[i],
                           Object.keys(avatars).map(key => avatars[key])[i],
                           PLAYER_TYPES.AI_EXPERT)
        );

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
