import GameModalController from './gameController.js';
import {createUibModal, createSoundService, createScope, createGameEngine, createMapService} from './../test/mockHelper';
import Player from './../player/player';

describe('gameController', () => {
    let gameController;

    let mockGameEngine;
    let mockScope;
    let mockSoundService;
    let mockUibModal;
    let mockMapService;

    beforeEach(() => {
        mockGameEngine = createGameEngine();
        mockSoundService = createSoundService();
        mockUibModal = createUibModal();
        mockScope = createScope();
        mockMapService = createMapService();

        gameController = new GameModalController(mockScope, mockUibModal, mockGameEngine, mockSoundService, mockMapService);
    });

    it('toggleMusicVolume should mute sound and toggle game engine', () => {
        // Act
        gameController.toggleMusicVolume();
        // Assert
        expect(gameController.playSound).toEqual(false);
        expect(mockGameEngine.toggleSound).toHaveBeenCalledWith(false);
    });

    xit('startGame', () => {
        // Arrange
        const players = [
            new Player('Julius Caesar', 'red', 'lol'),
            new Player('Hannibal', 'blue', 'kek')
        ];
        document.querySelectorAll = () => [];

        // Need to find fix to test this async call
        mockUibModal.open = (kek) => {
            return {
                result: new Promise((resolve, reject) => {
                    resolve();
                })
            }
        };
        // Act
        gameController.startGame(players);
        // Assert
        expect(mockGameEngine.startGame).toHaveBeenCalledWith(players);
        expect(mockMapService.updateMap).toHaveBeenCalled();
    });
});
