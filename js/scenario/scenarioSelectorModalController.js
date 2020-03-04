const {AVAILABLE_SCENARIOS} = require('./scenarios');
const {GAME_PHASES} = require('./../gameConstants');

class ScenarioSelectorModalController {
    constructor($scope, $uibModalInstance, $sce, soundService) {
        this.$uibModalInstance = $uibModalInstance;
        this.$sce = $sce;
        this.soundService = soundService;

        this.vm = this;
        this.vm.scenarios = [
            {
                id: 'CLASSIC_RISK',
                disabled: false,
                setupPhase: GAME_PHASES.PLAYER_SETUP,
                displayName: 'Classic Risk',
                background: 'assets/scenarios/classic.jpeg',
                description: 'This is the classic game of Risk with the standard rules as default'
            },
            ...AVAILABLE_SCENARIOS
        ];
        this.vm.selectedScenario = this.vm.scenarios[0];
        this.vm.selectScenario = this.selectScenario;
        this.vm.click = this.click;
        this.vm.doubleClick = this.doubleClick;

        this.vm.scenarios.forEach(scenario => {
            if (scenario.specialRules) {
                scenario.specialRules.forEach(specialRule => {
                    if (specialRule.displayName && specialRule.description) {
                        specialRule.tooltipHtml = this.$sce.trustAsHtml(`
                        <div class="standardTooltip">
                            <p>
                                <strong>${specialRule.displayName}</strong><br>
                                ${specialRule.description}
                            </p>
                        </div>
                    `);
                    }
                });
            }
        });

        this.vm.scenarioNotAvailableTooltip = this.$sce.trustAsHtml(`
            <div class="warningTooltip">
                <p>
                    This scenario is not yet available
                </p>
            </div>
        `);
    }

    doubleClick(scenario) {
        if (scenario.disabled) {
            this.soundService.denied.play();
            return;
        }
        this.soundService.bleep2.play();
        this.vm.selectedScenario = scenario;
        this.selectScenario();
    }

    click(scenario) {
        if (scenario.disabled) {
            this.soundService.denied.play();
            return;
        }
        this.soundService.bleep2.play();
        this.vm.selectedScenario = scenario;
    }

    selectScenario() {
        if (!this.vm.selectedScenario) {
            this.soundService.denied.play();
            return;
        }
        this.$uibModalInstance.close({
            selectedScenario: this.vm.selectedScenario
        });
        // close modal and return selected scenario
    }
}

module.exports = ScenarioSelectorModalController;