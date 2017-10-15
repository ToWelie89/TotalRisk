import {GAME_PHASES, TURN_PHASES, MAX_CARDS_ON_HAND} from './../gameConstants';
import {getTerritoryByName} from './../map/mapHelpers';

export default class MainController {

    constructor($scope, $uibModal, gameEngine, soundService, mapService) {
        this.vm = this;

        // PUBLIC FUNCTIONS
        this.vm.filterByOwner = this.filterByOwner;
        this.vm.filterByRegion = this.filterByRegion;
        this.vm.nextTurn = this.nextTurn;
        this.vm.turnInCards = this.turnInCards;
        this.vm.checkIfNextIsDisabled = this.checkIfNextIsDisabled;
        this.vm.getCurrentPlayerColor = this.getCurrentPlayerColor;
        this.vm.startGame = this.startGame;
        this.vm.toggleMusicVolume = this.toggleMusicVolume;
        this.vm.playSound = true;

        this.vm.gamePhases = GAME_PHASES;
        this.vm.currentGamePhase = GAME_PHASES.PLAYER_SETUP;

        this.vm.turn = {};

        this.$scope = $scope;
        this.$uibModal = $uibModal;
        this.gameEngine = gameEngine;
        this.soundService = soundService;
        this.mapService = mapService;

        console.log('Initialization of mainController');
    }

    toggleMusicVolume() {
        this.vm.playSound = !this.vm.playSound;
        this.gameEngine.toggleSound(this.vm.playSound);
    }

    startGame(players) {
        this.gameEngine.startGame(players);

        this.vm.currentGamePhase = this.vm.gamePhases.GAME;
        this.vm.troopsToDeploy = this.gameEngine.troopsToDeploy;

        document.querySelectorAll('.country').forEach(country => {
            country.addEventListener('click', (e) => {
                this.clickCountry(e);
            });
        });
        document.querySelectorAll('.troopCounter').forEach(country => {
            country.addEventListener('click', (e) => {
                this.clickCountry(e);
            });
        });
        document.querySelectorAll('.troopCounterText').forEach(country => {
            country.addEventListener('click', (e) => {
                this.clickCountry(e);
            });
        });

        this.vm.turn = this.gameEngine.turn;
        this.vm.filter = this.gameEngine.filter;
        this.mapService.updateMap(this.gameEngine.filter);

        /*this.gameEngine.takeCard(this.vm.turn.player.name);
        this.gameEngine.turn.playerHasWonAnAttackThisTurn = false;
        this.gameEngine.takeCard(this.vm.turn.player.name);
        this.gameEngine.turn.playerHasWonAnAttackThisTurn = false;
        this.gameEngine.takeCard(this.vm.turn.player.name);
        this.gameEngine.turn.playerHasWonAnAttackThisTurn = false;
        this.gameEngine.takeCard(this.vm.turn.player.name);
        this.gameEngine.turn.playerHasWonAnAttackThisTurn = false;
        this.gameEngine.takeCard(this.vm.turn.player.name);*/

        this.$uibModal.open({
            templateUrl: 'turnPresentationModal.html',
            backdrop: 'static',
            windowClass: 'riskModal',
            controller: 'turnPresentationController',
            controllerAs: 'turnPresentation',
            resolve: {
                presentType: () => {
                    return 'startGame';
                }
            }
        }).result.then(closeResponse => {
            this.checkIfPlayerMustTurnInCards();
        });
    }

    checkIfPlayerMustTurnInCards() {
        if (this.vm.turn.turnPhase === TURN_PHASES.DEPLOYMENT) {
            this.vm.troopsToDeploy = this.gameEngine.troopsToDeploy;

            if (this.vm.turn.player.cards.length >= MAX_CARDS_ON_HAND) {
                this.turnInCards();
            }
        }
    }

