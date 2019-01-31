const { MAPS } = require('./../gameConstants');

class HostNewGameModalController {

    constructor($scope, $uibModalInstance, soundService) {
        this.vm = this;

        this.$uibModalInstance = $uibModalInstance;
        this.soundService = soundService;

        // PUBLIC FUNCTIONS
        this.vm.createLobby = this.createLobby;
        this.vm.cancel = this.cancel;

        this.vm.gameName = '';
        this.vm.password = '';

        this.vm.maps = MAPS;
        this.vm.mapKeys = Object.keys(MAPS);
        this.vm.currentlySelectedMap = this.vm.mapKeys[0];
    }

    createLobby() {
        this.soundService.tick.play();
        this.$uibModalInstance.close({
            gameName: this.vm.gameName,
            password: this.vm.password,
            map: this.vm.currentlySelectedMap
        });
    }

    cancel() {
        this.soundService.tick.play();
        this.$uibModalInstance.close();
    }
}

module.exports = HostNewGameModalController;