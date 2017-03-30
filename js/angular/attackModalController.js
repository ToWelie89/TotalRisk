import BattleHandler from './../battleHandler';
import {delay} from './../helpers';

export function AttackModalController($scope, $rootScope, $log, soundService) {
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
        // If one player loses 2 troops a scream sound is heard
        const response = vm.battleHandler.handleAttack(vm.attacker, vm.defender);
        if (response.defenderCasualties === 2 || response.attackerCasualties === 2) {
            soundService.screamSound.play();
        }

        vm.attackerDice = response.attackDice;
        vm.defenderDice = response.defendDice;
        vm.attacker = response.attacker;
        vm.defender = response.defender;

        delay(100).then(() => {
            // Animate shake effect on side(s) affected by casualties
            if (response.defenderCasualties > response.attackerCasualties) {
                new Promise((resolve, reject) => {
                    $('#defenderTroops .troopIcon').addClass('shake shake-constant');
                    resolve();
                }).then(() => delay(500))
                .then(() => {
                    $('#defenderTroops .troopIcon').removeClass('shake shake-constant');
                });
            } else if (response.attackerCasualties > response.defenderCasualties) {
                new Promise((resolve, reject) => {
                    $('#attackerTroops .troopIcon').addClass('shake shake-constant');
                    resolve();
                }).then(() => delay(500))
                .then(() => {
                    $('#attackerTroops .troopIcon').removeClass('shake shake-constant');
                });
            } else if (response.attackerCasualties === response.defenderCasualties) {
                new Promise((resolve, reject) => {
                    $('.troopIcon').addClass('shake shake-constant');
                    resolve();
                }).then(() => delay(500))
                .then(() => {
                    $('.troopIcon').removeClass('shake shake-constant');
                });
            }
        });

        if (vm.defender.numberOfTroops === 0) {
            // the invasion succeded
            soundService.cheer.play();

            vm.fightIsOver = true;

            vm.movementSliderOptions = {
                floor: 1,
                ceil: vm.attacker.numberOfTroops
            };
            vm.showMoveTroops = true;
        }
        if (vm.attacker.numberOfTroops === 0) {
            delay(2500).then(() => {
                // the invasion failed
                vm.fightIsOver = true;
                // update state
                $rootScope.$broadcast('battleIsOver', {
                    attackFrom: vm.attacker,
                    attackTo: vm.defender,
                    battleWasWon: false
                });
                $("#attackModal").modal('toggle');
                $('#territorySvg').html('');
            });
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
        $('#territorySvg').html('');
    }

    function retreat() {
        vm.attacker.numberOfTroops++;
        $rootScope.$broadcast('battleIsOver', {
            attackFrom: vm.attacker,
            attackTo: vm.defender
        });
        $("#attackModal").modal('toggle');
        $('#territorySvg').html('');
    }

    function convertTroopAmountToTroopTypes(troops) {
        if (!troops) {
            return [];
        }
        const cannons = Math.floor(troops / 10);
        troops -= (cannons * 10);
        const horses = Math.floor(troops / 5);
        troops -= (horses * 5);

        const array = Array.from(new Array(cannons + horses + troops));
        array.fill('cannon', 0, cannons);
        array.fill('horse', cannons, (cannons + horses));
        array.fill('troop', (cannons + horses), (cannons + horses + troops));

        return array;
    }

    function getCountrySvg() {
        let territorySvg = $(`#svgMap .country[id='${vm.defender.name}']`).clone();
        territorySvg.removeClass('attackCursor highlighted');
        $('#territorySvg').html(territorySvg);

        let bB = document.getElementById('territorySvg').getBBox();
        document.getElementById('territorySvg').setAttribute('viewBox', bB.x + ',' + bB.y + ',' + bB.width + ',' + bB.height);
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
            $scope.$apply();
            $("#attackModal").modal('toggle');
            getCountrySvg();
        });
    }
}
