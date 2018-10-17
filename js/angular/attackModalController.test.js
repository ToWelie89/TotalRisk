import AttackModalController from './attackModalController';
import {createUibModalInstance, createSoundService, createScope, createRootScope, createTutorialService} from './../test/mockHelper';
import Territory from './../map/territory';
import { worldMap } from './../map/worldMapConfiguration';
import Player from './../player/player';
import {PLAYER_COLORS, avatars} from './../player/playerConstants';
import {arraysEqual} from './../helpers';

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

    beforeEach(() => {
        territory1 = new Territory(worldMap.regions[0].territories[0]); // North Africa
        territory1.owner = 'Pelle'; // Defender

        territory2 = new Territory(worldMap.regions[0].territories[1]); // Egypt
        territory2.owner = 'Kalle'; // Attacker

        player1 = new Player('Pelle', PLAYER_COLORS.RED, avatars['Julius Caesar']);
        player2 = new Player('Kalle', PLAYER_COLORS.GREEN, avatars['Napoleon Bonaparte']);

        let mockAttackData = {
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

        attackModalController = new AttackModalController(mockScope, mockRootScope, mockUibModalInstance, mockSoundService, mockTutorialService, mockAttackData);

        // Remove delays so that tests run faster
        attackModalController.getCountrySvgDelay = 0;
        attackModalController.moveTroopsDelay = 0;
        attackModalController.closeModalDelay = 0;
        attackModalController.startShakeAnimationDelay = 0;
        attackModalController.stopShakeAnimationDelay = 0;

        // Mock dice boxes
        const dice_box = function(container, dimentions) {
        }
        dice_box.prototype.throw = function(diceRolls, after_roll, context) {
            after_roll.call({}, [], context);
        }
        attackModalController.attacker_box = new dice_box('container', { w: 500, h: 300 });
        attackModalController.defender_box = new dice_box('container', { w: 500, h: 300 });
    });

    it('On construction scope variables should be set correctly', () => {
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

    it('fight where defender wins', () => {
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

        //jasmine.clock().tick(10); // Insert small delay to account for setTimeout (even though the delay is set to 0ms)

        setTimeout(() => {
            expect(mockUibModalInstance.close).toHaveBeenCalledWith({
                attackFrom: territory2,
                attackTo: territory1,
                battleWasWon: false,
                previousOwner: undefined,
                retreat: false,
                attackerTotalCasualites: 2,
                defenderTotalCasualites: 0
            });
        }, 100);
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
});
