import BattleHandler from './../battleHandler';
import {delay} from './../helpers';

export function AttackModalController($scope, $rootScope, $log, $uibModalInstance, $timeout, soundService, attackData) {
    var vm = this;

    // PUBLIC FIELDS
    vm.attacker = {};
    vm.defender = {};
    vm.attackerDice = [];
    vm.defenderDice = [];
    vm.fightIsOver = false;
    vm.showMoveTroops = false;
    vm.disableButtons = false;

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

        if (vm.attacker.numberOfTroops === 0 || vm.defender.numberOfTroops === 0) {
            // the invasion failed
            vm.fightIsOver = true;
            if (vm.defender.numberOfTroops === 0) {
                // the invasion succeded
                soundService.cheer.play();
                vm.fightIsOver = true;

                $('#attackerTroops .troopIcon svg').addClass('animated infinite bounce');

                if (vm.attacker.numberOfTroops > 1) {
                    vm.movementSliderOptions = {
                        floor: 1,
                        ceil: vm.attacker.numberOfTroops,
                        showTicks: true
                    };
                    vm.showMoveTroops = true;
                } else {
                    delay(2500).then(() => {
                        this.moveTroops();
                    });
                }
            }
            if (vm.attacker.numberOfTroops === 0) {
                $('#defenderTroops .troopIcon svg').addClass('animated infinite bounce');
                delay(2500).then(() => {
                    closeModal(false);
                });
            }
        } else {
            vm.disableButtons = true;
            delay(100).then(() => {
                // Animate shake effect on side(s) affected by casualties
                let icons;
                if (response.defenderCasualties > response.attackerCasualties) {
                    icons = $('#defenderTroops .troopIcon');
                } else if (response.attackerCasualties > response.defenderCasualties) {
                    icons = $('#attackerTroops .troopIcon');
                } else if (response.attackerCasualties === response.defenderCasualties) {
                    icons = $('.troopIcon');
                }
                new Promise((resolve, reject) => {
                    icons.addClass('shake shake-constant');
                    resolve();
                }).then(() => delay(500))
                .then(() => {
                    icons.removeClass('shake shake-constant');
                    vm.disableButtons = false;
                    $scope.$apply();
                });
            });
        }
    }

    function closeModal(battleWasWon) {
        $uibModalInstance.close({
            attackFrom: vm.attacker,
            attackTo: vm.defender,
            battleWasWon
        });
    }

    function moveTroops() {
        vm.defender.owner = vm.attacker.owner;
        vm.attacker.numberOfTroops = vm.attacker.numberOfTroops - vm.moveNumberOfTroops + 1;
        vm.defender.numberOfTroops = vm.moveNumberOfTroops;
        closeModal(true);
    }

    function retreat() {
        vm.attacker.numberOfTroops++;
        closeModal(false);
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
        const territorySvg = $(`#svgMap .country[id='${vm.defender.name}']`).clone();
        territorySvg.removeClass('attackCursor highlighted');
        $('#territorySvg').html(territorySvg);

        const bB = document.getElementById('territorySvg').getBBox();
        document.getElementById('territorySvg').setAttribute('viewBox', `${bB.x},${bB.y},${bB.width},${bB.height}`);
    }

    function init() {
        $log.debug('Initialization of AttackModalController');

        vm.battleHandler = new BattleHandler();

        console.log('Attack: ', attackData);
        vm.attacker = attackData.attackFrom;
        vm.attacker.color = attackData.attacker.color;
        vm.attacker.avatar = attackData.attacker.avatar;
        vm.attacker.numberOfTroops--;
        vm.defender = attackData.territoryAttacked;
        vm.defender.color = attackData.defender.color;
        vm.defender.avatar = attackData.defender.avatar;

        $timeout(getCountrySvg, 500);
    }
}