    turnInCards() {
        this.$uibModal.open({
            templateUrl: 'cardTurnInModal.html',
            backdrop: 'static',
            windowClass: 'riskModal',
            controller: 'cardTurnInModalController',
            controllerAs: 'cardTurnIn'
        }).result.then(closeResponse => {
            if (closeResponse && closeResponse.newTroops) {
                console.log(`Cards turned in for ${closeResponse.newTroops} new troops`);
                $('#mainTroopIndicator').addClass('animated infinite bounce');
                this.soundService.cardTurnIn.play();
                this.gameEngine.troopsToDeploy += closeResponse.newTroops;
                this.vm.troopsToDeploy = this.gameEngine.troopsToDeploy;
                setTimeout(() => {
                    this.$scope.$apply();
                }, 100);
                setTimeout(() => {
                    $('#mainTroopIndicator').removeClass('animated infinite bounce');
                }, 1000);
            }
        });
    }

    nextTurn() {
        this.vm.turn = this.gameEngine.nextTurn();

        this.$uibModal.open({
            templateUrl: 'turnPresentationModal.html',
            backdrop: 'static',
            windowClass: 'riskModal',
            controller: 'turnPresentationController',
            controllerAs: 'turnPresentation',
            resolve: {
                presentType: () => {
                    return 'newTurn';
                }
            }
        }).result.then(closeResponse => {
            this.mapService.updateMap(this.gameEngine.filter);
            this.checkIfPlayerMustTurnInCards();
            console.log('New turn: ', this.vm.turn);
            console.log('Current carddeck: ', this.gameEngine.cardDeck);
        });
    }

    checkIfPlayerWonTheGame() {
        // to do
    }

    filterByOwner() {
        this.vm.filter = 'byOwner';
        this.gameEngine.filter = 'byOwner';
        this.mapService.updateMap(this.gameEngine.filter);
    }

    filterByRegion() {
        this.vm.filter = 'byRegion';
        this.gameEngine.filter = 'byRegion';
        this.mapService.updateMap(this.gameEngine.filter);
    }

    checkIfNextIsDisabled() {
        if (!this.gameEngine.turn) {
            return;
        }
        if (this.gameEngine.turn.turnPhase === TURN_PHASES.DEPLOYMENT && this.gameEngine.troopsToDeploy > 0) {
            return true;
        }
        return false;
    }

    getCurrentPlayerColor() {
        return this.gameEngine.players ? this.gameEngine.players.get(this.vm.turn.player.name).color.mainColor : '';
    }

    engageAttackPhase(clickedTerritory) {
        this.$uibModal.open({
            templateUrl: 'attackModal.html',
            backdrop: 'static',
            windowClass: 'riskModal',
            controller: 'attackModalController',
            controllerAs: 'attack',
            resolve: {
                attackData: () => {
                    return {
                        territoryAttacked: clickedTerritory,
                        attackFrom: this.gameEngine.selectedTerritory,
                        attacker: this.gameEngine.players.get(this.gameEngine.selectedTerritory.owner),
                        defender: this.gameEngine.players.get(clickedTerritory.owner)
                    }
                }
            }
        }).result.then(closeResponse => {
            this.gameEngine.setMusic();
            console.log('Battle is over ', closeResponse);
            // update map in gameEngine by changing owner and numberOfTroops
            const territoryAttacking = getTerritoryByName(this.gameEngine.map, closeResponse.attackFrom.name);

            territoryAttacking.owner = closeResponse.attackFrom.owner;
            territoryAttacking.numberOfTroops = closeResponse.attackFrom.numberOfTroops === 0 ? 1 : closeResponse.attackFrom.numberOfTroops;

            const territoryAttacked = getTerritoryByName(this.gameEngine.map, closeResponse.attackTo.name);

            territoryAttacked.owner = closeResponse.attackTo.owner;
            territoryAttacked.numberOfTroops = closeResponse.attackTo.numberOfTroops;

            if (closeResponse.battleWasWon) {
                if (!this.gameEngine.turn.playerHasWonAnAttackThisTurn) {
                    this.soundService.cardSelect.play();
                }
                this.gameEngine.takeCard(closeResponse.attackFrom.owner);
            }

            this.mapService.updateMap(this.vm.filter);
            this.checkIfPlayerWonTheGame();
        });
    }

