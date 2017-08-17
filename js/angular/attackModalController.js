import BattleHandler from './../battleHandler';

export default class AttackModalController {
    constructor($scope, $uibModalInstance, soundService, attackData) {
        this.vm = this;

        // PUBLIC FIELDS
        this.vm.attackerDice = [];
        this.vm.defenderDice = [];
        this.vm.fightIsOver = false;
        this.vm.showMoveTroops = false;
        this.vm.disableButtons = false;

        this.vm.moveNumberOfTroops = 1;
        this.vm.movementSliderOptions = {};

        this.vm.countrySvg = '';

        // PUBLIC FUNCTIONS
        this.vm.fight = this.fight;
        this.vm.retreat = this.retreat;
        this.vm.moveTroops = this.moveTroops;
        this.vm.convertTroopAmountToTroopTypes = this.convertTroopAmountToTroopTypes;

        this.$scope = $scope;
        this.$uibModalInstance = $uibModalInstance;
        this.soundService = soundService;
        this.attackData = attackData;

        this.vm.battleHandler = new BattleHandler();

        console.log('Initialization of AttackModalController');
        console.log('Attack: ', attackData);
        this.vm.attacker = attackData.attackFrom;
        this.vm.attacker.color = attackData.attacker.color;
        this.vm.attacker.avatar = attackData.attacker.avatar;
        this.vm.attacker.numberOfTroops--;
        this.vm.defender = attackData.territoryAttacked;
        this.vm.defender.color = attackData.defender.color;
        this.vm.defender.avatar = attackData.defender.avatar;

        this.getCountrySvgDelay = 500;
        this.moveTroopsDelay = 2500;
        this.closeModalDelay = 2500;
        this.startShakeAnimationDelay = 100;
        this.stopShakeAnimationDelay = 500;

        const defendingNationName = this.vm.defender.name;
        setTimeout(() => {
            this.getCountrySvg(defendingNationName);
        }, this.getCountrySvgDelay);
    }

    fight() {
        // If one player loses 2 troops a scream sound is heard
        const response = this.vm.battleHandler.handleAttack(this.vm.attacker, this.vm.defender);
        if (response.defenderCasualties === 2 || response.attackerCasualties === 2) {
            this.soundService.screamSound.play();
        }

        this.vm.attackerDice = response.attackDice;
        this.vm.defenderDice = response.defendDice;
        this.vm.attacker = response.attacker;
        this.vm.defender = response.defender;

        if (this.vm.attacker.numberOfTroops === 0 || this.vm.defender.numberOfTroops === 0) {
            // the invasion failed
            this.vm.fightIsOver = true;
            if (this.vm.defender.numberOfTroops === 0) {
                // the invasion succeded
                this.soundService.cheer.play();
                //$('#attackerTroops .troopIcon svg').addClass('animated infinite bounce');

                if (this.vm.attacker.numberOfTroops > 1) {
                    this.vm.movementSliderOptions = {
                        floor: 1,
                        ceil: this.vm.attacker.numberOfTroops,
                        showTicks: true
                    };
                    this.vm.showMoveTroops = true;
                } else {
                    setTimeout(() => {
                        this.moveTroops();
                    }, this.moveTroopsDelay);
                }
            }
            if (this.vm.attacker.numberOfTroops === 0) {
                $('#defenderTroops .troopIcon svg').addClass('animated infinite bounce');
                setTimeout(() => {
                    this.closeModal(false);
                }, this.closeModalDelay);
            }
        } else {
            this.vm.disableButtons = true;
            setTimeout(() => {
                // Animate shake effect on side(s) affected by casualties
                let icons;
                if (response.defenderCasualties > response.attackerCasualties) {
                    icons = $('#defenderTroops .troopIcon');
                } else if (response.attackerCasualties > response.defenderCasualties) {
                    icons = $('#attackerTroops .troopIcon');
                } else if (response.attackerCasualties === response.defenderCasualties) {
                    icons = $('.troopIcon');
                }
                icons.addClass('shake shake-constant');

                setTimeout(() => {
                    icons.removeClass('shake shake-constant');
                    this.vm.disableButtons = false;
                    this.$scope.$apply();
                }, this.stopShakeAnimationDelay);
            }, this.startShakeAnimationDelay);
        }
    }

    closeModal(battleWasWon) {
        this.$uibModalInstance.close({
            attackFrom: this.vm.attacker,
            attackTo: this.vm.defender,
            battleWasWon
        });
    }

    moveTroops() {
        this.vm.defender.owner = this.vm.attacker.owner;
        this.vm.attacker.numberOfTroops = this.vm.attacker.numberOfTroops - this.vm.moveNumberOfTroops + 1;
        this.vm.defender.numberOfTroops = this.vm.moveNumberOfTroops;
        this.closeModal(true);
    }

    retreat() {
        this.vm.attacker.numberOfTroops++;
        this.closeModal(false);
    }

    convertTroopAmountToTroopTypes(troops) {
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

    getCountrySvg(territoryName) {
        const territorySvg = $(`#svgMap .country[id='${territoryName}']`).clone();
        territorySvg.removeClass('attackCursor highlighted');
        $('#territorySvg').html(territorySvg);

        const svg = document.getElementById('territorySvg');
        if (svg) {
            const bB = svg.getBBox();
            document.getElementById('territorySvg').setAttribute('viewBox', `${bB.x},${bB.y},${bB.width},${bB.height}`);
        }
    }
}
