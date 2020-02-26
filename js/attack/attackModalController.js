const BattleHandler = require('./battleHandler');
const {delay, shuffle, randomIntFromInterval } = require('./../helpers');
const {GAME_PHASES} = require('./../gameConstants');
const {loadSvgIntoDiv} = require('./../helpers');

class AttackModalController {
    constructor($scope, $rootScope, $uibModalInstance, soundService, tutorialService, attackData, socketService, gameEngine) {
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

        this.vm.diceAreRolling = false;
        this.vm.loading = true;
        this.vm.deployTroopsAnimationLoading = true;

        // PUBLIC FUNCTIONS
        this.vm.fight = this.fight;
        this.vm.blitzFight = this.blitzFight;
        this.vm.retreat = this.retreat;
        this.vm.moveTroops = this.moveTroops;
        this.vm.convertTroopAmountToTroopTypes = this.convertTroopAmountToTroopTypes;
        this.vm.getAsArray = this.getAsArray;

        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$uibModalInstance = $uibModalInstance;
        this.soundService = soundService;
        this.attackData = attackData;
        this.tutorialService = tutorialService;
        this.socketService = socketService;
        this.gameEngine = gameEngine;

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

        // Close the modal on escape if in tutorial mode
        this.boundListener = evt => this.keyupEventListener(evt);
        document.addEventListener('keyup', this.boundListener);

        this.vm.attackerTotalCasualites = 0;
        this.vm.defenderTotalCasualites = 0;

        //this.getCountrySvgDelay = 500;
        this.getCountrySvgDelay = 1;
        this.moveTroopsDelay = 2500;
        this.closeModalDelay = 2500;
        this.startShakeAnimationDelay = 100;
        this.stopShakeAnimationDelay = 500;
        this.tutorialDelayAfterStartAttack = 2500;

        this.multiplayerMode = this.attackData.multiplayer;

        if (this.multiplayerMode) {
            // display territories in battle for other players
            this.socketService.gameSocket.on('skipToNextPlayer', () => {
                this.retreat();
            });
        }
        setTimeout(() => {
            const battleFields = [
                'assets/battle.svg',
                'assets/battle_night.svg'
            ];
            const randomizedBattlefield = battleFields[Math.floor(Math.random() * battleFields.length)];
            loadSvgIntoDiv(randomizedBattlefield, '#attackModalBattleSvg', () => {
                let attackerCannons = Array.from(document.querySelectorAll('#attackModalBattleSvg svg .cannon.left')).reverse();
                const attackerSoldiers = Array.from(document.querySelectorAll('#attackModalBattleSvg svg #leftArmy .soldier')).sort((a, b) => {
                    return Number(a.getAttribute('index')) - Number(b.getAttribute('index'));
                }).slice(0, this.vm.attacker.numberOfTroops);
                const defenderSoldiers = Array.from(document.querySelectorAll('#attackModalBattleSvg svg #rightArmy .soldier')).sort((a, b) => {
                    return Number(a.getAttribute('index')) - Number(b.getAttribute('index'));
                }).slice(0, this.vm.defender.numberOfTroops);
                let defenderCannons = Array.from(document.querySelectorAll('#attackModalBattleSvg svg .cannon.right')).reverse();

                document.querySelector('#attackModalBattleSvg #leftTroopCounter').textContent = this.vm.attacker.numberOfTroops;
                document.querySelector('#attackModalBattleSvg #rightTroopCounter').textContent = this.vm.defender.numberOfTroops;

                $('#attackModalBattleSvg #leftTroopCounter, #attackModalBattleSvg #rightTroopCounter').animate({
                    opacity: 1
                }, 350);

                const cannonsToShow = numberOfTroops => {
                    let cannonsToShow;
                    if (numberOfTroops <= 8) cannonsToShow = 0;
                    if (numberOfTroops > 8 && numberOfTroops <= 12) cannonsToShow = 1;
                    if (numberOfTroops > 12 && numberOfTroops <= 15) cannonsToShow = 2;
                    if (numberOfTroops > 16) cannonsToShow = 3;
                    return cannonsToShow;
                };

                const attackerCannonsToShow = cannonsToShow(this.vm.attacker.numberOfTroops);
                const defenderCannonsToShow = cannonsToShow(this.vm.defender.numberOfTroops);

                attackerCannons = attackerCannons.slice(0, attackerCannonsToShow);
                defenderCannons = defenderCannons.slice(0, defenderCannonsToShow);
    
                attackerSoldiers.forEach(s => {
                    s.querySelectorAll('.colorable').forEach(c => c.style.fill = this.vm.attacker.color.mainColor);
                });
                defenderSoldiers.forEach(s => {
                    s.querySelectorAll('.colorable').forEach(c => c.style.fill = this.vm.defender.color.mainColor);
                });

                const allUnits = [...attackerSoldiers, ...attackerCannons, ...defenderSoldiers, ...defenderCannons];
                allUnits.forEach((unit, index) => {
                    setTimeout(() => {
                        unit.style.display = 'block';
                        soundService.newMessage.play();
                        if (index === (allUnits.length - 1)) {
                            this.vm.deployTroopsAnimationLoading = false;
                            this.$scope.$apply();
                        }
                    }, 50 * index);
                });
            });

            const attackerCanvas = document.getElementById('attackerCanvas');
            const defenderCanvas = document.getElementById('defenderCanvas');
            this.attacker_box = new dice_box(attackerCanvas, { w: 618, h: 200 }, {
                dice_color: '#6b0a05'
            });
            this.defender_box = new dice_box(defenderCanvas, { w: 618, h: 200 }, {
                dice_color: '#061a7f'
            });

            setTimeout(() => {
                $('#diceContainer').animate({
                    opacity: 1
                }, 150, () => {
                    this.vm.loading = false;
                    this.$scope.$apply();
                    if (attackData.tutorialMode) {
                        this.tutorial = this.attackData.tutorialMode;
                        this.runTutorial();
                    }
                });
            }, 50);

        }, this.getCountrySvgDelay);
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
        this.tutorialService.attackModalExplanation()
            .then(() => this.tutorialService.attackModalFightExplanation())
            .then(() => this.tutorialService.attackModalRetreatExplanation())
            .then(() => this.tutorialService.startAttack(this.attackData))
            .then(() => {
                this.fight([6, 4, 2], [3]);
                return delay(this.tutorialDelayAfterStartAttack);
            })
            .then(() => this.tutorialService.afterAttack(this.attackData))
            .then(() => this.tutorialService.afterAttack2(this.attackData))
            .then(() => this.tutorialService.moveAfterAttackExplanation(this.attackData))
            .then(() => {
                return new Promise(resolve => {
                    this.vm.moveNumberOfTroops = this.vm.attacker.numberOfTroops;
                    this.$scope.$apply();
                    resolve();
                });
            })
            .then(() => {
                this.moveTroops();
            })
            .catch((error) => {
                console.log('Attack modal error', error);
            });
    }

