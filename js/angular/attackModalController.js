export function AttackModalController($scope, $rootScope, gameEngine, $log) {
    var vm = this;

    // PUBLIC FIELDS
    vm.attacker = '';
    vm.defender = '';

    // PUBLIC FUNCTIONS
    vm.init = init;

    function init() {
        $log.debug('Initialization of AttackModalController');
        setupEvents();
    }

    function setupEvents() {
        $rootScope.$on('engageAttackPhase', function(event, data) {
            $log.debug('Attack: ', data);
            vm.attacker = data.attacker.name;
            vm.defender = data.defender.name;
            $scope.$apply();
            $("#attackModal").modal('toggle');
        });
    }
}