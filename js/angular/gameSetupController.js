import Player from './../player/player';
import {PLAYER_COLORS, PLAYER_PREDEFINED_NAMES} from './../player/playerConstants';
import {CONSTANTS} from './../gameConstants';

export default class GameSetupController {

    constructor($scope, $log, soundService) {
        this.vm = this;
        this.$log = $log;
        this.soundService = soundService;

        // PUBLIC FIELDS
        this.vm.maxPlayers = CONSTANTS.MAX_NUMBER_OF_PLAYERS;
        this.vm.minPlayers = CONSTANTS.MIN_NUMBER_OF_PLAYERS;

        // PUBLIC FUNCTIONS
        this.vm.init = this.init;
        this.vm.addPlayer = this.addPlayer;
        this.vm.removePlayer = this.removePlayer;
        this.vm.startGameIsDisabled = this.startGameIsDisabled;
        this.vm.hasDuplicates = this.hasDuplicates;
        this.vm.emptyNamesExists = this.emptyNamesExists;
        this.vm.updateColorOfPlayer = this.updateColorOfPlayer;
    }

    init() {
        this.$log.debug('Initialize game setup controller');
        this.vm.players = Array.from(new Array(CONSTANTS.MIN_NUMBER_OF_PLAYERS), (x, i) => new Player(PLAYER_PREDEFINED_NAMES[i], Object.keys(PLAYER_COLORS).map(key => PLAYER_COLORS[key])[i]));
        this.$log.debug('Players: ', this.vm.players);
    }

    updateColorOfPlayer(player, color) {
        let colorIsUsedBy;
        let colorIsUsed = false;
        this.vm.players.forEach(currentPlayer => {
            if (player.name === currentPlayer.name) {
                this.vm.players.forEach(player => {
                    if (player.color.name.toUpperCase() === color.name.toUpperCase()) {
                        colorIsUsed = true;
                        colorIsUsedBy = player;
                    }
                });
                player.color = color;
            }
        });
        if (colorIsUsed) {
            colorIsUsedBy.color = this.getUnusedColor();
        }
    }

    addPlayer() {
        this.soundService.bleep.play();

        if (this.vm.players.count === CONSTANTS.MAX_NUMBER_OF_PLAYERS) {
            return;
        }
        let colorToUse;

        Array.from(Object.keys(PLAYER_COLORS)).forEach(color => {
            let colorIsUsed = false;
            this.vm.players.forEach(player => {
                if (player.color.name.toUpperCase() === color) {
                    colorIsUsed = true;
                }
            });
            if (!colorIsUsed) {
                colorToUse = color;
            }
        });
        if (colorToUse) {
            this.vm.players.push(new Player(this.getFirstUnusedName(), PLAYER_COLORS[colorToUse]));
        }
    }

    removePlayer(playerToRemove) {
        this.vm.players = this.vm.players.filter(player => {
            if (player !== playerToRemove) {
                return player;
            }
        });
    }

    getUnusedColor() {
        const usedColors = this.vm.players.map(player => player.color);
        const availableColors = Array.from(Object.keys(PLAYER_COLORS).map((key, index) => PLAYER_COLORS[key]));

        let colorToReturn;

        availableColors.forEach(color => {
            if (!usedColors.includes(color)) {
                colorToReturn = color;
            }
        });

        return colorToReturn;
    }

    getFirstUnusedName() {
        let name;
        const usedNames = this.vm.players.map(player => player.name);

        PLAYER_PREDEFINED_NAMES.forEach(playerName => {
            if (!usedNames.includes(playerName)) {
                name = playerName;
            }
        });

        return name;
    }

    startGameIsDisabled() {
        let returnValue = false;
        // Check that all players has a name set
        returnValue = this.emptyNamesExists();
        // Check that names aren't identical
        if (!returnValue) {
            returnValue = this.hasDuplicates();
        }

        return returnValue;
    }

    hasDuplicates() {
        const names = Array.from(this.vm.players, x => x.name.toLowerCase());
        return (new Set(names)).size !== names.length;
    }

    emptyNamesExists() {
        let returnValue = false;
        this.vm.players.forEach(player => {
            if (!player.name) {
                returnValue = true;
            }
        });
        return returnValue;
    }
}
