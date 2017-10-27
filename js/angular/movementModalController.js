export default class MovementModalController {

    constructor($scope, $uibModalInstance, data) {
        this.vm = this;

        // PUBLIC FIELDS
        this.vm.moveNumberOfTroops = 1;
        this.vm.movementSliderOptions = {};

        // PUBLIC FUNCTIONS
        this.vm.moveTroops = this.moveTroops;

        console.log('Movement: ', data.moveTo, data.moveFrom);
        this.vm.moveNumberOfTroops = 1;
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

    moveTroops() {
        this.vm.moveFrom.numberOfTroops -= this.vm.moveNumberOfTroops;
        this.vm.moveTo.numberOfTroops = this.vm.moveNumberOfTroops + this.vm.moveTo.numberOfTroops;

        this.$uibModalInstance.close({
            from: this.vm.moveFrom,
            to: this.vm.moveTo
        });
    }
}
