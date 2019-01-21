import AttackModalController from './attackModalController';
import {createUibModalInstance, createSoundService, createScope, createRootScope, createTutorialService, createSocketService} from './../test/mockHelper';
import Territory from './../map/territory';
import { worldMap } from './../map/worldMapConfiguration';
import Player from './../player/player';
import {PLAYER_COLORS, avatars} from './../player/playerConstants';
import {arraysEqual, delay} from './../helpers';

describe('attackModalController', () => {
    let attackModalController;
    let territory1;
    let territory2;
    let player1;
    let player2;

    let mockScope;
    let mockRootScope;
    let mockSoundService;
    let mockUibModalInstance;
    let mockTutorialService;
    let mockSocketService;

    let mockAttackData;

    beforeEach(() => {
        territory1 = new Territory(worldMap.regions[0].territories[0]); // North Africa
        territory1.owner = 'Pelle'; // Defender

        territory2 = new Territory(worldMap.regions[0].territories[1]); // Egypt
        territory2.owner = 'Kalle'; // Attacker

        player1 = new Player('Pelle', PLAYER_COLORS.RED, avatars['Julius Caesar']);
        player2 = new Player('Kalle', PLAYER_COLORS.GREEN, avatars['Napoleon Bonaparte']);

        mockAttackData = {
            territoryAttacked: territory1,
            attackFrom: territory2,
            attacker: 'Kalle',
            defender: 'Pelle'
        }

        mockSoundService = createSoundService();
        mockUibModalInstance = createUibModalInstance();
        mockScope = createScope();
        mockRootScope = createRootScope();
        mockTutorialService = createTutorialService();
        mockSocketService = createSocketService();

        attackModalController = new AttackModalController(mockScope, mockRootScope, mockUibModalInstance, mockSoundService, mockTutorialService, mockAttackData, mockSocketService);
        //attackModalController.runTutorial = jest.fn();

        // Remove delays so that tests run faster
        attackModalController.getCountrySvgDelay = 0;
        attackModalController.moveTroopsDelay = 0;
        attackModalController.closeModalDelay = 0;
        attackModalController.startShakeAnimationDelay = 0;
        attackModalController.stopShakeAnimationDelay = 0;
        attackModalController.tutorialDelayAfterStartAttack = 0;

        // Mock dice boxes
        let dice_box = function(container, dimensions) {
        }
        dice_box.prototype.throw = function(diceRolls, after_roll, context) {
            after_roll([], context);
        }
        attackModalController.attacker_box = new dice_box('container', { w: 500, h: 300 });
        attackModalController.defender_box = new dice_box('container', { w: 500, h: 300 });

        window.$ = selector => {
            return {
                html: jest.fn(),
                addClass: jest.fn(),
                removeClass: jest.fn(),
                animate: (stuff, delay, callback = undefined) => {
                    if (callback) {
                        callback();
                    }
                },
                clone: () => {
                    return {
                        clone: jest.fn(),
                        removeClass: jest.fn()
                    }
                }
            }
        };
        document.getElementById = selector => {
            return {
                getBBox: () => {
                    return {
                        x: 1,
                        y: 2,
                        width: 3,
                        height: 4
                    }
                },
                setAttribute: jest.fn()
            }
        };
    });

    it('On construction scope variables should be set correctly', async () => {
        // Assert
        expect(attackModalController.defender).toEqual(territory1);
        expect(attackModalController.attacker).toEqual(territory2);
        expect(attackModalController.attackerDice).toEqual([]);
        expect(attackModalController.defenderDice).toEqual([]);
        expect(attackModalController.fightIsOver).toEqual(false);
        expect(attackModalController.showMoveTroops).toEqual(false);
        expect(attackModalController.disableButtons).toEqual(false);
        expect(attackModalController.moveNumberOfTroops).toEqual(1);
        expect(attackModalController.movementSliderOptions).toEqual({});
        expect(attackModalController.countrySvg).toEqual('');

        attackModalController.getCountrySvg = jest.fn();
        window.dice_box = jest.fn();
        window.dice_box.mockImplementation(function(canvas, dimensions, options) {
            this.canvas = canvas;
            this.dimensions = dimensions;
            this.options = options;
            return this;
        });

        document.getElementById = () => 'kek';

        await delay(600);

        expect(attackModalController.getCountrySvg).toHaveBeenCalledWith('North Africa');
        expect(dice_box).toHaveBeenCalledWith('kek', { w: 440, h: 200 }, { dice_color: '#6b0a05' });
        expect(dice_box).toHaveBeenCalledWith('kek', { w: 440, h: 200 }, { dice_color: '#061a7f' });
    });

    it('On construction tutorial mode should be run if the tutorial flag is true', async () => {
        // Arrange
        mockAttackData.tutorialMode = true;
        attackModalController = new AttackModalController(mockScope, mockRootScope, mockUibModalInstance, mockSoundService, mockTutorialService, mockAttackData, {});
        attackModalController.runTutorial = jest.fn();

        attackModalController.getCountrySvg = jest.fn();
        window.dice_box = jest.fn();
        window.dice_box.mockImplementation(function(canvas, dimensions, options) {
            this.canvas = canvas;
            this.dimensions = dimensions;
            this.options = options;
            return this;
        });

        await delay(600);

        // Assert
        expect(attackModalController.runTutorial).toHaveBeenCalled();
        expect(attackModalController.tutorial).toEqual(true);
    });

    it('closeModal should call close modal correctly', () => {
        // Act
        attackModalController.closeModal(true);
        // Assert
        expect(mockUibModalInstance.close).toHaveBeenCalledWith({
            attackFrom: territory2,
            attackTo: territory1,
            battleWasWon: true,
            previousOwner: undefined,
            retreat: false,
            attackerTotalCasualites: 0,
            defenderTotalCasualites: 0
        });
    });

    it('moveTroops set troop numbers correctly', () => {
        // Arrange
        attackModalController.attacker.numberOfTroops = 3;
        attackModalController.defender.numberOfTroops = 0;
        attackModalController.moveNumberOfTroops = 1;
        // Act
        attackModalController.moveTroops();
        // Assert
        expect(attackModalController.attacker.owner).toEqual('Kalle');
        expect(attackModalController.defender.owner).toEqual('Kalle');
        expect(attackModalController.attacker.numberOfTroops).toEqual(3);
        expect(attackModalController.defender.numberOfTroops).toEqual(1);
        expect(mockUibModalInstance.close).toHaveBeenCalledWith({
            attackFrom: territory2,
            attackTo: territory1,
            battleWasWon: true,
            previousOwner: 'Pelle',
            retreat: false,
            attackerTotalCasualites: 0,
            defenderTotalCasualites: 0
        });
    });

    it('moveTroops set troop numbers correctly again', () => {
        // Arrange
        attackModalController.attacker.numberOfTroops = 5;
        attackModalController.defender.numberOfTroops = 0;
        attackModalController.moveNumberOfTroops = 5;
        // Act
        attackModalController.moveTroops();
        // Assert
        expect(attackModalController.attacker.owner).toEqual('Kalle');
        expect(attackModalController.defender.owner).toEqual('Kalle');
        expect(attackModalController.attacker.numberOfTroops).toEqual(1);
        expect(attackModalController.defender.numberOfTroops).toEqual(5);
        expect(mockUibModalInstance.close).toHaveBeenCalledWith({
            attackFrom: territory2,
            attackTo: territory1,
            battleWasWon: true,
            previousOwner: 'Pelle',
            retreat: false,
            attackerTotalCasualites: 0,
            defenderTotalCasualites: 0
        });
    });

    it('fight where attacker wins and is issued to move troops', () => {
        // Arrange
        attackModalController.attacker.numberOfTroops = 5;
        attackModalController.defender.numberOfTroops = 2;

        territory2.numberOfTroops = 5;
        territory1.numberOfTroops = 0;

        attackModalController.battleHandler.handleAttack = (x, y) => { // Mock handle attack result
            return {
                attackDice: [6, 5, 4],
                defendDice: [4, 3],
                attacker: territory2,
                defender: territory1,
                defenderCasualties: 2,
                attackerCasualties: 0
            }
        };
        // Act
        attackModalController.fight();
        // Assert
        expect(mockSoundService.screamSound.play).toHaveBeenCalled();
        expect(mockSoundService.cheer.play).toHaveBeenCalled();
        expect(attackModalController.fightIsOver).toEqual(true);
        expect(attackModalController.showMoveTroops).toEqual(true);
        expect(mockScope.$apply).toHaveBeenCalled();
    });

    it('fight where defender wins', async () => {
        // Arrange
        attackModalController.attacker.numberOfTroops = 2;
        attackModalController.defender.numberOfTroops = 3;

        territory2.numberOfTroops = 0;
        territory1.numberOfTroops = 3;

        attackModalController.battleHandler.handleAttack = (x, y) => { // Mock handle attack result
            return {
                attackDice: [3, 2, 3],
                defendDice: [6, 5],
                attacker: territory2,
                defender: territory1,
                defenderCasualties: 0,
                attackerCasualties: 2
            }
        };
        // Act
        attackModalController.fight();
        // Assert
        expect(mockSoundService.screamSound.play).toHaveBeenCalled();
        expect(mockSoundService.cheer.play).not.toHaveBeenCalled();
        expect(attackModalController.fightIsOver).toEqual(true);
        expect(attackModalController.attacker.numberOfTroops).toEqual(0);

        await delay(100);

        expect(mockUibModalInstance.close).toHaveBeenCalledWith({
            attackFrom: territory2,
            attackTo: territory1,
            battleWasWon: false,
            previousOwner: undefined,
            retreat: false,
            attackerTotalCasualites: 2,
            defenderTotalCasualites: 0
        });
    });

    it('fight where neither player wins just yet', () => {
        // Arrange
        attackModalController.attacker.numberOfTroops = 6;
        attackModalController.defender.numberOfTroops = 6;

        territory2.numberOfTroops = 0;
        territory1.numberOfTroops = 3;

        attackModalController.battleHandler.handleAttack = (x, y) => { // Mock handle attack result
            return {
                attackDice: [5, 3, 1],
                defendDice: [6, 2],
                attacker: territory2,
                defender: territory1,
                defenderCasualties: 1,
                attackerCasualties: 1
            }
        };
        // Act
        attackModalController.fight();
        // Assert
        expect(mockSoundService.cheer.play).not.toHaveBeenCalled();
    });

    it('retreat should close modal', () => {
        // Act
        attackModalController.retreat();
        // Assert
        expect(mockUibModalInstance.close).toHaveBeenCalledWith({
            attackFrom: territory2,
            attackTo: territory1,
            battleWasWon: false,
            previousOwner: undefined,
            retreat: true,
            attackerTotalCasualites: 0,
            defenderTotalCasualites: 0
        });
    });

    it('convertTroopAmountToTroopTypes should convert number of troops to correct unit types', () => {
        // Assert
        expect(arraysEqual(attackModalController.convertTroopAmountToTroopTypes(0).sort(), [])).toEqual(true);
        expect(arraysEqual(attackModalController.convertTroopAmountToTroopTypes(3).sort(), ['troop', 'troop','troop'].sort())).toEqual(true);
        expect(arraysEqual(attackModalController.convertTroopAmountToTroopTypes(5).sort(), ['horse'])).toEqual(true);
        expect(arraysEqual(attackModalController.convertTroopAmountToTroopTypes(7).sort(), ['troop', 'troop', 'horse'].sort())).toEqual(true);
        expect(arraysEqual(attackModalController.convertTroopAmountToTroopTypes(9).sort(), ['troop', 'troop', 'horse', 'troop', 'troop'].sort())).toEqual(true);
        expect(arraysEqual(attackModalController.convertTroopAmountToTroopTypes(10).sort(), ['cannon'].sort())).toEqual(true);
        expect(arraysEqual(attackModalController.convertTroopAmountToTroopTypes(15).sort(), ['cannon', 'horse'].sort())).toEqual(true);
        expect(arraysEqual(attackModalController.convertTroopAmountToTroopTypes(20).sort(), ['cannon', 'cannon'].sort())).toEqual(true);
    });

    it('getAsArray should return an array of empty objects with same lengt as input', () => {
        // Assert
        expect(attackModalController.getAsArray(5).length).toEqual(5);
    });

    it('runTutorial should run all steps in attack tutorial', async () => {
        // Arrange
        const attackData = { test: 'lol' };
        attackModalController.fight = jest.fn();
        attackModalController.attackData = attackData;
        // Act
        attackModalController.runTutorial();
        // Assert
        expect(mockTutorialService.initTutorialData).toHaveBeenCalled();
        expect(mockTutorialService.attackModalExplanation).toHaveBeenCalled();
        await delay(50);
        expect(mockTutorialService.attackModalFightExplanation).toHaveBeenCalled();
        expect(mockTutorialService.attackModalRetreatExplanation).toHaveBeenCalled();
        expect(mockTutorialService.startAttack).toHaveBeenCalledWith(attackData);

        //expect(mockTutorialService.afterAttack).toHaveBeenCalled();
        //expect(mockTutorialService.afterAttack2).toHaveBeenCalled();
        //expect(mockTutorialService.moveAfterAttackExplanation).toHaveBeenCalled();
    });

    it('battleFought will emit data about a battle to the backend via socketservice', () => {
        // Arrange
        attackModalController.multiplayerMode = true;
        // Act
        attackModalController.battleFought(2, 1, 10, 5);
        // Assert
        expect(mockSocketService.gameSocket.emit).toHaveBeenCalledWith('battleFought', {
            attackerCasualties: 2,
            defenderCasualties: 1,
            attackerNumberOfTroops: 11,
            defenderNumberOfTroops: 5,
            defenderTerritory: 'North Africa',
            attackerTerritory: 'Egypt'
        });
    });

    it('blitzFight queue up several battles in succession', async () => {
        // Arrange
        attackModalController.startShakeAnimationDelay = 50;

        const initAttackerTroops = 5;
        const initDefenderTroops = 4;

        attackModalController.attacker.numberOfTroops = initAttackerTroops;
        attackModalController.defender.numberOfTroops = initDefenderTroops;

        territory2.numberOfTroops = initAttackerTroops;
        territory1.numberOfTroops = initDefenderTroops;

        const attackerCasualties = 0;
        const defenderCasualties = 2;

        const attackHandled = jest.fn();

        attackModalController.battleHandler.handleAttack = (x, y) => { // Mock handle attack result
            attackHandled();

            territory2.numberOfTroops = territory2.numberOfTroops - attackerCasualties;
            territory1.numberOfTroops = territory1.numberOfTroops - defenderCasualties;

            return {
                attackDice: [6, 5, 4],
                defendDice: [4, 3],
                attacker: territory2,
                defender: territory1,
                defenderCasualties,
                attackerCasualties
            };
        };
        // Act
        attackModalController.blitzFight();

        // Assert
        expect(attackModalController.isBlitzFight).toEqual(true);

        await delay(500);

        expect(attackHandled).toHaveBeenCalledTimes(2);
        expect(attackModalController.isBlitzFight).toEqual(false);
        expect(mockSoundService.diceRoll.play).toHaveBeenCalledTimes(2);
    });
});
