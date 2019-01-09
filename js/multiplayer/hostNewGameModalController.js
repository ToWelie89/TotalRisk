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
    }

    createLobby() {
        this.soundService.tick.play();
        this.$uibModalInstance.close({
            gameName: this.vm.gameName,
            password: this.vm.password
        });
    }

    cancel() {
        this.soundService.tick.play();
        this.$uibModalInstance.close();
    }
}

module.exports = HostNewGameModalController;