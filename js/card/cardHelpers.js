const {POSSIBLE_CARD_COMBINATIONS} = require('./../gameConstants');

const getBestPossibleCombination = (cards) => {
    if (cards.length === 0) {
        return null;
    }

    for (let combination of POSSIBLE_CARD_COMBINATIONS) {
        const indexes = [];
        let result = true;
        const cardTypes = cards.map(card => card.cardType);

        combination.combination.forEach(x => {
            const indexOf = cardTypes.indexOf(x);

            if (indexOf !== -1 && !indexes.includes(indexOf)) {
                cardTypes[indexOf] = null;
            } else {
                result = false;
            }
        });

        if (result) {
            return combination;
        }
    }

    return null;
};

module.exports = { getBestPossibleCombination };
