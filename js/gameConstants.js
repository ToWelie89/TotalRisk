import {CARD_TYPE} from './card/cardConstants';

const TURN_PHASES = {
    DEPLOYMENT: 0,
    ATTACK: 1,
    MOVEMENT: 2
};

const GAME_PHASES = {
    PLAYER_SETUP: 0,
    GAME: 1,
    TUTORIAL: 2,
    END_SCREEN: 3
};

const CONSTANTS = {
    MIN_NUMBER_OF_PLAYERS: 2,
    MAX_NUMBER_OF_PLAYERS: 6,
    MIN_REINFORCEMENTS: 3
};

const VICTORY_GOALS = [
    {
        type: 'mapControl',
        percentage: 60,
        requiredAmountOfPlayers: 3
    },
    {
        type: 'mapControl',
        percentage: 70,
        requiredAmountOfPlayers: 3
    },
    {
        type: 'mapControl',
        percentage: 80,
        requiredAmountOfPlayers: 2
    },
    {
        type: 'mapControl',
        percentage: 90,
        requiredAmountOfPlayers: 2
    },
    {
        type: 'mapControl',
        percentage: 100,
        requiredAmountOfPlayers: 2
    },
];

const POSSIBLE_CARD_COMBINATIONS = [
    {combination: [CARD_TYPE.TROOP, CARD_TYPE.HORSE, CARD_TYPE.CANNON], value: 10},
    {combination: [CARD_TYPE.TROOP, CARD_TYPE.HORSE, CARD_TYPE.JOKER], value: 10},
    {combination: [CARD_TYPE.TROOP, CARD_TYPE.CANNON, CARD_TYPE.JOKER], value: 10},
    {combination: [CARD_TYPE.TROOP, CARD_TYPE.JOKER, CARD_TYPE.JOKER], value: 10},
    {combination: [CARD_TYPE.HORSE, CARD_TYPE.JOKER, CARD_TYPE.JOKER], value: 10},
    {combination: [CARD_TYPE.CANNON, CARD_TYPE.JOKER, CARD_TYPE.JOKER], value: 10},
    {combination: [CARD_TYPE.CANNON, CARD_TYPE.HORSE, CARD_TYPE.JOKER], value: 10},
    {combination: [CARD_TYPE.CANNON, CARD_TYPE.CANNON, CARD_TYPE.CANNON], value: 7},
    {combination: [CARD_TYPE.CANNON, CARD_TYPE.CANNON, CARD_TYPE.JOKER], value: 7},
    {combination: [CARD_TYPE.HORSE, CARD_TYPE.HORSE, CARD_TYPE.HORSE], value: 5},
    {combination: [CARD_TYPE.HORSE, CARD_TYPE.HORSE, CARD_TYPE.JOKER], value: 5},
    {combination: [CARD_TYPE.TROOP, CARD_TYPE.TROOP, CARD_TYPE.TROOP], value: 3},
    {combination: [CARD_TYPE.TROOP, CARD_TYPE.TROOP, CARD_TYPE.JOKER], value: 3}
];

const MAIN_MUSIC = './audio/bgmusic.mp3';

const MUSIC_VOLUME_DURING_TUTORIAL = 0.1;

const MUSIC_VOLUME_WHEN_VOICE_IS_SPEAKING = 0.3;

const MAX_CARDS_ON_HAND = 5;

export {TURN_PHASES, GAME_PHASES, CONSTANTS, MAIN_MUSIC, MUSIC_VOLUME_WHEN_VOICE_IS_SPEAKING, MAX_CARDS_ON_HAND, MUSIC_VOLUME_DURING_TUTORIAL, VICTORY_GOALS, POSSIBLE_CARD_COMBINATIONS};
