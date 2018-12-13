import GameEngine from './gameEngine';
import { createGameAnnouncerService, createRootScope } from './test/mockHelper';

describe('GameEngine', () => {

    let gameEngine;
    let mockGameAnnouncerService;
    let mockRootScope;

    beforeEach(() => {
        mockGameAnnouncerService = createGameAnnouncerService();
        mockRootScope = createRootScope();
        process.env.NODE_ENV = 'lol';
        delete process.env.COMPUTERNAME;
        gameEngine = new GameEngine(mockGameAnnouncerService, mockRootScope, { playSound: true, musicVolume: 50 });
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
        gameEngine.setMusicVolume(50);
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
        gameEngine.settings.playSound = false;
        gameEngine.toggleSound(false);
        expect(mockGameAnnouncerService.mute).toHaveBeenCalled();
        expect(gameEngine.bgMusic.pause).toHaveBeenCalled();
    });
});
