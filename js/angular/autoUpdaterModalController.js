import { MESSAGE_TYPES, ERROR_TYPES } from './../autoUpdating/updaterConstants';

export default class AutoUpdaterModalController {

    constructor($scope, $uibModalInstance) {
        this.vm = this;

        this.$uibModalInstance = $uibModalInstance;

        this.vm.autoUpdatingState = {};
        this.vm.MESSAGE_TYPES = MESSAGE_TYPES;
        this.vm.ERROR_TYPES = ERROR_TYPES;

        window.state.registerListener((val) => {
            this.vm.autoUpdatingState = val;
            console.log(this.vm.autoUpdatingState)
            $scope.$apply();

            if (this.vm.autoUpdatingState.state === MESSAGE_TYPES.UPDATE_DOWNLOADED || this.vm.autoUpdatingState.state === MESSAGE_TYPES.NO_NEW_UPDATE_AVAILABLE) {
                setTimeout(() => {
                    this.$uibModalInstance.close();
                }, 2000);
            }
        });

        this.vm.formatSpeed = this.formatSpeed;
    }

    formatSpeed(speed) {
        return `${Math.round(speed / 1000)} kB/s`;
    }
}
