const {AVAILABLE_SCENARIOS} = require('./scenarios');

class ScenarioSelectorModalController {
    constructor($scope, $uibModalInstance) {
        this.$uibModalInstance = $uibModalInstance;

        this.vm = this;
        this.vm.selectedScenario = undefined;
        this.vm.scenarios = [
            {
                id: 'CLASSIC_RISK',
                displayName: 'Classic Risk',
                description: 'This is the classic game of Risk with the standard rules as default'
            },
            ...AVAILABLE_SCENARIOS
        ];
        this.vm.selectScenario = this.selectScenario;
    }

    selectScenario() {
        if (!this.vm.selectedScenario) {
            return;
        }
        this.$uibModalInstance.close({
            selectedScenario: this.vm.selectedScenario
        });
        // close modal and return selected scenario
    }
}

module.exports = ScenarioSelectorModalController;