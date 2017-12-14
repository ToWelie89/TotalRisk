import GameModalController from './gameController.js';
import {createUibModal,
        createSoundService,
        createScope,
        createGameEngine,
        createMapService,
        createRootScope,
        createTutorialService,
        createAiHandler,
        createSettings} from './../test/mockHelper';
import Player from './../player/player';
import {PLAYER_TYPES} from './../player/playerConstants';
import {VICTORY_GOALS, TURN_PHASES} from './../gameConstants';

describe('gameController', () => {
    let gameController;

    let mockGameEngine;
    let mockScope;
    let mockRootScope;
    let mockSoundService;
    let mockUibModal;
    let mockMapService;
    let mockTutorialService;
    let mockSettings;
    let mockAiHandler;

    beforeEach(() => {
        mockGameEngine = createGameEngine();
        mockSoundService = createSoundService();
        mockUibModal = createUibModal();
        mockScope = createScope();
        mockMapService = createMapService();
        mockRootScope = createRootScope();
        mockTutorialService = createTutorialService();
        mockSettings = createSettings();
        mockAiHandler = createAiHandler();

        gameController = new GameModalController(mockScope,
                                                 mockRootScope,
                                                 mockUibModal,
                                                 {},
                                                 mockGameEngine,
                                                 mockSoundService,
                                                 mockMapService,
                                                 mockTutorialService,
                                                 mockAiHandler,
                                                 mockSettings);
    });

    it('startGame with turn presenter turned on', () => {
        // Arrange
        const players = [
            new Player('Julius Caesar', 'red', 'lol'),
            new Player('Hannibal', 'blue', 'kek')
        ];
        document.querySelectorAll = () => [];
        mockGameEngine.turn = {
            player: {
                type: PLAYER_TYPES.HUMAN
            },
            turnPhase: TURN_PHASES.DEPLOYMENT
        }
        mockGameEngine.troopsToDeploy = 16;
        mockUibModal.open = (kek) => {
            return {
                result: Promise.resolve()
            }
        };
        // Act
        gameController.startGame(players, VICTORY_GOALS[0]);
        // Assert
        expect(mockGameEngine.startGame).toHaveBeenCalledWith(players, VICTORY_GOALS[0]);
        expect(mockMapService.updateMap).toHaveBeenCalled();
        expect(gameController.aiTurn).toEqual(false);
        expect(gameController.troopsToDeploy).toEqual(16);
    });

    it('startGame with turn presenter turned off', () => {
        // Arrange
        const players = [
            new Player('Julius Caesar', 'red', 'lol'),
            new Player('Hannibal', 'blue', 'kek')
        ];
        document.querySelectorAll = () => [];
        mockGameEngine.turn = {
            turnPhase: TURN_PHASES.DEPLOYMENT,
            player: {
                type: PLAYER_TYPES.HUMAN,
                cards: []
            }
        }
        mockGameEngine.troopsToDeploy = 16;
        mockSettings.showAnnouncer = false;
        // Act
        gameController.startGame(players, VICTORY_GOALS[0]);
        // Assert
        expect(mockGameEngine.startGame).toHaveBeenCalledWith(players, VICTORY_GOALS[0]);
        expect(mockMapService.updateMap).toHaveBeenCalled();
        expect(gameController.aiTurn).toEqual(false);
        expect(gameController.troopsToDeploy).toEqual(16);
    });
});
