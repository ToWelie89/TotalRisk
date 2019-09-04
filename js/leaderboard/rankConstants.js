const LEAGUES = {
    'Master': {
        procentile: 10,
        icon: './assets/ranks/master.svg'
    },
    'Pro': {
        procentile: 30,
        icon: './assets/ranks/master.svg'
    },
    'Intermediate': {
        procentile: 30,
        icon: './assets/ranks/master.svg'
    },
    'Novice': {
        procentile: 30,
        icon: './assets/ranks/master.svg'
    }
};

const MINIMUM_NUMBER_OF_GAMES_PLAYED_FOR_RANKED = 2;

const MINIMUM_NUMBER_OF_PLAYERS_TO_ENABLE_RANKING = 20;

module.exports = {
    LEAGUES,
    MINIMUM_NUMBER_OF_GAMES_PLAYED_FOR_RANKED,
    MINIMUM_NUMBER_OF_PLAYERS_TO_ENABLE_RANKING
};
