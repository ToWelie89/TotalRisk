import {GAME_PHASES, TURN_PHASES, MAX_CARDS_ON_HAND} from './../gameConstants';
import {getTerritoryByName} from './../map/mapHelpers';

export function MainController($scope, $rootScope, $log, $uibModal, gameEngine, soundService, mapService) {
    var vm = this;

    // PUBLIC FUNCTIONS
    vm.filterByOwner = filterByOwner;
    vm.filterByRegion = filterByRegion;
    vm.nextTurn = nextTurn;
    vm.turnInCards = turnInCards;
    vm.checkIfNextIsDisabled = checkIfNextIsDisabled;
    vm.getCurrentPlayerColor = getCurrentPlayerColor;
    vm.init = init;
    vm.startGame = startGame;
    vm.toggleMusicVolume = toggleMusicVolume;
    vm.playSound = true;

    vm.gamePhases = GAME_PHASES;
    vm.currentGamePhase = GAME_PHASES.PLAYER_SETUP;

    vm.turn = {};

    function init() {
        $log.debug('Initialization of mainController');
    }

    function toggleMusicVolume() {
        vm.playSound = !vm.playSound;
        gameEngine.toggleSound(vm.playSound);
    }

    function startGame(players) {
        gameEngine.startGame(players);

        vm.currentGamePhase = vm.gamePhases.GAME;
        vm.troopsToDeploy = gameEngine.troopsToDeploy;

        document.querySelectorAll('.country').forEach(country => {
            country.addEventListener('click', (e) => {
                clickCountry(e);
            });
        });
        document.querySelectorAll('.troopCounter').forEach(country => {
            country.addEventListener('click', (e) => {
                clickCountry(e);
            });
        });
        document.querySelectorAll('.troopCounterText').forEach(country => {
            country.addEventListener('click', (e) => {
                clickCountry(e);
            });
        });

        vm.turn = gameEngine.turn;
        vm.filter = gameEngine.filter;
        mapService.updateMap(gameEngine.filter);

        $uibModal.open({
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

        });
    }

    function turnInCards() {
        $uibModal.open({
            templateUrl: 'cardTurnInModal.html',
            backdrop: 'static',
            windowClass: 'riskModal',
            controller: 'cardTurnInModalController',
            controllerAs: 'cardTurnIn'
        });
    }

    function nextTurn() {
        vm.turn = gameEngine.nextTurn();

        $uibModal.open({
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
        });

        mapService.updateMap(gameEngine.filter);
        if (vm.turn.turnPhase === TURN_PHASES.DEPLOYMENT) {
            vm.troopsToDeploy = gameEngine.troopsToDeploy;

            if (vm.turn.player.cards.length === MAX_CARDS_ON_HAND) {
                turnInCards();
            }
        }
        console.log('New turn: ', vm.turn);
        console.log('Current carddeck: ', gameEngine.cardDeck);
    }

    function checkIfPlayerWonTheGame() {
        // to do
    }

    function filterByOwner() {
        vm.filter = 'byOwner';
        gameEngine.filter = 'byOwner';
        mapService.updateMap(gameEngine.filter);
    }

    function filterByRegion() {
        vm.filter = 'byRegion';
        gameEngine.filter = 'byRegion';
        mapService.updateMap(gameEngine.filter);
    }

    function checkIfNextIsDisabled() {
        if (!gameEngine.turn) {
            return;
        }
        if (gameEngine.turn.turnPhase === TURN_PHASES.DEPLOYMENT && gameEngine.troopsToDeploy > 0) {
            return true;
        }
        return false;
    }

    function getCurrentPlayerColor() {
        return gameEngine.players ? gameEngine.players.get(vm.turn.player.name).color.mainColor : '';
    }

    function engageAttackPhase(clickedTerritory) {
        $uibModal.open({
            templateUrl: 'attackModal.html',
            backdrop: 'static',
            windowClass: 'riskModal',
            controller: 'attackModalController',
            controllerAs: 'attack',
            resolve: {
                attackData: () => {
                    return {
                        territoryAttacked: clickedTerritory,
                        attackFrom: gameEngine.selectedTerritory,
                        attacker: gameEngine.players.get(gameEngine.selectedTerritory.owner),
                        defender: gameEngine.players.get(clickedTerritory.owner)
                    }
                }
            }
        }).result.then(closeResponse => {
            gameEngine.setMusic();
            $log.debug('Battle is over ', closeResponse);
            // update map in gameEngine by changing owner and numberOfTroops
            const territoryAttacking = getTerritoryByName(gameEngine.map, closeResponse.attackFrom.name);

            territoryAttacking.owner = closeResponse.attackFrom.owner;
            territoryAttacking.numberOfTroops = closeResponse.attackFrom.numberOfTroops === 0 ? 1 : closeResponse.attackFrom.numberOfTroops;

            const territoryAttacked = getTerritoryByName(gameEngine.map, closeResponse.attackTo.name);

            territoryAttacked.owner = closeResponse.attackTo.owner;
            territoryAttacked.numberOfTroops = closeResponse.attackTo.numberOfTroops;

            if (closeResponse.battleWasWon) {
                gameEngine.takeCard(closeResponse.attackFrom.owner);
            }

            mapService.updateMap(vm.filter);
            checkIfPlayerWonTheGame();
        });
    }

    function clickCountry(evt) {
        let country = evt.target.getAttribute('id');
        if (!country) {
            country = evt.target.getAttribute('for');
        }
        const clickedTerritory = getTerritoryByName(gameEngine.map, country);

        if (gameEngine.turn.turnPhase === TURN_PHASES.DEPLOYMENT) {
            soundService.addTroopSound.play();
            gameEngine.addTroopToTerritory(country);
            mapService.updateMap(gameEngine.filter);
            vm.troopsToDeploy = gameEngine.troopsToDeploy;
            $scope.$apply();
            if (gameEngine.troopsToDeploy === 0) {
                nextTurn();
                $scope.$apply();
            }
        } else if (gameEngine.turn.turnPhase === TURN_PHASES.ATTACK) {
            if (gameEngine.selectedTerritory &&
                clickedTerritory.owner !== gameEngine.turn.player.name &&
                clickedTerritory.adjacentTerritories.includes(gameEngine.selectedTerritory.name) &&
                gameEngine.selectedTerritory.numberOfTroops > 1) {
                gameEngine.setMusic('./audio/bgmusic_attack.mp3');

                engageAttackPhase(clickedTerritory);
            } else {
                gameEngine.selectedTerritory = clickedTerritory;
                mapService.updateMap(gameEngine.filter);
                mapService.hightlightTerritory(country);
            }
        } else if (gameEngine.turn.turnPhase === TURN_PHASES.MOVEMENT) {
            if (gameEngine.selectedTerritory &&
                gameEngine.selectedTerritory.name === clickedTerritory.name) {
                gameEngine.selectedTerritory = undefined;
                mapService.updateMap(gameEngine.filter);
            } else if (gameEngine.selectedTerritory &&
                       clickedTerritory.owner === gameEngine.turn.player.name &&
                       gameEngine.selectedTerritory.numberOfTroops > 1 &&
                       clickedTerritory.name !== gameEngine.selectedTerritory.name &&
                       mapService.getTerritoriesForMovement(gameEngine.selectedTerritory).includes(clickedTerritory.name)) {
                // move troops
                engageMovementPhase(clickedTerritory);
            } else {
                gameEngine.selectedTerritory = clickedTerritory;
                mapService.updateMap(gameEngine.filter);
                if (gameEngine.selectedTerritory.numberOfTroops > 1) {
                    mapService.hightlightTerritory(country);
                }
            }
        }
    }

    function engageMovementPhase(toTerritory) {
        $uibModal.open({
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
                    return gameEngine.selectedTerritory;
                }
            }
        }).result.then(closeResponse => {
            gameEngine.setMusic();
            $log.debug('Movement complete ', closeResponse);
            const movementFromTerritory = getTerritoryByName(gameEngine.map, closeResponse.from.name);

            movementFromTerritory.numberOfTroops = closeResponse.from.numberOfTroops === 0 ? 1 : closeResponse.from.numberOfTroops;

            const movementToTerritory = getTerritoryByName(gameEngine.map, closeResponse.to.name);

            movementToTerritory.numberOfTroops = closeResponse.to.numberOfTroops;

            mapService.updateMap(vm.filter);
            nextTurn();
        });
    }
}
