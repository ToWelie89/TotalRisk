const { createLeader, STANCES, FACTIONS, SPECIAL_RULES } = require('./../scenarioConstants');
const { GAME_PHASES } = require('./../../gameConstants');

const THEODEN = createLeader('Theodén', './assets/avatarBackgrounds/lotr/theoden.png');
const DENETHOR = createLeader('Denethor II', './assets/avatarBackgrounds/lotr/denethor.png');
const SAURON = createLeader('Sauron', './assets/avatarBackgrounds/lotr/sauron.png');
const SARUMAN = createLeader('Saruman', './assets/avatarBackgrounds/lotr/saruman.png');

const WAR_OF_THE_RING_SCENARIO = {
    id: 'WAR_OF_THE_RING',
    disabled: true,
    displayName: 'War of the one ring',
    setupPhase: GAME_PHASES.PLAYER_SETUP,
    map: 'middleEarth.svg',
    background: 'assets/scenarios/warofthering.jpg',
    description: 'Play either as the forces of good or evil in the battle for Middle Earth.',
    specialRules: [
        SPECIAL_RULES.ALLIES,
        SPECIAL_RULES.FORTS,
        SPECIAL_RULES.CAPITALS,
        SPECIAL_RULES.HEROES,
    ],
    factions: [
        FACTIONS.NONE,
        FACTIONS.FORCES_OF_SAURON,
        FACTIONS.FREE_PEOPLES_OF_MIDDLE_EARTH
    ],
    playableCountries: [
        { name: 'Rohan', stance: STANCES.AT_WAR, faction: FACTIONS.FREE_PEOPLES_OF_MIDDLE_EARTH, LEADER: THEODEN },
        { name: 'Gondor', stance: STANCES.AT_WAR, faction: FACTIONS.FREE_PEOPLES_OF_MIDDLE_EARTH, LEADER: DENETHOR },
        { name: 'Mordor', stance: STANCES.AT_WAR, faction: FACTIONS.FORCES_OF_SAURON, LEADER: SAURON },
        { name: 'Isengard', stance: STANCES.AT_WAR, faction: FACTIONS.FORCES_OF_SAURON, LEADER: SARUMAN }
    ],
    nonPlayableCountries: [
        { name: 'Shire', stance: STANCES.AT_WAR, faction: FACTIONS.FREE_PEOPLES_OF_MIDDLE_EARTH },
        { name: 'Rivendell', stance: STANCES.AT_WAR, faction: FACTIONS.FREE_PEOPLES_OF_MIDDLE_EARTH },
        { name: 'Khand', stance: STANCES.AT_WAR, faction: FACTIONS.FORCES_OF_SAURON },
        { name: 'Harad', stance: STANCES.AT_WAR, faction: FACTIONS.FORCES_OF_SAURON },
        { name: 'Rhun', stance: STANCES.AT_WAR, faction: FACTIONS.FORCES_OF_SAURON }
    ]
};

module.exports = WAR_OF_THE_RING_SCENARIO;
