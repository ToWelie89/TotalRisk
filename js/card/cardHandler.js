import { worldMap } from './../map/worldMapConfiguration';
import { shuffle } from './../helpers';
import Card from './card';
import { CARD_TYPE } from './cardConstants';

const initiatieCardDeck = () => {
    const cardDeck = [];
    const territories = [];
    worldMap.regions.forEach(region => {
        region.territories.forEach(territory => {
            territories.push(territory);
        });
    });

    const numberOfEachType = (territories.length / 3);
    territories.forEach(territory => {
        if (cardDeck.filter(card => card.cardType === CARD_TYPE.TROOP).length < numberOfEachType || cardDeck.length === 0) {
            cardDeck.push(new Card(territory.name, CARD_TYPE.TROOP));
        } else if (cardDeck.filter(card => card.cardType === CARD_TYPE.HORSE).length < numberOfEachType) {
            cardDeck.push(new Card(territory.name, CARD_TYPE.HORSE));
        } else if (cardDeck.filter(card => card.cardType === CARD_TYPE.CANNON).length < numberOfEachType) {
            cardDeck.push(new Card(territory.name, CARD_TYPE.CANNON));
        }
    });

    cardDeck.push(new Card('', CARD_TYPE.JOKER));
    cardDeck.push(new Card('', CARD_TYPE.JOKER));
    shuffle(cardDeck);
    console.log('Card deck initialized', cardDeck);

    return cardDeck;
};

export {initiatieCardDeck};
