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
        document.querySelectorAll = () => [];

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
                                                 {},
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
            new Player('Julius Caesar', { name: 'Red', mainColor: 'red '}, 'lol'),
            new Player('Hannibal', { name: 'Blue', mainColor: 'blue '}, 'kek')
        ];
        mockGameEngine.turn = {
            player: {
                type: PLAYER_TYPES.HUMAN,
                cards: []
            },
            turnPhase: TURN_PHASES.DEPLOYMENT
        }
        mockGameEngine.troopsToDeploy = 16;
        mockGameEngine.winningCondition = {
            percentage: 100
        };
        mockGameEngine.standings = players.map(p => ({ name: p.name, percentageOwned: 20 }));
        const playersMap = new Map();
        players.forEach(player => {
            playersMap.set(player.name, player);
        });
        mockGameEngine.players = playersMap;
        mockUibModal.open = (kek) => {
            return {
                result: Promise.resolve()
            }
        };
        // Act
        gameController.startGame(players, VICTORY_GOALS[0]);
        // Assert
        expect(mockGameEngine.startGame).toHaveBeenCalledWith(players, VICTORY_GOALS[0], false);
        expect(mockMapService.updateMap).toHaveBeenCalled();
        expect(gameController.aiTurn).toEqual(false);
        expect(gameController.troopsToDeploy).toEqual(16);
    });

    it('startGame with turn presenter turned off', () => {
        // Arrange
        const players = [
            new Player('Julius Caesar', { name: 'Red', mainColor: 'red '}, 'lol'),
            new Player('Hannibal', { name: 'Blue', mainColor: 'blue '}, 'kek')
        ];
        document.querySelectorAll = () => [];
        mockGameEngine.turn = {
            turnPhase: TURN_PHASES.DEPLOYMENT,
            player: {
                type: PLAYER_TYPES.HUMAN,
                cards: []
            }
        };
        mockGameEngine.winningCondition = {
            percentage: 100
        };
        mockGameEngine.troopsToDeploy = 16;
        mockSettings.showAnnouncer = false;
        mockGameEngine.standings = players.map(p => ({ name: p.name, percentageOwned: 20 }));
        const playersMap = new Map();
        players.forEach(player => {
            playersMap.set(player.name, player);
        });
        mockGameEngine.players = playersMap;
        // Act
        gameController.startGame(players, VICTORY_GOALS[0]);
        // Assert
        expect(mockGameEngine.startGame).toHaveBeenCalledWith(players, VICTORY_GOALS[0], false);
        expect(mockMapService.updateMap).toHaveBeenCalled();
        expect(gameController.aiTurn).toEqual(false);
        expect(gameController.troopsToDeploy).toEqual(16);
    });
});
