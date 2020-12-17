const {delay} = require('./../helpers');
const {GAME_PHASES} = require('./../gameConstants');

class MovementModalController {

    constructor($scope, $rootScope, $uibModalInstance, tutorialService, data, soundService) {
        this.vm = this;
        this.soundService = soundService;
        this.scope = $scope;

        // PUBLIC FIELDS
        this.vm.moveNumberOfTroops = 1;
        this.vm.movementSliderOptions = {};

        // PUBLIC FUNCTIONS
        this.vm.moveTroops = this.moveTroops;
        this.vm.moveAllTroops = this.moveAllTroops;
        this.vm.cancel = this.cancel;
        this.vm.toArray = this.toArray;

        // Close the modal on escape if in tutorial mode
        this.boundListener = evt => this.keyupEventListener(evt);
        document.addEventListener('keyup', this.boundListener);

        console.log('Movement: ', data.moveTo, data.moveFrom);
        this.vm.moveTo = data.moveTo;
        this.vm.moveFrom = data.moveFrom;
        this.vm.mapSelector = data.mapSelector;
        this.vm.movementSliderOptions = {
            floor: 1,
            ceil: this.vm.moveFrom.numberOfTroops - 1,
            hidePointerLabels: true,
            hideLimitLabels: true,
            showTicks: true,
            onChange: () => {
                this.soundService.tick.play();
                $(`${this.vm.mapSelector} .troopCounterText[for='${this.vm.moveFrom.name}']`).text(this.vm.moveFrom.numberOfTroops - this.vm.moveNumberOfTroops);
                $(`${this.vm.mapSelector} .troopCounterText[for='${this.vm.moveTo.name}']`).text(this.vm.moveTo.numberOfTroops + this.vm.moveNumberOfTroops);
            }
        };

        this.$uibModalInstance = $uibModalInstance;
        this.tutorialService = tutorialService;
        this.$rootScope = $rootScope;

        if (data.tutorial) {
            this.tutorial = true;
            this.runTutorial();
        }

        setTimeout(() => {
            this.getCountrySvg();
            $('#movementPreviewBox').addClass('loaded');
        }, 500);
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

    toArray(num) {
        return new Array(num);
    }

    getCountrySvg() {
        let moveFromSvg = $(`${this.vm.mapSelector} .country[id='${this.vm.moveFrom.name}']`).clone();
        moveFromSvg.removeClass('attackCursor highlighted movementCursor');
        $('#moveFromSvg').html(moveFromSvg);

        let bB = document.getElementById('moveFromSvg').getBBox();
        document.getElementById('moveFromSvg').setAttribute('viewBox', bB.x + ',' + bB.y + ',' + bB.width + ',' + bB.height);

        let moveToSvg = $(`${this.vm.mapSelector} .country[id='${this.vm.moveTo.name}']`).clone();
        moveToSvg.removeClass('attackCursor highlighted movementCursor');
        $('#moveToSvg').html(moveToSvg);

        bB = document.getElementById('moveToSvg').getBBox();
        document.getElementById('moveToSvg').setAttribute('viewBox', bB.x + ',' + bB.y + ',' + bB.width + ',' + bB.height);

        let color = $('#moveFromSvg path').first().attr('country-color');
        color = color.toLowerCase();
        color = color[0].toUpperCase() + color.slice(1);

        this.vm.color = color;
        this.scope.$apply();
    }

    cancel() {
        if (this.tutorial) {
            return;
        }
        this.soundService.tick.play();

        this.$uibModalInstance.close('cancelled');
    }

    moveTroops() {
        if (this.tutorial) {
            return;
        }
        this.soundService.tick.play();

        this.vm.moveFrom.numberOfTroops -= this.vm.moveNumberOfTroops;
        this.vm.moveTo.numberOfTroops = this.vm.moveNumberOfTroops + this.vm.moveTo.numberOfTroops;

        this.$uibModalInstance.close({
            from: this.vm.moveFrom,
            to: this.vm.moveTo
        });
    }

    moveAllTroops() {
        if (this.tutorial) {
            return;
        }
        this.vm.moveNumberOfTroops = this.vm.moveFrom.numberOfTroops - 1;
        this.moveTroops();
    }
}

module.exports = MovementModalController;