    blitzFight() {
        this.vm.diceAreRolling = true;
        this.vm.isBlitzFight = true;
        this.fight();
    }

    fight(preDeterminedAttackDice = null, preDeterminedDefendDice = null) {
        this.soundService.diceRoll.play();
        this.vm.diceAreRolling = true;

        const response = this.vm.battleHandler.handleAttack(this.vm.attacker, this.vm.defender, false, preDeterminedAttackDice, preDeterminedDefendDice);
        this.vm.attackerDice = response.attackDice;
        this.vm.defenderDice = response.defendDice;
        this.battleHandlerResponse = response;

        this.numberOfRollsComplete = 0;

        this.attacker_box.throw(this.vm.attackerDice, this.afterRoll, this);
        this.defender_box.throw(this.vm.defenderDice, this.afterRoll, this);

        const visibleUnits = Array.from(document.querySelectorAll('#attackModalBattleSvg svg .cannon, #attackModalBattleSvg svg .soldier')).filter(c => c.style.display === 'block');
        shuffle(visibleUnits);
        visibleUnits.forEach(s => {
            const randomDelay = randomIntFromInterval(0, 200);
            const soldierOriginalTransform = s.style.transform || getComputedStyle(s).transform;
            setTimeout(() => {
                s.querySelector('.fireflash').style.display = 'block';
                
                if (s.classList.contains('soldier')) {
                    const soldierTransformStyle = soldierOriginalTransform.replace('matrix(', '').replace(')', '').split(',');
                    soldierTransformStyle[4] = Math.round(Number(soldierTransformStyle[4].replace(' ', ''))) - 10;
    
                    const newTransform = `matrix(${soldierTransformStyle.join(',')})`;
                    s.style.transform = newTransform;
                }
                
                setTimeout(() => {
                    s.querySelector('.fireflash').style.display = 'none';
                    if (s.classList.contains('soldier')) s.style.transform = soldierOriginalTransform;
                }, 100);
            }, randomDelay);
        });

        this.soundService.muskets.play();
    }

