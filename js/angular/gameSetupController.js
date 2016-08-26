import Player from './../player/player';
import { PLAYER_COLORS } from './../player/playerConstants';
import { CONSTANTS } from './../gameConstants';

export function GameSetupController($scope) {
    var vm = this;

    // PUBLIC FIELDS
    vm.players;
    vm.maxPlayers = CONSTANTS.MAX_NUMBER_OF_PLAYERS;
    vm.minPlayers = CONSTANTS.MIN_NUMBER_OF_PLAYERS;

    // PUBLIC FUNCTIONS
    vm.init = init;
    vm.addPlayer = addPlayer;
    vm.removePlayer = removePlayer;
    vm.startGameIsDisabled = startGameIsDisabled;
    vm.hasDuplicates = hasDuplicates;
    vm.emptyNamesExists = emptyNamesExists;

    function init() {
        console.log('Initialize game setup controller');
        vm.players = Array.from(new Array(CONSTANTS.MIN_NUMBER_OF_PLAYERS), (x,i) => new Player(`Player ${i+1}`, Object.keys(PLAYER_COLORS).map(key => PLAYER_COLORS[key])[i]));
        console.log(vm.players);
    }

    function addPlayer() {
        if (vm.players.count === CONSTANTS.MAX_NUMBER_OF_PLAYERS) {
            return;
        }
        let colorToUse;

        Array.from(Object.keys(PLAYER_COLORS)).forEach(color => {
            let colorIsUsed = false;
            vm.players.forEach(player => {
                if (player.color.name.toUpperCase() === color) {
                    colorIsUsed = true;
                }
            });
            if (!colorIsUsed) {
                colorToUse = color;
            }
        });
        if (colorToUse) {
            vm.players.push(new Player('', PLAYER_COLORS[colorToUse]));
        }
    }

    function removePlayer(playerToRemove) {
        vm.players = vm.players.filter(player => {
            if (player !== playerToRemove) {
                return player;
            }
        });
    }

    function startGameIsDisabled() {
        let returnValue = false;
        // Check that all players has a name set
        returnValue = emptyNamesExists();
        // Check that names aren't identical
        if (!returnValue) {
            returnValue = hasDuplicates();
        }

        return returnValue;
    }

    function hasDuplicates() {
        let names = Array.from(vm.players, x => x.name.toLowerCase());
        return (new Set(names)).size !== names.length;
    }

    function emptyNamesExists() {
        let returnValue = false;
        vm.players.forEach(player => {
            if (!player.name) {
                returnValue = true;
            }
        });
        return returnValue;
    }
}