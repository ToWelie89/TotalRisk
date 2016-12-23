export function MovementModalController($scope, $rootScope, $log, soundEngine) {
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

    function setupEvents() {
        $rootScope.$on('engageMovementPhase', function(event, data) {
            $log.debug('Movement: ', data);
            vm.moveNumberOfTroops = 1;
            vm.moveTo = data.moveTo;
            vm.moveFrom = data.moveFrom;
            vm.movementSliderOptions = {
                floor: 1,
                ceil: vm.moveFrom.numberOfTroops - 1
            };
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