    battleFought(attackerCasualties, defenderCasualties, attackerNumberOfTroops, defenderNumberOfTroops) {
        if (!this.multiplayerMode) {
            return;
        }
        if (this.multiplayerMode) {
            this.socketService.gameSocket.emit('battleFought', {
                attackerCasualties,
                defenderCasualties,
                attackerNumberOfTroops: (attackerNumberOfTroops + 1),
                defenderNumberOfTroops,
                defenderTerritory: this.vm.defender.name,
                attackerTerritory: this.vm.attacker.name
            });
        }
    }

    afterRoll(result, context) {
        context.numberOfRollsComplete++;
        if (context.numberOfRollsComplete !== 2) {
            return;
        }

        // If one player loses 2 troops a scream sound is heard
        /* if (context.battleHandlerResponse.defenderCasualties === 2 || context.battleHandlerResponse.attackerCasualties === 2) {
            context.soundService.screamSound.play();
        } */

        context.vm.attackerTotalCasualites += context.battleHandlerResponse.attackerCasualties;
        context.vm.defenderTotalCasualites += context.battleHandlerResponse.defenderCasualties;

        context.vm.attacker = context.battleHandlerResponse.attacker;
        context.vm.defender = context.battleHandlerResponse.defender;
        context.vm.attackerCasualties = context.battleHandlerResponse.attackerCasualties;
        context.vm.defenderCasualties = context.battleHandlerResponse.defenderCasualties;

        document.querySelector('#attackModalBattleSvg #leftTroopCounter').textContent = context.vm.attacker.numberOfTroops;
        document.querySelector('#attackModalBattleSvg #rightTroopCounter').textContent = context.vm.defender.numberOfTroops;

        context.$scope.$apply();

        const cannonsToShow = numberOfTroops => {
            let cannonsToShow;
            if (numberOfTroops <= 8) cannonsToShow = 0;
            if (numberOfTroops > 8 && numberOfTroops <= 12) cannonsToShow = 1;
            if (numberOfTroops > 12 && numberOfTroops <= 15) cannonsToShow = 2;
            if (numberOfTroops > 16) cannonsToShow = 3;
            return cannonsToShow;
        };

        const animateDyingSoldiers = soldiersToDie => {
            soldiersToDie.forEach((s, i) => {
                s.style.opacity = 0;
                const delay = 180 + (i * 50);
                setTimeout(() => {
                    s.style.display = 'none';
                }, delay);
            });
        };

        // Hide attacker cannons according to losses
        const attackerNumberOfTroops = context.vm.attacker.numberOfTroops;
        const attackerCannonsToShow = cannonsToShow(attackerNumberOfTroops);
        const visibleAttackerCannons = Array.from(document.querySelectorAll('#attackModalBattleSvg svg .cannon.left')).filter(c => c.style.display === 'block');
        const attackerCannonsToHide = visibleAttackerCannons.length - attackerCannonsToShow;
        visibleAttackerCannons.slice(0, attackerCannonsToHide).forEach(c => c.style.display = 'none');
        // Hide attacker soldiers cannons according to losses
        if (attackerNumberOfTroops < 8) {
            const soldiersToShow = attackerNumberOfTroops;
            const visibleSoldiers = Array.from(document.querySelectorAll('#attackModalBattleSvg svg #leftArmy .soldier')).filter(s => s.style.display === 'block');
            const numberOfsoldiersToHide = visibleSoldiers.length - soldiersToShow;
            
            const soldiersToHide = visibleSoldiers.sort((a, b) => Number(b.getAttribute('index')) - Number(a.getAttribute('index'))).slice(0, numberOfsoldiersToHide);
            animateDyingSoldiers(soldiersToHide);
        }

        // Hide defender cannons according to losses
        const defenderCannonsToShow = cannonsToShow(context.vm.defender.numberOfTroops);
        const visibleDefenderCannons = Array.from(document.querySelectorAll('#attackModalBattleSvg svg .cannon.right')).filter(c => c.style.display === 'block');
        const defenderCannonsToHide = visibleDefenderCannons.length - defenderCannonsToShow;
        visibleDefenderCannons.slice(0, defenderCannonsToHide).forEach(c => c.style.display = 'none');
        // Hide defender soldiers cannons according to losses
        if (context.vm.defender.numberOfTroops < 8) {
            const soldiersToShow = context.vm.defender.numberOfTroops;
            const visibleSoldiers = Array.from(document.querySelectorAll('#attackModalBattleSvg svg #rightArmy .soldier')).filter(s => s.style.display === 'block');
            const numberOfsoldiersToHide = visibleSoldiers.length - soldiersToShow;
            
            const soldiersToHide = visibleSoldiers.sort((a, b) => Number(b.getAttribute('index')) - Number(a.getAttribute('index'))).slice(0, numberOfsoldiersToHide);
            animateDyingSoldiers(soldiersToHide);
        }

        context.battleFought(
            context.battleHandlerResponse.attackerCasualties,
            context.battleHandlerResponse.defenderCasualties,
            context.vm.attacker.numberOfTroops,
            context.vm.defender.numberOfTroops
        );

        context.vm.diceAreRolling = false;

        if (context.vm.attacker.numberOfTroops === 0 || context.vm.defender.numberOfTroops === 0) {
            context.vm.isBlitzFight = false;

            // the invasion failed
            context.vm.fightIsOver = true;
            if (context.vm.defender.numberOfTroops === 0) {
                // the invasion succeded
                context.$scope.$apply();
                context.soundService.cheer.play();
                $('#attackerTroops .troopIcon svg').addClass('animated infinite bounce');

                if (context.vm.attacker.numberOfTroops > 3) {
                    context.vm.moveNumberOfTroops = 3;
                    context.vm.movementSliderOptions = {
                        floor: 3,
                        ceil: context.vm.attacker.numberOfTroops,
                        showTicks: true
                    };
                    context.vm.showMoveTroops = true;
                    context.$scope.$apply();
                } else if (!context.tutorial) {
                    setTimeout(() => {
                        context.vm.moveNumberOfTroops = context.vm.attacker.numberOfTroops;
                        context.moveTroops();
                    }, context.moveTroopsDelay);
                }
            }
            if (context.vm.attacker.numberOfTroops === 0) {
                context.$scope.$apply();
                $('#defenderTroops .troopIcon svg').addClass('animated infinite bounce');
                setTimeout(() => {
                    context.closeModal(false);
                }, context.closeModalDelay);
            }
        } else {
            context.vm.disableButtons = true;
            if (context.vm.isBlitzFight) {
                setTimeout(() => {
                    context.$scope.$apply();
                    context.vm.disableButtons = false;
                    context.blitzFight();
                }, context.startShakeAnimationDelay);
            } else {
                setTimeout(() => {
                    // Animate shake effect on side(s) affected by casualties
                    let icons;
                    if (context.defenderCasualties > context.attackerCasualties) {
                        icons = $('#defenderTroops .troopIcon');
                    } else if (context.attackerCasualties > context.defenderCasualties) {
                        icons = $('#attackerTroops .troopIcon');
                    } else if (context.attackerCasualties === context.defenderCasualties) {
                        icons = $('.troopIcon');
                    }
                    icons.addClass('shake shake-constant');

                    setTimeout(() => {
                        icons.removeClass('shake shake-constant');
                        context.vm.disableButtons = false;
                        context.$scope.$apply();
                    }, context.stopShakeAnimationDelay);
                }, context.startShakeAnimationDelay);
            }
        }
    }

