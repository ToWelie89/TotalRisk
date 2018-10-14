import { MESSAGE_TYPES, ERROR_TYPES } from './../autoUpdating/updaterConstants';

export default class AutoUpdaterModalController {

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
                    this.$uibModalInstance.close();
                }, 500);
            }

            if (this.vm.autoUpdatingState.state === ERROR_TYPES.CONNECTION_TIMED_OUT ||
                this.vm.autoUpdatingState.state === ERROR_TYPES.UNKNOWN ||
                this.vm.autoUpdatingState.state === ERROR_TYPES.NO_RELEASES_COULD_BE_FETCHED) {
                setTimeout(() => {
                    this.$uibModalInstance.close({
                        state: this.vm.autoUpdatingState
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
