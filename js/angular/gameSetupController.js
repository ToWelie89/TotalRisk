import Player from './../player/player';
import { PLAYER_COLORS } from './../player/playerConstants';

export function GameSetupController($scope) {
    var vm = this;

    vm.players;
    vm.minimumNumberOfPlayers = 2;

    // PUBLIC FUNCTIONS
    vm.init = init;
    vm.addPlayer = addPlayer;
    vm.removePlayer = removePlayer;
    vm.startGameIsDisabled = startGameIsDisabled;

    function init() {
        console.log('Initialize game setup controller');
        vm.players = Array.from(new Array(vm.minimumNumberOfPlayers), (x,i) => new Player('', Object.keys(PLAYER_COLORS).map(key => PLAYER_COLORS[key])[i]));
        console.log(vm.players);
    }

    function addPlayer() {
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

    function removePlayer(player) {
    }

    function startGameIsDisabled() {
        let returnValue = false;
        vm.players.forEach(player => {
            if (!player.name) {
                returnValue = true;
            }
        });

        return returnValue;
    }
}