    closeModal(battleWasWon, retreat = false) {
        const response = {
            attackFrom: Object.assign({}, this.vm.attacker),
            attackTo: Object.assign({}, this.vm.defender),
            battleWasWon,
            previousOwner: this.vm.previousOwner,
            retreat,
            attackerTotalCasualites: this.vm.attackerTotalCasualites,
            defenderTotalCasualites: this.vm.defenderTotalCasualites
        };

        this.$uibModalInstance.close(response);
    }

    moveTroops() {
        this.vm.previousOwner = this.vm.defender.owner;
        this.vm.defender.owner = this.vm.attacker.owner;
        this.vm.attacker.numberOfTroops = this.vm.attacker.numberOfTroops - this.vm.moveNumberOfTroops + 1;
        this.vm.defender.numberOfTroops = this.vm.moveNumberOfTroops;

        const response = {
            attackFrom: Object.assign({}, this.vm.attacker),
            attackTo: Object.assign({}, this.vm.defender),
            battleWasWon: true,
            previousOwner: this.vm.previousOwner,
            retreat: false,
            attackerTotalCasualites: this.vm.attackerTotalCasualites,
            defenderTotalCasualites: this.vm.defenderTotalCasualites
        };

        if (this.multiplayerMode) {
            this.socketService.gameSocket.emit('updateStatisticAfterInvasion', response);

            this.socketService.gameSocket.emit('updateOwnerAfterSuccessfulInvasion', {
                attackerTerritory: this.vm.attacker.name,
                defenderTerritory: this.vm.defender.name,
                attackerTerritoryNumberOfTroops: this.vm.attacker.numberOfTroops,
                defenderTerritoryNumberOfTroops: this.vm.defender.numberOfTroops,
                owner: this.vm.attacker.owner,
                previousOwner: this.vm.previousOwner,
                ownerUid: this.gameEngine.players.get(this.vm.attacker.owner).userUid
            });
        }

        this.$uibModalInstance.close(response);
    }

