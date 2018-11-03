const { MESSAGE_TYPES, ERROR_TYPES, stateIsError } = require( './../autoUpdating/updaterConstants');

class AutoUpdaterModalController {

    constructor($scope, $uibModalInstance, $interval) {
        this.vm = this;

        this.$uibModalInstance = $uibModalInstance;
        this.$interval = $interval;

        this.vm.autoUpdatingState = {};
        this.vm.MESSAGE_TYPES = MESSAGE_TYPES;
        this.vm.ERROR_TYPES = ERROR_TYPES;

        console.log('Register state listener');

        this.vm.autoUpdatingState = window.state.currentState;

        window.state.registerListener((val) => {
            this.vm.autoUpdatingState = val;
            console.log(this.vm.autoUpdatingState)
            $scope.$apply();

            if (this.vm.autoUpdatingState.state === MESSAGE_TYPES.UPDATE_DOWNLOADING) {
                const maxHeight = 500;
                const heightToSet = maxHeight - ((maxHeight / 100) * this.vm.autoUpdatingState.data.percent);
                $('#patchLoadingGray').css('height', heightToSet);
            }


            if (this.vm.autoUpdatingState.state === MESSAGE_TYPES.UPDATE_DOWNLOADED) {
                this.vm.timeLeftToClose = 5;
                $scope.$apply();
                this.autoCloseTimer = $interval(() => {
                    this.vm.timeLeftToClose--;
                    if (this.vm.timeLeftToClose === 0) {
                        window.close();
                    }
                }, 1000);

            }

            if (this.vm.autoUpdatingState.state === MESSAGE_TYPES.NO_NEW_UPDATE_AVAILABLE) {
                setTimeout(() => {
                    this.$uibModalInstance.close({
                        state: this.vm.autoUpdatingState.state,
                        error: false
                    });
                }, 500);
            }

            if (stateIsError(this.vm.autoUpdatingState.state)) {
                setTimeout(() => {
                    this.$uibModalInstance.close({
                        state: this.vm.autoUpdatingState.state,
                        error: true
                    });
                }, 0);
            }
        });

        this.vm.formatSpeed = this.formatSpeed;
        this.vm.close = this.close;
    }

    formatSpeed(speed) {
        return `${Math.round(speed / 1000)} kB/s`;
    }

    close() {
        window.close();
    }
}

module.exports = AutoUpdaterModalController;