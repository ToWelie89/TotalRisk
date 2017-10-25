import CardTurnInModalController from './cardTurnInModalController';
import GameEngine from './../gameEngine';
import Card from './../card/card';
import {CARD_TYPE, CARD_COMBINATIONS} from './../card/cardConstants';
import {createUibModalInstance, createSoundService, createTutorialService} from './../test/mockHelper';

describe('cardTurnInModalController', () => {
    let cardTurnInModalController;

    let mockUibModalInstance;
    let mockSoundService;
    let mockGameEngine;
    let mockTutorialService;

    const generateCards = (types) => {
        cardTurnInModalController.cards = [];

        types.forEach(type => {
            cardTurnInModalController.cards.push(new Card('test', type, 'test'));
        });
        cardTurnInModalController.cards.forEach(card => {
            card.isSelected = true;
        });
    }

    beforeEach(() => {
        mockUibModalInstance = createUibModalInstance();
        mockSoundService = createSoundService();
        mockTutorialService = createTutorialService();

        let mockData = {
            type: 'normal'
        }

        mockGameEngine = {
            turn: {
                player: {
                    cards: []
                },
                turnPhase: 0
            }
        };

        cardTurnInModalController = new CardTurnInModalController({}, mockUibModalInstance, mockGameEngine, mockSoundService, mockTutorialService, mockData);
    });

    it('On construction scope variables should be set correctly', () => {
        // Assert
        expect(cardTurnInModalController.playerMustTurnIn).toEqual(false);
        expect(cardTurnInModalController.possibleCombinations.length).toEqual(13);
    });

    it('illegalCombination returns true if the selected combination is illegal', () => {
        // Arrange
        generateCards([CARD_TYPE.TROOP, CARD_TYPE.HORSE, CARD_TYPE.HORSE]);
        // Assert
        expect(cardTurnInModalController.illegalCombination()).toEqual(true);

        // Arrange
        generateCards([CARD_TYPE.TROOP, CARD_TYPE.CANNON, CARD_TYPE.CANNON]);
        // Assert
        expect(cardTurnInModalController.illegalCombination()).toEqual(true);

        // Arrange
        generateCards([CARD_TYPE.TROOP, CARD_TYPE.HORSE, CARD_TYPE.TROOP]);
        // Assert
        expect(cardTurnInModalController.illegalCombination()).toEqual(true);
    });

    it('illegalCombination returns true if the selected combination is illegal', () => {
        // Arrange
        generateCards([CARD_TYPE.TROOP, CARD_TYPE.HORSE, CARD_TYPE.HORSE]);
        // Assert
        expect(cardTurnInModalController.illegalCombination()).toEqual(true);

        // Arrange
        generateCards([CARD_TYPE.TROOP, CARD_TYPE.CANNON, CARD_TYPE.CANNON]);
        // Assert
        expect(cardTurnInModalController.illegalCombination()).toEqual(true);

        // Arrange
        generateCards([CARD_TYPE.TROOP, CARD_TYPE.HORSE, CARD_TYPE.TROOP]);
        // Assert
        expect(cardTurnInModalController.illegalCombination()).toEqual(true);

        // Arrange
        generateCards([CARD_TYPE.CANNON, CARD_TYPE.CANNON, CARD_TYPE.TROOP]);
        // Assert
        expect(cardTurnInModalController.illegalCombination()).toEqual(true);
    });

    it('getCardCombination return a combination of the combination is legal', () => {
        // Arrange
        generateCards([CARD_TYPE.TROOP, CARD_TYPE.HORSE, CARD_TYPE.CANNON]);
        // Assert
        expect(cardTurnInModalController.getCardCombination().value).toEqual(10);

        // Arrange
        generateCards([CARD_TYPE.CANNON, CARD_TYPE.CANNON, CARD_TYPE.CANNON]);
        // Assert
        expect(cardTurnInModalController.getCardCombination().value).toEqual(7);

        // Arrange
        generateCards([CARD_TYPE.HORSE, CARD_TYPE.HORSE, CARD_TYPE.HORSE]);
        // Assert
        expect(cardTurnInModalController.getCardCombination().value).toEqual(5);

        // Arrange
        generateCards([CARD_TYPE.TROOP, CARD_TYPE.TROOP, CARD_TYPE.TROOP]);
        // Assert
        expect(cardTurnInModalController.getCardCombination().value).toEqual(3);

        // Arrange
        generateCards([CARD_TYPE.CANNON, CARD_TYPE.HORSE, CARD_TYPE.JOKER]);
        // Assert
        expect(cardTurnInModalController.getCardCombination().value).toEqual(10);
    });

    it('getBestPossibleCombination return the best possible combination on the hand', () => {
        // Arrange
        generateCards([CARD_TYPE.CANNON, CARD_TYPE.HORSE, CARD_TYPE.JOKER]);
        // Assert
        expect(cardTurnInModalController.getBestPossibleCombination().value).toEqual(10);

        // Arrange
        generateCards([CARD_TYPE.JOKER, CARD_TYPE.HORSE, CARD_TYPE.JOKER]);
        // Assert
        expect(cardTurnInModalController.getBestPossibleCombination().value).toEqual(10);

        // Arrange
        generateCards([CARD_TYPE.JOKER, CARD_TYPE.TROOP, CARD_TYPE.HORSE]);
        // Assert
        expect(cardTurnInModalController.getBestPossibleCombination().value).toEqual(10);

        // Arrange
        generateCards([CARD_TYPE.JOKER, CARD_TYPE.JOKER, CARD_TYPE.TROOP]);
        // Assert
        expect(cardTurnInModalController.getBestPossibleCombination().value).toEqual(10);

        // Arrange
        generateCards([CARD_TYPE.JOKER, CARD_TYPE.JOKER, CARD_TYPE.CANNON]);
        // Assert
        expect(cardTurnInModalController.getBestPossibleCombination().value).toEqual(10);

        // Arrange
        generateCards([CARD_TYPE.CANNON, CARD_TYPE.CANNON, CARD_TYPE.TROOP, CARD_TYPE.TROOP, CARD_TYPE.HORSE]);
        // Assert
        expect(cardTurnInModalController.getBestPossibleCombination().value).toEqual(10);

        // Arrange
        generateCards([CARD_TYPE.TROOP, CARD_TYPE.TROOP, CARD_TYPE.TROOP, CARD_TYPE.TROOP, CARD_TYPE.HORSE]);
        // Assert
        expect(cardTurnInModalController.getBestPossibleCombination().value).toEqual(3);

        // Arrange
        generateCards([CARD_TYPE.TROOP, CARD_TYPE.TROOP, CARD_TYPE.JOKER]);
        // Assert
        expect(cardTurnInModalController.getBestPossibleCombination().value).toEqual(3);

        // Arrange
        generateCards([CARD_TYPE.HORSE, CARD_TYPE.HORSE, CARD_TYPE.HORSE, CARD_TYPE.HORSE, CARD_TYPE.TROOP]);
        // Assert
        expect(cardTurnInModalController.getBestPossibleCombination().value).toEqual(5);

        // Arrange
        generateCards([CARD_TYPE.HORSE, CARD_TYPE.HORSE, CARD_TYPE.HORSE, CARD_TYPE.JOKER]);
        // Assert
        expect(cardTurnInModalController.getBestPossibleCombination().value).toEqual(5);

        // Arrange
        generateCards([CARD_TYPE.HORSE, CARD_TYPE.HORSE, CARD_TYPE.TROOP, CARD_TYPE.TROOP, CARD_TYPE.CANNON]);
        // Assert
        expect(cardTurnInModalController.getBestPossibleCombination().value).toEqual(10);

        // Arrange
        generateCards([CARD_TYPE.CANNON, CARD_TYPE.CANNON, CARD_TYPE.CANNON, CARD_TYPE.CANNON, CARD_TYPE.TROOP]);
        // Assert
        expect(cardTurnInModalController.getBestPossibleCombination().value).toEqual(7);

        // Arrange
        generateCards([CARD_TYPE.CANNON, CARD_TYPE.CANNON, CARD_TYPE.CANNON, CARD_TYPE.CANNON, CARD_TYPE.JOKER]);
        // Assert
        expect(cardTurnInModalController.getBestPossibleCombination().value).toEqual(7);
    });

    it('getBestPossibleCombination return null for invalid combinations', () => {
        // Arrange
        generateCards([CARD_TYPE.TROOP, CARD_TYPE.TROOP, CARD_TYPE.HORSE, CARD_TYPE.HORSE]);
        // Assert
        expect(cardTurnInModalController.getBestPossibleCombination()).toEqual(null);

        // Arrange
        generateCards([CARD_TYPE.JOKER, CARD_TYPE.JOKER]);
        // Assert
        expect(cardTurnInModalController.getBestPossibleCombination()).toEqual(null);

        // Arrange
        generateCards([CARD_TYPE.CANNON, CARD_TYPE.CANNON]);
        // Assert
        expect(cardTurnInModalController.getBestPossibleCombination()).toEqual(null);

        // Arrange
        generateCards([CARD_TYPE.HORSE, CARD_TYPE.HORSE, CARD_TYPE.CANNON]);
        // Assert
        expect(cardTurnInModalController.getBestPossibleCombination()).toEqual(null);

        // Arrange
        generateCards([CARD_TYPE.CANNON, CARD_TYPE.CANNON, CARD_TYPE.TROOP]);
        // Assert
        expect(cardTurnInModalController.getBestPossibleCombination()).toEqual(null);

        // Arrange
        generateCards([]);
        // Assert
        expect(cardTurnInModalController.getBestPossibleCombination()).toEqual(null);

        // Arrange
        generateCards([CARD_TYPE.TROOP]);
        // Assert
        expect(cardTurnInModalController.getBestPossibleCombination()).toEqual(null);

        // Arrange
        generateCards([CARD_TYPE.JOKER, CARD_TYPE.CANNON]);
        // Assert
        expect(cardTurnInModalController.getBestPossibleCombination()).toEqual(null);
    });

    it('phaseIsDeployment should be true if current turn phase is deployment phase', () => {
        // Assert
        expect(cardTurnInModalController.phaseIsDeployment()).toEqual(true);
    });

    it('phaseIsDeployment should be false if current turn phase is NOT deployment phase', () => {
        // Arrange
        cardTurnInModalController.gameEngine.turn.turnPhase = 1;
        // Assert
        expect(cardTurnInModalController.phaseIsDeployment()).toEqual(false);
    });

    it('toggleCardSelection should toggle card and play sound', () => {
        // Arrange
        generateCards([CARD_TYPE.CANNON, CARD_TYPE.CANNON, CARD_TYPE.TROOP]);
        // Act
        cardTurnInModalController.toggleCardSelection(cardTurnInModalController.cards[0]);
        // Assert
        expect(cardTurnInModalController.cards[0].isSelected).toEqual(false);
        expect(mockSoundService.cardSelect.play).toHaveBeenCalled();
    });

    it('autoSelect should select the best possible combination, turn in cards and close modal', () => {
        // Arrange
        generateCards([CARD_TYPE.CANNON, CARD_TYPE.HORSE, CARD_TYPE.TROOP]);
        // Act
        cardTurnInModalController.autoSelect();
        // Assert
        expect(cardTurnInModalController.gameEngine.turn.player.cards.length).toEqual(0);
        expect(mockUibModalInstance.close).toHaveBeenCalledWith({
            newTroops: cardTurnInModalController.getCardCombination().value
        });
    });

    it('autoSelect should not do anything if there are no possible combinations on hand', () => {
        // Arrange
        generateCards([CARD_TYPE.CANNON, CARD_TYPE.TROOP, CARD_TYPE.TROOP]);
        cardTurnInModalController.gameEngine.turn.player.cards = cardTurnInModalController.cards;
        // Act
        cardTurnInModalController.autoSelect();
        // Assert
        expect(cardTurnInModalController.gameEngine.turn.player.cards.length).toEqual(3); // still same
        expect(mockUibModalInstance.close).not.toHaveBeenCalled();
    });

    it('cancel should close modal', () => {
        // Act
        cardTurnInModalController.cancel();
        // Assert
        expect(mockUibModalInstance.close).toHaveBeenCalled();
    });

});
