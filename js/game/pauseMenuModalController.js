const { GAME_PHASES } = require('./../gameConstants');

class PauseMenuModalController {

    constructor($scope, $rootScope, $uibModalInstance, soundService) {
        this.vm = this;
        this.$rootScope = $rootScope;
        this.soundService = soundService;

        this.$uibModalInstance = $uibModalInstance;

        // PUBLIC FUNCTIONS
        this.vm.continue = this.continue;
        this.vm.settings = this.settings;
        this.vm.exitToMenu = this.exitToMenu;
        this.vm.backToMenu = this.backToMenu;

        this.vm.states = {
            MAIN_MENU: 0,
            SETTINGS: 1
        }
        this.vm.currentState = this.vm.states.MAIN_MENU;
    }

    continue() {
        this.soundService.tick.play();
        this.$uibModalInstance.close();
    }

    settings() {
        this.soundService.tick.play();
        this.vm.currentState = this.vm.states.SETTINGS;
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 50);
    }

    backToMenu() {
        this.soundService.tick.play();
        this.vm.currentState = this.vm.states.MAIN_MENU;
    }

    exitToMenu() {
        this.soundService.tick.play();
        this.$uibModalInstance.close();
        this.$rootScope.currentGamePhase = GAME_PHASES.MAIN_MENU;
    }
}

module.exports = PauseMenuModalController;