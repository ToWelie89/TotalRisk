import {getBestPossibleCombination} from './cardHelpers';
import Card from './card/card';
import {CARD_TYPE} from './card/cardConstants';

describe('cardHelpers', () => {
    let cards = [];

    const generateCards = (types) => {
        cards = [];

        types.forEach(type => {
            cards.push(new Card('test', type, 'test'));
        });
        cards.forEach(card => {
            card.isSelected = true;
        });
    }

    it('getBestPossibleCombination return the best possible combination on the hand', () => {
        // Arrange
        generateCards([CARD_TYPE.CANNON, CARD_TYPE.HORSE, CARD_TYPE.JOKER]);
        // Assert
        expect(getBestPossibleCombination(cards).value).toEqual(10);

        // Arrange
        generateCards([CARD_TYPE.JOKER, CARD_TYPE.HORSE, CARD_TYPE.JOKER]);
        // Assert
        expect(getBestPossibleCombination(cards).value).toEqual(10);

        // Arrange
        generateCards([CARD_TYPE.JOKER, CARD_TYPE.TROOP, CARD_TYPE.HORSE]);
        // Assert
        expect(getBestPossibleCombination(cards).value).toEqual(10);

        // Arrange
        generateCards([CARD_TYPE.JOKER, CARD_TYPE.JOKER, CARD_TYPE.TROOP]);
        // Assert
        expect(getBestPossibleCombination(cards).value).toEqual(10);

        // Arrange
        generateCards([CARD_TYPE.JOKER, CARD_TYPE.JOKER, CARD_TYPE.CANNON]);
        // Assert
        expect(getBestPossibleCombination(cards).value).toEqual(10);

        // Arrange
        generateCards([CARD_TYPE.CANNON, CARD_TYPE.CANNON, CARD_TYPE.TROOP, CARD_TYPE.TROOP, CARD_TYPE.HORSE]);
        // Assert
        expect(getBestPossibleCombination(cards).value).toEqual(10);

        // Arrange
        generateCards([CARD_TYPE.TROOP, CARD_TYPE.TROOP, CARD_TYPE.TROOP, CARD_TYPE.TROOP, CARD_TYPE.HORSE]);
        // Assert
        expect(getBestPossibleCombination(cards).value).toEqual(3);

        // Arrange
        generateCards([CARD_TYPE.TROOP, CARD_TYPE.TROOP, CARD_TYPE.JOKER]);
        // Assert
        expect(getBestPossibleCombination(cards).value).toEqual(3);

        // Arrange
        generateCards([CARD_TYPE.HORSE, CARD_TYPE.HORSE, CARD_TYPE.HORSE, CARD_TYPE.HORSE, CARD_TYPE.TROOP]);
        // Assert
        expect(getBestPossibleCombination(cards).value).toEqual(5);

        // Arrange
        generateCards([CARD_TYPE.HORSE, CARD_TYPE.HORSE, CARD_TYPE.HORSE, CARD_TYPE.JOKER]);
        // Assert
        expect(getBestPossibleCombination(cards).value).toEqual(5);

        // Arrange
        generateCards([CARD_TYPE.HORSE, CARD_TYPE.HORSE, CARD_TYPE.TROOP, CARD_TYPE.TROOP, CARD_TYPE.CANNON]);
        // Assert
        expect(getBestPossibleCombination(cards).value).toEqual(10);

        // Arrange
        generateCards([CARD_TYPE.CANNON, CARD_TYPE.CANNON, CARD_TYPE.CANNON, CARD_TYPE.CANNON, CARD_TYPE.TROOP]);
        // Assert
        expect(getBestPossibleCombination(cards).value).toEqual(7);

        // Arrange
        generateCards([CARD_TYPE.CANNON, CARD_TYPE.CANNON, CARD_TYPE.CANNON, CARD_TYPE.CANNON, CARD_TYPE.JOKER]);
        // Assert
        expect(getBestPossibleCombination(cards).value).toEqual(7);
    });

    it('getBestPossibleCombination return null for invalid combinations', () => {
        // Arrange
        generateCards([CARD_TYPE.TROOP, CARD_TYPE.TROOP, CARD_TYPE.HORSE, CARD_TYPE.HORSE]);
        // Assert
        expect(getBestPossibleCombination(cards)).toEqual(null);

        // Arrange
        generateCards([CARD_TYPE.JOKER, CARD_TYPE.JOKER]);
        // Assert
        expect(getBestPossibleCombination(cards)).toEqual(null);

        // Arrange
        generateCards([CARD_TYPE.CANNON, CARD_TYPE.CANNON]);
        // Assert
        expect(getBestPossibleCombination(cards)).toEqual(null);

        // Arrange
        generateCards([CARD_TYPE.HORSE, CARD_TYPE.HORSE, CARD_TYPE.CANNON]);
        // Assert
        expect(getBestPossibleCombination(cards)).toEqual(null);

        // Arrange
        generateCards([CARD_TYPE.CANNON, CARD_TYPE.CANNON, CARD_TYPE.TROOP]);
        // Assert
        expect(getBestPossibleCombination(cards)).toEqual(null);

        // Arrange
        generateCards([]);
        // Assert
        expect(getBestPossibleCombination(cards)).toEqual(null);

        // Arrange
        generateCards([CARD_TYPE.TROOP]);
        // Assert
        expect(getBestPossibleCombination(cards)).toEqual(null);

        // Arrange
        generateCards([CARD_TYPE.JOKER, CARD_TYPE.CANNON]);
        // Assert
        expect(getBestPossibleCombination(cards)).toEqual(null);
    });

});
