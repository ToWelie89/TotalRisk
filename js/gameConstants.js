const { CARD_TYPE } = require('./card/cardConstants');

const TURN_PHASES = {
    DEPLOYMENT: 0,
    ATTACK: 1,
    MOVEMENT: 2
};

const PAUSE_MODES = {
    NOT_PAUSED: 0,
    PAUSING: 1,
    PAUSED: 2
}

const GAME_PHASES = {
    MAIN_MENU: 0,
    SETTINGS: 1,
    PLAYER_SETUP: 2,
    GAME: 3,
    AI_TESTING: 4,
    TUTORIAL: 5,
    END_SCREEN: 6,
    CHARACTER_CREATOR: 7,
    PLAYER_SETUP_MULTIPLAYER: 8,
    MULTIPLAYER_LOBBIES: 9,
    GAME_MULTIPLAYER: 10,
    END_SCREEN_MULTIPLAYER: 11
};

const MAPS = {
    WORLD_MAP: {
        mainMap: './assets/maps/worldMap/worldMap.svg',
        previewMap: './assets/maps/worldMap/worldMapPreview.svg',
        name: 'Classic world map'
    }
}

const CONSTANTS = {
    MIN_NUMBER_OF_PLAYERS: 2,
    MAX_NUMBER_OF_PLAYERS: 6,
    MIN_REINFORCEMENTS: 3
};

const VICTORY_GOALS = [
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

const MAIN_MUSIC = './audio/bgmusic3.mp3';

const AI_MUSIC = './audio/bgmusic2.mp3';

const ATTACK_MUSIC = './audio/attackMusic.mp3';

const IN_GAME_MUSIC = './audio/ingameMusic.mp3';

const VICTORY_MUSIC = './audio/victory.mp3';

const MUSIC_VOLUME_DURING_TUTORIAL = 10;

const MUSIC_VOLUME_WHEN_VOICE_IS_SPEAKING = 30;

const MAX_CARDS_ON_HAND = 5;

module.exports = {
    TURN_PHASES,
    GAME_PHASES,
    CONSTANTS,
    MAIN_MUSIC,
    AI_MUSIC,
    ATTACK_MUSIC,
    VICTORY_MUSIC,
    IN_GAME_MUSIC,
    MUSIC_VOLUME_WHEN_VOICE_IS_SPEAKING,
    MAX_CARDS_ON_HAND,
    MUSIC_VOLUME_DURING_TUTORIAL,
    VICTORY_GOALS,
    POSSIBLE_CARD_COMBINATIONS,
    PAUSE_MODES,
    MAPS
};
