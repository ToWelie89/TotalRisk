import GameModalController from './gameController.js';
import {createUibModal,
        createSoundService,
        createScope,
        createSce,
        createGameEngine,
        createMapService,
        createRootScope,
        createTutorialService,
        createAiHandler,
        createSettings} from './../test/mockHelper';
import Player from './../player/player';
import {PLAYER_TYPES} from './../player/playerConstants';
import {VICTORY_GOALS, TURN_PHASES} from './../gameConstants';

jest.mock('./../helpers');
import {loadSvgIntoDiv} from './../helpers';

loadSvgIntoDiv.mockImplementation((x, y) => {
    jest.fn();
});

jest.mock('chart.js');
import Chart from 'chart.js';
Chart.mockImplementation(function(selector, data) {
    this.data = data;
    this.data.update = jest.fn();
    this.data.destroy = jest.fn();
    return this.data;
});

describe('gameController', () => {
    let gameController;

    let mockGameEngine;
    let mockScope;
    let mockRootScope;
    let mockSce;
    let mockSoundService;
    let mockUibModal;
    let mockMapService;
    let mockTutorialService;
    let mockSettings;
    let mockAiHandler;

    let players = [];

    beforeEach(() => {
        HTMLCanvasElement.prototype.getContext = jest.fn()

        document.querySelectorAll = () => [];

        mockGameEngine = createGameEngine();
        mockSoundService = createSoundService();
        mockUibModal = createUibModal();
        mockScope = createScope();
        mockMapService = createMapService();
        mockRootScope = createRootScope();
        mockSce = createSce();
        mockTutorialService = createTutorialService();
        mockSettings = createSettings();
        mockAiHandler = createAiHandler();

        gameController = new GameModalController(mockScope,
                                                 mockRootScope,
                                                 mockSce,
                                                 mockUibModal,
                                                 {},
                                                 mockGameEngine,
                                                 mockSoundService,
                                                 mockMapService,
                                                 mockTutorialService,
                                                 mockAiHandler,
                                                 mockSettings);
    });

    const initData = () => {
        players = [
            new Player('Julius Caesar', {
                name: 'Red',
                mainColor: 'red'
            }, {
                svg: 'test.svg',
                flag: 'flag.jpg'
            }),
            new Player('Hannibal', {
                name: 'Blue',
                mainColor: 'blue'
            }, {
                svg: 'test.svg',
                flag: 'flag.png'
            })
        ];
        mockGameEngine.turn = {
            player: {
                type: PLAYER_TYPES.HUMAN,
                cards: [],
                name: players[0].name
            },
            turnPhase: TURN_PHASES.DEPLOYMENT
        };
        mockGameEngine.troopsToDeploy = 16;
        mockGameEngine.winningCondition = {
            percentage: 100
        };
        mockGameEngine.updateStandings = jest.fn();
        mockGameEngine.standings = players.map(p => ({ name: p.name, percentageOwned: 20, totalTroops: 15 }));
        const playersMap = new Map();
        players.forEach(player => {
            playersMap.set(player.name, player);
        });
        mockGameEngine.players = playersMap;
    };

    it('startGame with turn presenter turned on', () => {
        // Arrange
        initData();
        gameController.setChartData = jest.fn();
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
        expect(gameController.setChartData).toHaveBeenCalled();
    });

    it('startGame with turn presenter turned off', () => {
        // Arrange
        initData();
        gameController.setChartData = jest.fn();
        mockSettings.showAnnouncer = false;
        // Act
        gameController.startGame(players, VICTORY_GOALS[0]);
        // Assert
        expect(mockGameEngine.startGame).toHaveBeenCalledWith(players, VICTORY_GOALS[0], false);
        expect(mockMapService.updateMap).toHaveBeenCalled();
        expect(gameController.aiTurn).toEqual(false);
        expect(gameController.troopsToDeploy).toEqual(16);
        expect(gameController.setChartData).toHaveBeenCalled();
    });

    it('setChartData sets data correctly', () => {
        // Arrange
        initData();
        gameController.updateChartData = jest.fn();
        // Act
        gameController.setChartData();
        // Assert
        expect(gameController.troopChart.type).toEqual('pie');
        expect(gameController.ownageChart.type).toEqual('pie');

        expect(gameController.troopChart.data.datasets[0].data).toEqual([15, 15]);
        expect(gameController.ownageChart.data.datasets[0].data).toEqual([20, 20]);

        expect(gameController.updateChartData).toHaveBeenCalled();
    });

    it('setChartData should destroy charts first if they are already initialized', () => {
        // Arrange
        initData();
        gameController.updateChartData = jest.fn();
        const destroy = jest.fn();
        gameController.ownageChart = {
            destroy
        };
        gameController.troopChart = {
            destroy
        };
        // Act
        gameController.setChartData();
        // Assert
        expect(destroy).toHaveBeenCalledTimes(2);
    });

    it('updateChartData updates charts correctly', () => {
        // Arrange
        initData();
        mockGameEngine.standings = players.map(p => ({ name: p.name, percentageOwned: 14, totalTroops: 32 }));
        gameController.setChartData();
        // Act
        gameController.updateChartData();
        // Assert
        expect(gameController.troopChart.data.datasets[0].data).toEqual([32, 32]);
        expect(gameController.ownageChart.data.datasets[0].data).toEqual([14, 14]);

        expect(gameController.troopChart.update).toHaveBeenCalled();
        expect(gameController.ownageChart.update).toHaveBeenCalled();

        expect(mockSce.trustAsHtml).toHaveBeenCalledTimes(4);
    });

    it('toArray returns an array correctly', () => {
        // Assert
        expect(gameController.toArray(5).length).toEqual(5);
        expect(typeof gameController.toArray(5)).toEqual('object');
    });

    it('handleVictory handles victory correctly', () => {
        // Arrange
        document.getElementById = id => ({
            innerHTML: 'test',
            appendChild: jest.fn()
        });
        const cssCall = jest.fn();
        window.$ = selector => {
            return  {
                css: (attribute, value) => {
                    cssCall(attribute, value)
                }
            }
        };
        initData();
        mockGameEngine.playerWhoWon = players[0].name;
        // Act
        gameController.handleVictory();
        // Assert
        expect(cssCall).toHaveBeenCalledWith('background-image', `url(${players[0].avatar.flag})`);
        expect(loadSvgIntoDiv).toHaveBeenCalledWith('test.svg', '.victoryPortrait');
    });
});
