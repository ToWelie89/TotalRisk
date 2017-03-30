import Player from './../player/player';
import {PLAYER_COLORS, PLAYER_PREDEFINED_NAMES} from './../player/playerConstants';
import {CONSTANTS} from './../gameConstants';

export function GameSetupController($scope, soundService) {
    let vm = this;

    // PUBLIC FIELDS
    vm.maxPlayers = CONSTANTS.MAX_NUMBER_OF_PLAYERS;
    vm.minPlayers = CONSTANTS.MIN_NUMBER_OF_PLAYERS;

    // PUBLIC FUNCTIONS
    vm.init = init;
    vm.addPlayer = addPlayer;
    vm.removePlayer = removePlayer;
    vm.startGameIsDisabled = startGameIsDisabled;
    vm.hasDuplicates = hasDuplicates;
    vm.emptyNamesExists = emptyNamesExists;
    vm.updateColorOfPlayer = updateColorOfPlayer;

    function init() {
        console.log('Initialize game setup controller');
        vm.players = Array.from(new Array(CONSTANTS.MIN_NUMBER_OF_PLAYERS), (x, i) => new Player(PLAYER_PREDEFINED_NAMES[i], Object.keys(PLAYER_COLORS).map(key => PLAYER_COLORS[key])[i]));
        console.log(vm.players);
    }

    function updateColorOfPlayer(player, color) {
        let colorIsUsedBy;
        let colorIsUsed = false;
        vm.players.forEach(currentPlayer => {
            if (player.name === currentPlayer.name) {
                vm.players.forEach(player => {
                    if (player.color.name.toUpperCase() === color.name.toUpperCase()) {
                        colorIsUsed = true;
                        colorIsUsedBy = player;
                    }
                });
                if (!colorIsUsed) {
                    player.color = color;
                } else {
                    // change the color of the player currently using this color then
                    player.color = color;
                }
            }
        });
        if (colorIsUsed) {
            colorIsUsedBy.color = getUnusedColor();
        }
    }

    function addPlayer() {
        soundService.bleep.play();

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
            vm.players.push(new Player(getFirstUnusedName(), PLAYER_COLORS[colorToUse]));
        }
    }

    function removePlayer(playerToRemove) {
        vm.players = vm.players.filter(player => {
            if (player !== playerToRemove) {
                return player;
            }
        });
    }

    function getUnusedColor() {
        const usedColors = vm.players.map((player) => player.color);
        const availableColors = Array.from(Object.keys(PLAYER_COLORS).map((key, index) => PLAYER_COLORS[key]));

        let colorToReturn;

        availableColors.forEach((color) => {
            if (!usedColors.includes(color)) {
                colorToReturn = color;
            }
        });

        return colorToReturn;
    }

    function getFirstUnusedName() {
        let name;
        const usedNames = vm.players.map((player) => player.name);

        PLAYER_PREDEFINED_NAMES.forEach((playerName) => {
            if (!usedNames.includes(playerName)) {
                name = playerName;
            }
        });

        return name;
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
        const names = Array.from(vm.players, x => x.name.toLowerCase());
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
