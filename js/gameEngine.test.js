import GameEngine from './gameEngine';
import { createGameAnnouncerService, createRootScope } from './test/mockHelper';

describe('GameEngine', () => {

    let gameEngine;
    let mockGameAnnouncerService;
    let mockRootScope;

    beforeEach(() => {
        mockGameAnnouncerService = createGameAnnouncerService();
        mockRootScope = createRootScope();
        gameEngine = new GameEngine(mockGameAnnouncerService, mockRootScope);
    });

    it('constructor - sets up gameEngine correctly', () => {
        expect(gameEngine.filter).toEqual('byOwner');
        expect(gameEngine.selectedTerritory).toEqual(undefined);
        expect(gameEngine.isTutorialMode).toEqual(false);
    });

    it('setMusicVolume - sets music volume correctly', () => {
        gameEngine.bgMusic = {
            volume: 0.1
        };
        gameEngine.setMusicVolume(0.5);
        expect(gameEngine.bgMusic.volume).toEqual(0.5);
    });

    it('toggleSound - toggles sound to on, start playing background music', () => {
        gameEngine.setMusic = jest.fn()
        gameEngine.toggleSound(true);
        expect(gameEngine.setMusic).toHaveBeenCalled();
    });

    it('toggleSound - toggles sound to off, mute announcer and pause music', () => {
        gameEngine.bgMusic = {
            pause: jest.fn()
        };
        gameEngine.toggleSound(false);
        expect(mockGameAnnouncerService.mute).toHaveBeenCalled();
        expect(gameEngine.bgMusic.pause).toHaveBeenCalled();
    });
});
