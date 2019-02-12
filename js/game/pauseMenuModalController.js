const { GAME_PHASES, MAIN_MUSIC } = require('./../gameConstants');

class PauseMenuModalController {

    constructor($scope, $rootScope, $sce, $uibModalInstance, socketService, soundService, gameEngine, multiplayer) {
        this.vm = this;
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$sce = $sce;
        this.soundService = soundService;
        this.gameEngine = gameEngine;
        this.socketService = socketService;

        this.$uibModalInstance = $uibModalInstance;

        // PUBLIC FUNCTIONS
        this.vm.continue = this.continue;
        this.vm.settings = this.settings;
        this.vm.exitToMenu = this.exitToMenu;
        this.vm.backToMenu = this.backToMenu;

        this.vm.states = {
            MAIN_MENU: 0,
            SETTINGS: 1
        };
        this.vm.currentState = this.vm.states.MAIN_MENU;

        this.vm.multiplayer = multiplayer ? multiplayer : false;

        this.vm.exitTooltip = this.$sce.trustAsHtml(`
            <div class="warningTooltip">
                <p>
                    <strong>BE WARNED!</strong> If you quit a multiplayer game before it's over you will suffer a penalty.
                </p>
            </div>
        `);
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
        this.gameEngine.setMusic(MAIN_MUSIC);
        this.socketService.disconnectGameSocket();
    }
}

module.exports = PauseMenuModalController;