    clickCountry(evt) {
        let country = evt.target.getAttribute('id');
        if (!country) {
            country = evt.target.getAttribute('for');
        }
        const clickedTerritory = getTerritoryByName(this.gameEngine.map, country);

        if (this.gameEngine.turn.turnPhase === TURN_PHASES.DEPLOYMENT) {
            if (this.gameEngine.troopsToDeploy > 0 && clickedTerritory.owner === this.gameEngine.turn.player.name) {
                this.soundService.addTroopSound.play();
            }
            this.gameEngine.addTroopToTerritory(country);
            this.mapService.updateMap(this.gameEngine.filter);
            this.vm.troopsToDeploy = this.gameEngine.troopsToDeploy;
            this.$scope.$apply();
            if (this.gameEngine.troopsToDeploy === 0) {
                this.nextTurn();
                this.$scope.$apply();
            }
        } else if (this.gameEngine.turn.turnPhase === TURN_PHASES.ATTACK) {
            if (this.gameEngine.selectedTerritory &&
                clickedTerritory.owner !== this.gameEngine.turn.player.name &&
                clickedTerritory.adjacentTerritories.includes(this.gameEngine.selectedTerritory.name) &&
                this.gameEngine.selectedTerritory.numberOfTroops > 1) {
                this.gameEngine.setMusic('./audio/bgmusic_attack.mp3');

                this.engageAttackPhase(clickedTerritory);
            } else {
                this.gameEngine.selectedTerritory = clickedTerritory;
                this.mapService.updateMap(this.gameEngine.filter);
                this.mapService.hightlightTerritory(country);
            }
        } else if (this.gameEngine.turn.turnPhase === TURN_PHASES.MOVEMENT) {
            if (this.gameEngine.selectedTerritory &&
                this.gameEngine.selectedTerritory.name === clickedTerritory.name) {
                this.gameEngine.selectedTerritory = undefined;
                this.mapService.updateMap(this.gameEngine.filter);
            } else if (this.gameEngine.selectedTerritory &&
                       clickedTerritory.owner === this.gameEngine.turn.player.name &&
                       this.gameEngine.selectedTerritory.numberOfTroops > 1 &&
                       clickedTerritory.name !== this.gameEngine.selectedTerritory.name &&
                       this.mapService.getTerritoriesForMovement(this.gameEngine.selectedTerritory).includes(clickedTerritory.name)) {
                // move troops
                this.engageMovementPhase(clickedTerritory);
            } else {
                this.gameEngine.selectedTerritory = clickedTerritory;
                this.mapService.updateMap(this.gameEngine.filter);
                if (this.gameEngine.selectedTerritory.numberOfTroops > 1) {
                    this.mapService.hightlightTerritory(country);
                }
            }
        }
    }

    engageMovementPhase(toTerritory) {
        this.$uibModal.open({
            templateUrl: 'movementModal.html',
            backdrop: 'static',
            windowClass: 'riskModal',
            controller: 'movementModalController',
            controllerAs: 'movement',
            resolve: {
                moveTo: () => {
                    return toTerritory;
                },
                moveFrom: () => {
                    return this.gameEngine.selectedTerritory;
                }
            }
        }).result.then(closeResponse => {
            this.gameEngine.setMusic();
            console.log('Movement complete ', closeResponse);
            const movementFromTerritory = getTerritoryByName(this.gameEngine.map, closeResponse.from.name);

            movementFromTerritory.numberOfTroops = closeResponse.from.numberOfTroops === 0 ? 1 : closeResponse.from.numberOfTroops;

            const movementToTerritory = getTerritoryByName(this.gameEngine.map, closeResponse.to.name);

            movementToTerritory.numberOfTroops = closeResponse.to.numberOfTroops;

            this.mapService.updateMap(this.vm.filter);
            this.nextTurn();
        });
    }
}
