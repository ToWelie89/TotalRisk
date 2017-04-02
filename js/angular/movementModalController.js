import {delay} from './../helpers';

export function MovementModalController($scope, $rootScope, $log) {
    var vm = this;

    // PUBLIC FIELDS
    vm.moveNumberOfTroops = 1;
    vm.movementSliderOptions = {};

    // PUBLIC FUNCTIONS
    vm.init = init;
    vm.moveTroops = moveTroops;

    function init() {
        setupEvents();
    }

    function getCountrySvg() {
        let moveFromSvg = $(`#svgMap .country[id='${vm.moveFrom.name}']`).clone();
        moveFromSvg.removeClass('attackCursor highlighted movementCursor');
        $('#moveFromSvg').html(moveFromSvg);

        let bB = document.getElementById('moveFromSvg').getBBox();
        document.getElementById('moveFromSvg').setAttribute('viewBox', bB.x + ',' + bB.y + ',' + bB.width + ',' + bB.height);

        let moveToSvg = $(`#svgMap .country[id='${vm.moveTo.name}']`).clone();
        moveToSvg.removeClass('attackCursor highlighted movementCursor');
        $('#moveToSvg').html(moveToSvg);

        bB = document.getElementById('moveToSvg').getBBox();
        document.getElementById('moveToSvg').setAttribute('viewBox', bB.x + ',' + bB.y + ',' + bB.width + ',' + bB.height);
    }

    function setupEvents() {
        $rootScope.$on('engageMovementPhase', function(event, data) {
            $log.debug('Movement: ', data);
            vm.moveNumberOfTroops = 1;
            vm.moveTo = data.moveTo;
            vm.moveFrom = data.moveFrom;
            vm.movementSliderOptions = {
                floor: 1,
                ceil: vm.moveFrom.numberOfTroops - 1,
                hidePointerLabels: true,
                hideLimitLabels: true
            };

            $scope.$apply();
            $("#movementModal").modal('toggle');
        });
    }

    function moveTroops() {
        vm.moveFrom.numberOfTroops -= vm.moveNumberOfTroops;
        vm.moveTo.numberOfTroops = vm.moveNumberOfTroops + vm.moveTo.numberOfTroops;
        $rootScope.$broadcast('movementIsOver', {
            from: vm.moveFrom,
            to: vm.moveTo
        });
        $("#movementModal").modal('toggle');
    }
}
