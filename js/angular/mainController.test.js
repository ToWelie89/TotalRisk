import AttackModalController from './mainController.js';
import {createUibModal, createSoundService, createScope, createGameEngine, createMapService} from './../test/mockHelper';
import Player from './../player/player';

describe('mainController', () => {
    let mainController;

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

        mainController = new AttackModalController(mockScope, mockUibModal, mockGameEngine, mockSoundService, mockMapService);
    });

    it('toggleMusicVolume should mute sound and toggle game engine', () => {
        // Act
        mainController.toggleMusicVolume();
        // Assert
        expect(mainController.playSound).toEqual(false);
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
        mainController.startGame(players);
        // Assert
        expect(mockGameEngine.startGame).toHaveBeenCalledWith(players);
        expect(mockMapService.updateMap).toHaveBeenCalled();
    });
});