    retreat() {
        this.vm.attacker.numberOfTroops++;
        this.closeModal(false, true);
    }

    getAsArray(numberOfTroops) {
        return new Array(numberOfTroops);
    }

    convertTroopAmountToTroopTypes(troops) {
        const types = [{ name: 'cannon', value: 10, amount: 0 }, { name: 'horse', value: 5, amount: 0 }, { name: 'troop', value: 1, amount: 0 }];
        types.forEach(type => {
            type.amount = Math.floor(troops / type.value);
            troops = troops % type.value;
        });
        return types.reduce((t, c) => {
            t = [...t, ...new Array(c.amount).fill(c.name)];
            return t;
        }, []);
    }

    getCountrySvg(territoryName) {
        let mapContainer = 'map';
        if (this.attackData.tutorialMode) {
            mapContainer = 'tutorialMap';
        } else if (this.multiplayerMode) {
            mapContainer = 'multiplayerMap';
        }

        const territorySvg = $(`#${mapContainer} #svgMap .country[id='${territoryName}']`).clone();
        territorySvg.removeClass('attackCursor highlighted');
        $('#territorySvg').html(territorySvg);

        const svg = document.getElementById('territorySvg');
        if (svg) {
            const bB = svg.getBBox();
            document.getElementById('territorySvg').setAttribute('viewBox', `${bB.x},${bB.y},${bB.width},${bB.height}`);
        }
    }
}

module.exports = AttackModalController;