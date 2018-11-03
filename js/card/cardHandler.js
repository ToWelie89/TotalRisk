const { worldMap } = require('./../map/worldMapConfiguration');
const { shuffle } = require('./../helpers');
const Card = require('./card');
const { CARD_TYPE } = require('./cardConstants');

const initiatieCardDeck = () => {
    const cardDeck = [];
    const territories = [];
    worldMap.regions.forEach(region => {
        region.territories.forEach(territory => {
            territories.push({
                name: territory.name,
                regionName: region.name.toUpperCase()
            });
        });
    });

    const numberOfEachType = (territories.length / 3);
    territories.forEach(territory => {
        if (cardDeck.filter(card => card.cardType === CARD_TYPE.TROOP).length < numberOfEachType || cardDeck.length === 0) {
            cardDeck.push(new Card(territory.name, CARD_TYPE.TROOP, territory.regionName));
        } else if (cardDeck.filter(card => card.cardType === CARD_TYPE.HORSE).length < numberOfEachType) {
            cardDeck.push(new Card(territory.name, CARD_TYPE.HORSE, territory.regionName));
        } else if (cardDeck.filter(card => card.cardType === CARD_TYPE.CANNON).length < numberOfEachType) {
            cardDeck.push(new Card(territory.name, CARD_TYPE.CANNON, territory.regionName));
        }
    });

    cardDeck.push(new Card('', CARD_TYPE.JOKER));
    cardDeck.push(new Card('', CARD_TYPE.JOKER));
    shuffle(cardDeck);
    console.log('Card deck initialized', cardDeck);

    return cardDeck;
};

module.exports = { initiatieCardDeck };
