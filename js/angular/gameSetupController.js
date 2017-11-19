import Player from './../player/player';
import {PLAYER_COLORS, avatars, PLAYER_TYPES} from './../player/playerConstants';
import {CONSTANTS, VICTORY_GOALS} from './../gameConstants';

export default class GameSetupController {

    constructor($scope, soundService) {
        this.vm = this;
        this.soundService = soundService;

        // PUBLIC FIELDS
        this.vm.maxPlayers = CONSTANTS.MAX_NUMBER_OF_PLAYERS;
        this.vm.minPlayers = CONSTANTS.MIN_NUMBER_OF_PLAYERS;
        this.vm.victoryGoals = VICTORY_GOALS;

        // PUBLIC FUNCTIONS
        this.vm.init = this.init;
        this.vm.addPlayer = this.addPlayer;
        this.vm.removePlayer = this.removePlayer;
        this.vm.startGameIsDisabled = this.startGameIsDisabled;
        this.vm.hasDuplicates = this.hasDuplicates;
        this.vm.emptyNamesExists = this.emptyNamesExists;
        this.vm.updateColorOfPlayer = this.updateColorOfPlayer;
        this.vm.updateAvatarOfPlayer = this.updateAvatarOfPlayer;
        this.vm.choosePlayerType = this.choosePlayerType;
        this.vm.onlyAIsExists = this.onlyAIsExists;
        this.vm.setGoal = this.setGoal;
    }

    init() {
        console.log('Initialize game setup controller');
        this.vm.players = Array.from(
            new Array(CONSTANTS.MIN_NUMBER_OF_PLAYERS), (x, i) =>
                new Player(Object.keys(avatars).map(key => key)[i],
                           Object.keys(PLAYER_COLORS).map(key => PLAYER_COLORS[key])[i],
                           Object.keys(avatars).map(key => avatars[key])[i],
                           PLAYER_TYPES.HUMAN)
        );

        $(document).ready(function() {
            if ($('[data-toggle="tooltip"]').length) {
                $('[data-toggle="tooltip"]').tooltip();
            }
        });

        this.vm.chosenGoal = this.vm.victoryGoals.filter(x => this.vm.players.length >= x.requiredAmountOfPlayers)[0];

        console.log('Players: ', this.vm.players);
    }

    setGoal(goal) {
        this.vm.chosenGoal = goal;
        this.soundService.changeColor.play();
    }

    updateAvatarOfPlayer(player, avatar) {
        const currentPlayer = this.vm.players.find((currentPlayer) => currentPlayer.name === player.name);
        const currentOwnerOfAvatar = this.vm.players.find((currentPlayer) => currentPlayer.avatar === avatar);

        if (currentPlayer) {
            currentPlayer.avatar = avatar;
            currentPlayer.name = Object.keys(avatars).find(name => avatars[name] === avatar);
        }
        if (currentOwnerOfAvatar) {
            const newAvatar = this.getUnusedAvatar();
            currentOwnerOfAvatar.avatar = newAvatar.avatar;
            currentOwnerOfAvatar.name = newAvatar.name;
        }

        this.soundService.changeColor.play();
    }

    updateColorOfPlayer(player, color) {
        const currentPlayer = this.vm.players.find((currentPlayer) => currentPlayer.name === player.name);
        const currentOwnerOfColor = this.vm.players.find((currentPlayer) => currentPlayer.color.name.toUpperCase() === color.name.toUpperCase());

        if (currentPlayer) {
            currentPlayer.color = color;
        }
        if (currentOwnerOfColor) {
            currentOwnerOfColor.color = this.getUnusedColor();
        }

        this.soundService.changeColor.play();
    }

    addPlayer() {
        if (this.vm.players.length === CONSTANTS.MAX_NUMBER_OF_PLAYERS) {
            return;
        }

        this.soundService.bleep2.play();
        this.vm.players.push(new Player(this.getFirstUnusedName(), this.getUnusedColor(), this.getUnusedAvatar().avatar, PLAYER_TYPES.HUMAN));

        if (this.vm.chosenGoal.requiredAmountOfPlayers > this.vm.players.length) {
            this.vm.chosenGoal = this.vm.victoryGoals.filter(x => this.vm.players.length >= x.requiredAmountOfPlayers)[0];
        }
    }

    removePlayer(playerToRemove) {
        if (this.vm.players.length === CONSTANTS.MIN_NUMBER_OF_PLAYERS) {
            return;
        }

        this.soundService.remove.play();
        this.vm.players = this.vm.players.filter(player => {
            if (player !== playerToRemove) {
                return player;
            }
        });

        if (this.vm.chosenGoal.requiredAmountOfPlayers > this.vm.players.length) {
            this.vm.chosenGoal = this.vm.victoryGoals.filter(x => this.vm.players.length >= x.requiredAmountOfPlayers)[0];
        }
    }

    getUnusedColor() {
        const usedColors = this.vm.players.map(player => player.color);
        const availableColors = Array.from(Object.keys(PLAYER_COLORS).map((key, index) => PLAYER_COLORS[key]));

        const colorToReturn = availableColors.find(color => !usedColors.includes(color));
        return colorToReturn;
    }

    getUnusedAvatar() {
        const usedAvatars = this.vm.players.map(player => player.avatar);
        const availableAvatars = Array.from(Object.keys(avatars).map((key, index) => avatars[key]));

        const avatarToReturn = availableAvatars.find(avatar => !usedAvatars.includes(avatar));
        const nameOfAvatar = Object.keys(avatars).find(name => avatars[name] === avatarToReturn);

        return {
            avatar: avatarToReturn,
            name: nameOfAvatar
        };
    }

    choosePlayerType(player, type) {
        player.type = PLAYER_TYPES[type];
        this.soundService.changeColor.play();
    }

    getFirstUnusedName() {
        const usedNames = this.vm.players.map(player => player.name);
        const name = Array.from(Object.keys(avatars)).find(playerName => !usedNames.includes(playerName));

        return name;
    }

    startGameIsDisabled() {
        return (this.hasDuplicates() || this.emptyNamesExists());
    }

    hasDuplicates() {
        const names = Array.from(this.vm.players, x => x.name.toLowerCase());
        return (new Set(names)).size !== names.length;
    }

    onlyAIsExists() {
        const types = this.vm.players.map(x => x.type);
        return types.every(type => type === PLAYER_TYPES.AI_NORMAL || type === PLAYER_TYPES.AI_EXPERT);
    }

    emptyNamesExists() {
        const names = this.vm.players.map(x => x.name);
        return names.some(name => name === undefined || name === null || name === '');
    }
}
