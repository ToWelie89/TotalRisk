import GameSetupController from './gameSetupController';
import {PLAYER_COLORS, avatars} from './../player/playerConstants';
import {CONSTANTS} from './../gameConstants';
import {createSoundService} from './../test/mockHelper';

describe('gameSetupController', () => {
    let gameSetupController;

    let mockSoundService;

    beforeEach(() => {
        mockSoundService = createSoundService();
        gameSetupController = new GameSetupController({}, mockSoundService);
    });

    it('On construction min and max players should be set', () => {
        // Assert
        expect(gameSetupController.minPlayers).toEqual(CONSTANTS.MIN_NUMBER_OF_PLAYERS);
        expect(gameSetupController.maxPlayers).toEqual(CONSTANTS.MAX_NUMBER_OF_PLAYERS);
    });

    it('Init should set min and max players', () => {
        // Arrange
        gameSetupController.init();
        // Assert
        expect(gameSetupController.players.length).toEqual(CONSTANTS.MIN_NUMBER_OF_PLAYERS);
    });

    it('updateAvatarOfPlayer should update the avatar of a player properly', () => {
        // Arrange
        const newAvatar = Object.keys(avatars).map(key => avatars[key])[3];
        gameSetupController.init();
        gameSetupController.players[0].name = 'Pelle';
        // Act
        gameSetupController.updateAvatarOfPlayer({name: 'Pelle'}, newAvatar);
        // Assert
        expect(gameSetupController.players[0].avatar).toEqual(newAvatar);
        expect(mockSoundService.changeColor.play).toHaveBeenCalled();
    });

    it('updateColorOfPlayer should update the color of a player properly', () => {
        // Arrange
        const newColor = Object.keys(PLAYER_COLORS).map(key => PLAYER_COLORS[key])[3];
        gameSetupController.init();
        gameSetupController.players[0].name = 'Pelle';
        // Act
        gameSetupController.updateAvatarOfPlayer({name: 'Pelle'}, newColor);
        // Assert
        expect(gameSetupController.players[0].avatar).toEqual(newColor);
    });

    it('addPlayer should add player properly', () => {
        // Arrange
        gameSetupController.init();
        // Act
        gameSetupController.addPlayer();
        // Assert
        expect(gameSetupController.players.length).toEqual(3);
        expect(mockSoundService.bleep2.play).toHaveBeenCalled();
    });

    it('addPlayer should not add if max limit is reached', () => {
        // Arrange
        gameSetupController.players = new Array(CONSTANTS.MAX_NUMBER_OF_PLAYERS);
        // Act
        gameSetupController.addPlayer();
        // Assert
        expect(gameSetupController.players.length).toEqual(CONSTANTS.MAX_NUMBER_OF_PLAYERS);
    });

    it('removePlayer should remove player properly', () => {
        // Arrange
        gameSetupController.init();
        const playerToRemove = {name:'Pelle'};
        gameSetupController.players.push(playerToRemove);
        // Act
        gameSetupController.removePlayer(playerToRemove);
        // Assert
        expect(gameSetupController.players.length).toEqual(CONSTANTS.MIN_NUMBER_OF_PLAYERS);
        expect(mockSoundService.remove.play).toHaveBeenCalled();
        expect(gameSetupController.players.find(p => p.name === 'Pelle')).not.toBeDefined();
    });

    it('removePlayer should not remove if number of players is equal to minimum amount', () => {
        // Arrange
        gameSetupController.init();
        gameSetupController.players[0].name = 'Pelle';
        // Act
        gameSetupController.removePlayer(gameSetupController.players[0]);
        // Assert
        expect(gameSetupController.players.length).toEqual(CONSTANTS.MIN_NUMBER_OF_PLAYERS);
        expect(mockSoundService.remove.play).not.toHaveBeenCalled();
        expect(gameSetupController.players.find(p => p.name === 'Pelle')).toBeDefined();
    });

    it('getUnusedColor should return a color not currently used by any players', () => {
        // Arrange
        gameSetupController.init();
        gameSetupController.players[0].color = PLAYER_COLORS.RED;
        gameSetupController.players[1].color = PLAYER_COLORS.GREEN;
        const usedColors = [PLAYER_COLORS.RED, PLAYER_COLORS.GREEN];
        // Act
        const unusedColor = gameSetupController.getUnusedColor();
        // Assert
        expect(usedColors.includes(unusedColor)).toEqual(false);
    });

    it('getUnusedAvatar should return an avatar not currently used by any players', () => {
        // Arrange
        gameSetupController.init();
        gameSetupController.players[0].avatar = Object.keys(avatars).map(key => avatars[key])[0];
        gameSetupController.players[1].avatar = Object.keys(avatars).map(key => avatars[key])[2];
        const usedAvatars = [Object.keys(avatars).map(key => avatars[key])[0],
                            Object.keys(avatars).map(key => avatars[key])[2]];
        // Act
        const unusedAvatar = gameSetupController.getUnusedAvatar();
        // Assert
        expect(usedAvatars.includes(unusedAvatar)).toEqual(false);
    });

    it('getFirstUnusedName should return a name not currently used by any players', () => {
        // Arrange
        gameSetupController.init();
        gameSetupController.players[0].name = Object.keys(avatars).map(key => key)[0];
        gameSetupController.players[1].name = Object.keys(avatars).map(key => key)[3];
        const usedNames = [Object.keys(avatars).map(key => avatars[key])[0],
                           Object.keys(avatars).map(key => avatars[key])[3]];
        // Act
        const unusedNames = gameSetupController.getFirstUnusedName();
        // Assert
        expect(usedNames.includes(unusedNames)).toEqual(false);
    });

    it('hasDuplicates should return false if there are no duplicates of player names', () => {
        // Arrange
        gameSetupController.init();
        // Assert
        expect(gameSetupController.hasDuplicates()).toEqual(false);
    });

    it('hasDuplicates should return true if there are duplicates of player names', () => {
        // Arrange
        gameSetupController.init();
        gameSetupController.players[0].name = 'Pelle';
        gameSetupController.players[1].name = 'Pelle';
        // Assert
        expect(gameSetupController.hasDuplicates()).toEqual(true);
    });

    it('emptyNamesExists should return false if no empty names exists', () => {
        // Arrange
        gameSetupController.init();
        // Assert
        expect(gameSetupController.emptyNamesExists()).toEqual(false);
    });

    it('emptyNamesExists should return true if empty names exists', () => {
        // Arrange
        gameSetupController.init();
        gameSetupController.players[0].name = '';
        // Assert
        expect(gameSetupController.emptyNamesExists()).toEqual(true);
    });
});
