import CardTurnInModalController from './cardTurnInModalController';
import GameEngine from './../gameEngine';
import Card from './../card/card';
import {CARD_TYPE, CARD_COMBINATIONS} from './../card/cardConstants';
import {createUibModalInstance} from './../test/mockHelper';

describe('cardTurnInModalController', () => {
    let cardTurnInModalController;

    let mockUibModalInstance;
    let mockGameEngine;

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

        mockGameEngine = {
            turn: {
                player: {
                    cards: []
                }
            }
        };

        cardTurnInModalController = new CardTurnInModalController({}, mockUibModalInstance, mockGameEngine);
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
        generateCards([CARD_TYPE.HORSE, CARD_TYPE.HORSE, CARD_TYPE.HORSE, CARD_TYPE.HORSE, CARD_TYPE.TROOP]);
        // Assert
        expect(cardTurnInModalController.getBestPossibleCombination().value).toEqual(5);

        // Arrange
        generateCards([CARD_TYPE.CANNON, CARD_TYPE.CANNON, CARD_TYPE.CANNON, CARD_TYPE.CANNON, CARD_TYPE.TROOP]);
        // Assert
        expect(cardTurnInModalController.getBestPossibleCombination().value).toEqual(7);
    });

});
