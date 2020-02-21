const moment = require('moment');
const { createLeader, STANCES, FACTIONS, SPECIAL_RULES } = require('./../scenarioConstants');

const NAPOLEON = createLeader('Theodén', './assets/avatarSvg/napoleon.svg');
const KING_GEORGE = createLeader('George III', '');
const FRANCIS = createLeader('Francis II', '');
const ALEXANDER = createLeader('Alexander I', '');
const FREDERICK_WILLIAM = createLeader('Frederick William III', '');
const GUSTAV = createLeader('Gustav IV', '');
const CHARLES = createLeader('Charles IV', '');
const MARIA = createLeader('Maria I', '');
const FREDERICK = createLeader('Frederick IV', '');
const OTTO = createLeader('Otto', '');

const NAPOLEONIC_WARS_SCENARIO = {
    id: 'NAPOLEONIC_WARS',
    displayName: 'Napoleonic wars',
    map: 'napoleonicEurope.svg',
    description: 'Play as one of the major european powers during the conflict of the Napoleonic wars that took place in the early 19th century.',
    specialRules: [
        SPECIAL_RULES.ALLIES,
        SPECIAL_RULES.FORTS,
        SPECIAL_RULES.NAVY_AND_PORTS,
        SPECIAL_RULES.CAPITALS,
        SPECIAL_RULES.TIME_PROGRESS
    ],
    daysPerTurn: 14,
    startingDate: moment('18010511'),
    factions: [
        FACTIONS.NONE,
        FACTIONS.COALITION,
        FACTIONS.FRENCH_EMPIRE
    ],
    playableCountries: [
        { name: 'France', stance: STANCES.AT_WAR, faction: FACTIONS.FRENCH_EMPIRE, LEADER: NAPOLEON },
        { name: 'United Kingdom', stance: STANCES.AT_WAR, faction: FACTIONS.COALITION, LEADER: KING_GEORGE },
        { name: 'Russia', stance: STANCES.AT_WAR, faction: FACTIONS.COALITION, LEADER: ALEXANDER },
        { name: 'Prussia', stance: STANCES.AT_WAR, faction: FACTIONS.COALITION, LEADER: FREDERICK_WILLIAM },
        { name: 'Austria', stance: STANCES.AT_WAR, faction: FACTIONS.COALITION, LEADER: FRANCIS }
    ],
    nonPlayableCountries: [
        { name: 'Bavaria', stance: STANCES.AT_WAR, faction: FACTIONS.FRENCH_EMPIRE, LEADER: OTTO },
        { name: 'Sweden', stance: STANCES.AT_WAR, faction: FACTIONS.COALITION, LEADER: GUSTAV },
        //{ name: 'Naples', stance: STANCES.AT_WAR, faction: FACTIONS.FRENCH_EMPIRE },
        { name: 'Spain', stance: STANCES.NEUTRAL, faction: FACTIONS.NONE, LEADER: CHARLES },
        { name: 'Portugal', stance: STANCES.NEUTRAL, faction: FACTIONS.NONE, LEADER: MARIA },
        { name: 'Denmark-Norway', stance: STANCES.NEUTRAL, faction: FACTIONS.NONE, LEADER: FREDERICK }
    ]
};

module.exports = NAPOLEONIC_WARS_SCENARIO;
