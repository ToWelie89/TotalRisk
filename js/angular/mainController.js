import {GAME_PHASES, TURN_PHASES} from './../gameConstants';
import {getTerritoryByName} from './../map/mapHelpers';

export function MainController($scope, $rootScope, $log, gameEngine, soundService, mapService) {
    var vm = this;

    // PUBLIC FUNCTIONS
    vm.filterByOwner = filterByOwner;
    vm.filterByRegion = filterByRegion;
    vm.nextTurn = nextTurn;
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
        setupEvents();
        $log.debug('Initialization of mainController');
    }

    function toggleMusicVolume() {
        vm.playSound = !vm.playSound;
        gameEngine.toggleSound(vm.playSound);
    }

    function setupEvents() {
        $rootScope.$on('battleIsOver', function(event, data) {
            gameEngine.setMusic();
            $log.debug('Battle is over ', data);
            // update map in gameEngine by changing owner and numberOfTroops
            let territoryAttacking = getTerritoryByName(gameEngine.map, data.attackFrom.name);

            territoryAttacking.owner = data.attackFrom.owner;
            territoryAttacking.numberOfTroops = data.attackFrom.numberOfTroops === 0 ? 1 : data.attackFrom.numberOfTroops;

            let territoryAttacked = getTerritoryByName(gameEngine.map, data.attackTo.name);

            territoryAttacked.owner = data.attackTo.owner;
            territoryAttacked.numberOfTroops = data.attackTo.numberOfTroops;

            mapService.updateMap(vm.filter);
            checkIfPlayerWonTheGame();
        });

        $rootScope.$on('movementIsOver', function(event, data) {
            gameEngine.setMusic();
            $log.debug('Movement complete ', data);
            let movementFromTerritory = getTerritoryByName(gameEngine.map, data.from.name);

            movementFromTerritory.numberOfTroops = data.from.numberOfTroops === 0 ? 1 : data.from.numberOfTroops;

            let movementToTerritory = getTerritoryByName(gameEngine.map, data.to.name);

            movementToTerritory.numberOfTroops = data.to.numberOfTroops;

            mapService.updateMap(vm.filter);
            nextTurn();
        });
    }

    function startGame(players) {
        gameEngine.startGame(players);
        $rootScope.$emit('turnPresenterStartGame');
        vm.currentGamePhase = vm.gamePhases.GAME;
        vm.troopsToDeploy = gameEngine.troopsToDeploy;

        document.querySelectorAll('.country').forEach(country => {
            country.addEventListener('click', (e) => {
                clickCountry(e);
            });
        });

        vm.turn = gameEngine.turn;
        vm.filter = gameEngine.filter;
        mapService.updateMap(gameEngine.filter);
    }

    function nextTurn() {
        vm.turn = gameEngine.nextTurn();
        $rootScope.$emit('turnPresenterNewTurn');
        mapService.updateMap(gameEngine.filter);
        if (vm.turn.turnPhase === TURN_PHASES.DEPLOYMENT) {
            vm.troopsToDeploy = gameEngine.troopsToDeploy;
        }
        $log.debug('New turn: ', vm.turn);
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

    function clickCountry(evt) {
        const country = evt.target.getAttribute('id');
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
                $rootScope.$emit('engageAttackPhase', {
                    territoryAttacked: clickedTerritory,
                    attackFrom: gameEngine.selectedTerritory,
                    attacker: gameEngine.players.get(gameEngine.selectedTerritory.owner),
                    defender: gameEngine.players.get(clickedTerritory.owner)
                });
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
                       clickedTerritory.name !== gameEngine.selectedTerritory.name) {
                // move troops
                $rootScope.$emit('engageMovementPhase', {
                    moveTo: clickedTerritory,
                    moveFrom: gameEngine.selectedTerritory
                });
            } else {
                gameEngine.selectedTerritory = clickedTerritory;
                mapService.updateMap(gameEngine.filter);
                mapService.hightlightTerritory(country);
            }
        }
    }
}
