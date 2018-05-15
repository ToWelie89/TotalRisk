import { GAME_PHASES } from './../gameConstants';

export default class PauseMenuModalController {

    constructor($scope, $rootScope, $uibModalInstance) {
        this.vm = this;
        this.$rootScope = $rootScope;

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
        this.$uibModalInstance.close();
    }

    settings() {
        this.vm.currentState = this.vm.states.SETTINGS;
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 50);
    }

    backToMenu() {
        this.vm.currentState = this.vm.states.MAIN_MENU;
    }

    exitToMenu() {
        this.$rootScope.currentGamePhase = GAME_PHASES.MAIN_MENU;
        this.$uibModalInstance.close();
    }
}
