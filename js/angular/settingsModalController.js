export default class SettingsModalController {

    constructor($scope, $uibModalInstance) {
        this.vm = this;

        this.$uibModalInstance = $uibModalInstance;

        // PUBLIC FUNCTIONS
        this.vm.cancel = this.cancel;
        this.vm.init = this.init;
    }

    init() {
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 50);
    }

    cancel() {
        this.$uibModalInstance.close();
    }
}
