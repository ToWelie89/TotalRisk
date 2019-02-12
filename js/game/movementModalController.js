const {delay} = require('./../helpers');
const {GAME_PHASES} = require('./../gameConstants');

class MovementModalController {

    constructor($scope, $rootScope, $uibModalInstance, tutorialService, data) {
        this.vm = this;

        // PUBLIC FIELDS
        this.vm.moveNumberOfTroops = 1;
        this.vm.movementSliderOptions = {};

        // PUBLIC FUNCTIONS
        this.vm.moveTroops = this.moveTroops;
        this.vm.cancel = this.cancel;

        // Close the modal on escape if in tutorial mode
        this.boundListener = evt => this.keyupEventListener(evt);
        document.addEventListener('keyup', this.boundListener);

        console.log('Movement: ', data.moveTo, data.moveFrom);
        this.vm.moveTo = data.moveTo;
        this.vm.moveFrom = data.moveFrom;
        this.vm.movementSliderOptions = {
            floor: 1,
            ceil: this.vm.moveFrom.numberOfTroops - 1,
            hidePointerLabels: true,
            hideLimitLabels: true,
            showTicks: true
        };

        this.$uibModalInstance = $uibModalInstance;
        this.tutorialService = tutorialService;
        this.$rootScope = $rootScope;

        if (data.tutorial) {
            this.tutorial = true;
            this.runTutorial();
        }
    }

    keyupEventListener(e) {
        if (e.keyCode === 27) { // Escape
            if (this.$rootScope.currentGamePhase !== GAME_PHASES.GAME) {
                this.$uibModalInstance.close();
                document.removeEventListener('keyup', this.boundListener);
            }
        }
    }

    runTutorial() {
        this.tutorialService.initTutorialData();
        this.tutorialService.movementModalExplanation()
            .then(() => delay(1500))
            .then(() => this.tutorialService.movementModalExplanation2())
            .then(() => {
                // Move troops
                this.vm.moveFrom.numberOfTroops -= this.vm.moveNumberOfTroops;
                this.vm.moveTo.numberOfTroops = this.vm.moveNumberOfTroops + this.vm.moveTo.numberOfTroops;

                this.$uibModalInstance.close({
                    from: this.vm.moveFrom,
                    to: this.vm.moveTo
                });
            });
    }

    getCountrySvg() {
        let moveFromSvg = $(`#svgMap .country[id='${this.vm.moveFrom.name}']`).clone();
        moveFromSvg.removeClass('attackCursor highlighted movementCursor');
        $('#moveFromSvg').html(moveFromSvg);

        let bB = document.getElementById('moveFromSvg').getBBox();
        document.getElementById('moveFromSvg').setAttribute('viewBox', bB.x + ',' + bB.y + ',' + bB.width + ',' + bB.height);

        let moveToSvg = $(`#svgMap .country[id='${this.vm.moveTo.name}']`).clone();
        moveToSvg.removeClass('attackCursor highlighted movementCursor');
        $('#moveToSvg').html(moveToSvg);

        bB = document.getElementById('moveToSvg').getBBox();
        document.getElementById('moveToSvg').setAttribute('viewBox', bB.x + ',' + bB.y + ',' + bB.width + ',' + bB.height);
    }

    cancel() {
        if (this.tutorial) {
            return;
        }

        this.$uibModalInstance.close('cancelled');
    }

    moveTroops() {
        if (this.tutorial) {
            return;
        }

        this.vm.moveFrom.numberOfTroops -= this.vm.moveNumberOfTroops;
        this.vm.moveTo.numberOfTroops = this.vm.moveNumberOfTroops + this.vm.moveTo.numberOfTroops;

        this.$uibModalInstance.close({
            from: this.vm.moveFrom,
            to: this.vm.moveTo
        });
    }
}

module.exports = MovementModalController;