const moment = require('moment');

const AVAILABLE_SCENARIOS = {
    NAPOLEONIC_WARS: {
        id: 'NAPOLEONIC_WARS',
        displayName: 'Napoleonic wars',
        map: 'napoleonicEurope.svg',
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
            { name: 'France', stance: STANCES.AT_WAR, faction: FACTIONS.FRENCH_EMPIRE },
            { name: 'United Kingdom', stance: STANCES.AT_WAR, faction: FACTIONS.COALITION },
            { name: 'Russia', stance: STANCES.AT_WAR, faction: FACTIONS.COALITION },
            { name: 'Prussia', stance: STANCES.AT_WAR, faction: FACTIONS.COALITION },
            { name: 'Austria', stance: STANCES.AT_WAR, faction: FACTIONS.COALITION }
        ],
        nonPlayableCountries: [
            { name: 'Bavaria', stance: STANCES.AT_WAR, faction: FACTIONS.FRENCH_EMPIRE },
            { name: 'Sweden', stance: STANCES.AT_WAR, faction: FACTIONS.COALITION },
            { name: 'Naples', stance: STANCES.AT_WAR, faction: FACTIONS.FRENCH_EMPIRE },
            { name: 'Saxony', stance: STANCES.AT_WAR, faction: FACTIONS.COALITION },
            { name: 'Spain', stance: STANCES.NEUTRAL, faction: FACTIONS.NONE },
            { name: 'Portugal', stance: STANCES.NEUTRAL, faction: FACTIONS.NONE },
            { name: 'Denmark-Norway', stance: STANCES.NEUTRAL, faction: FACTIONS.NONE }
        ]
    },
    WAR_OF_THE_RING: {
        id: 'WAR_OF_THE_RING',
        displayName: 'War of the one ring',
        map: 'middleEarth.svg',
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
            { name: 'Rohan', stance: STANCES.AT_WAR, faction: FACTIONS.FREE_PEOPLES_OF_MIDDLE_EARTH },
            { name: 'Gondor', stance: STANCES.AT_WAR, faction: FACTIONS.FREE_PEOPLES_OF_MIDDLE_EARTH },
            { name: 'Mordor', stance: STANCES.AT_WAR, faction: FACTIONS.FORCES_OF_SAURON },
            { name: 'Isengard', stance: STANCES.AT_WAR, faction: FACTIONS.FORCES_OF_SAURON }
        ],
        nonPlayableCountries: [
            { name: 'Shire', stance: STANCES.AT_WAR, faction: FACTIONS.FREE_PEOPLES_OF_MIDDLE_EARTH },
            { name: 'Riverfell', stance: STANCES.AT_WAR, faction: FACTIONS.FREE_PEOPLES_OF_MIDDLE_EARTH },
            { name: 'Khand', stance: STANCES.AT_WAR, faction: FACTIONS.FORCES_OF_SAURON },
            { name: 'Harad', stance: STANCES.AT_WAR, faction: FACTIONS.FORCES_OF_SAURON },
            { name: 'Rhun', stance: STANCES.AT_WAR, faction: FACTIONS.FORCES_OF_SAURON }
        ]
    }
};

const STANCES = {
    AT_WAR: 0,
    NEUTRAL: 1
};

const FACTIONS = {
    NONE: 'None',
    COALITION: 'Coaliton',
    FRENCH_EMPIRE: 'French empire',
    FREE_PEOPLES_OF_MIDDLE_EARTH: 'The Free Peoples of the Middle earth',
    FORCES_OF_SAURON: 'Forces of Sauron'
};

const SPECIAL_RULES = {
    ALLIES: 0,
    FORTS: 1,
    NAVY_AND_PORTS: 2,
    CAPITALS: 3,
    TIME_PROGRESS: 4,
    HEROES: 4
};

module.exports = {
    AVAILABLE_SCENARIOS
};
