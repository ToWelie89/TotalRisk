class JoinPrivateLobbyController {

    constructor($scope, $uibModalInstance, soundService) {
        this.vm = this;

        this.$uibModalInstance = $uibModalInstance;
        this.soundService = soundService;

        // PUBLIC FUNCTIONS
        this.vm.join = this.join;
        this.vm.cancel = this.cancel;

        this.vm.password = '';
    }

    join() {
        this.soundService.tick.play();
        this.$uibModalInstance.close({
            password: this.vm.password
        });
    }

    cancel() {
        this.soundService.tick.play();
        this.$uibModalInstance.close();
    }
}

module.exports = JoinPrivateLobbyController;