import BattleHandler from './../battleHandler';

export function AttackModalController($scope, $rootScope, $log, soundEngine) {
    var vm = this;

    // PUBLIC FIELDS
    vm.attacker = {};
    vm.defender = {};
    vm.attackerDice = [];
    vm.defenderDice = [];
    vm.fightIsOver = false;
    vm.showMoveTroops = false;

    vm.moveNumberOfTroops = 1;
    vm.movementSliderOptions = {};

    vm.countrySvg = '';

    // PUBLIC FUNCTIONS
    vm.init = init;
    vm.fight = fight;
    vm.retreat = retreat;
    vm.moveTroops = moveTroops;
    vm.convertTroopAmountToTroopTypes = convertTroopAmountToTroopTypes;

    function fight() {
        let response = vm.battleHandler.handleAttack(vm.attacker, vm.defender);
        vm.attackerDice = response.attackDice;
        vm.defenderDice = response.defendDice;
        vm.attacker = response.attacker;
        vm.defender = response.defender;

        if (vm.defender.numberOfTroops === 0) {
            // the invasion succeded
            soundEngine.cheer.play();

            vm.fightIsOver = true;

            vm.movementSliderOptions = {
                floor: 1,
                ceil: vm.attacker.numberOfTroops
            };
            vm.showMoveTroops = true;
        }
        if (vm.attacker.numberOfTroops === 0) {
            // the invasion failed
            vm.fightIsOver = true;
            // update state
            $rootScope.$broadcast('battleIsOver', {
                attackFrom: vm.attacker,
                attackTo: vm.defender,
                battleWasWon: false
            });
            $("#attackModal").modal('toggle');
        }
    }

    function moveTroops() {
        vm.defender.owner = vm.attacker.owner;
        vm.attacker.numberOfTroops = vm.attacker.numberOfTroops - vm.moveNumberOfTroops + 1;
        vm.defender.numberOfTroops = vm.moveNumberOfTroops;
        $rootScope.$broadcast('battleIsOver', {
            attackFrom: vm.attacker,
            attackTo: vm.defender
        });
        $("#attackModal").modal('toggle');
    }

    function retreat() {
        vm.attacker.numberOfTroops++;
        $rootScope.$broadcast('battleIsOver', {
            attackFrom: vm.attacker,
            attackTo: vm.defender
        });
        $("#attackModal").modal('toggle');
    }

    function convertTroopAmountToTroopTypes(troops) {
        if (!troops) {
            return [];
        }
        let cannons = Math.floor(troops / 10);
        troops -= (cannons * 10);
        let horses = Math.floor(troops / 5);
        troops -= (horses * 5);

        const array = Array.from(new Array(cannons + horses + troops));
        array.fill('cannon', 0, cannons);
        array.fill('horse', cannons, (cannons + horses));
        array.fill('troop', (cannons + horses), (cannons + horses + troops));

        return array;
    }

    function getCountrySvg() {
        let territoryWidth = Math.round(document.getElementById(vm.defender.name).getBoundingClientRect().width);
        let territoryHeight = Math.round(document.getElementById(vm.defender.name).getBoundingClientRect().height);

        let territorySvg = $(`svg .country[id='${vm.defender.name}']`).clone();
        // let d = territorySvg.attr('d');
        // let dParts = d.split(',');
        // dParts[0] = `M${territoryWidth} 0c6`;

        // d = dParts.join(',');
        // territorySvg.attr('d', d);
        territorySvg.attr('x', 0);
        territorySvg.attr('y', 0);
        // $('#territorySvg g')[0].setAttribute('viewBox', `0 -${territoryWidth} ${(2 * territoryHeight)} ${territoryWidth}`);
        $('#territorySvg').html(territorySvg);
    }

    function init() {
        $log.debug('Initialization of AttackModalController');

        vm.battleHandler = new BattleHandler();
        setupEvents();
    }

    function resetController() {
        vm.fightIsOver = false;
        vm.showMoveTroops = false;
        vm.moveNumberOfTroops = 1;
        vm.attackerDice = [];
        vm.defenderDice = [];
        vm.countrySvg = '';
    }

    function setupEvents() {
        $rootScope.$on('engageAttackPhase', function(event, data) {
            resetController();

            $log.debug('Attack: ', data);
            vm.attacker = data.attackFrom;
            vm.attacker.color = data.attacker.color;
            vm.attacker.numberOfTroops--;
            vm.defender = data.territoryAttacked;
            vm.defender.color = data.defender.color;
            getCountrySvg();
            $scope.$apply();
            $("#attackModal").modal('toggle');
        });
    }
}
