const createLeader = (name, image) => ({
    name,
    image
});

const STANCES = {
    AT_WAR: 0,
    NEUTRAL: 1
};

const FACTIONS = {
    NONE: 'None',
    COALITION: 'Coaliton',
    FRENCH_EMPIRE: 'French empire',
    FREE_PEOPLES_OF_MIDDLE_EARTH: 'The Free Peoples of the Middle earth',
    FORCES_OF_SAURON: 'Forces of Sauron'
};

const SPECIAL_RULES = {
    ALLIES: {
        displayName: 'Alliances',
        description: 'Instead of players playing against each other in a free-for-all fashion they can ally with each other in order to form factions'
    },
    FORTS: {
        displayName: 'Fortifications',
        description: 'Territories can be fortified in order to gain extra defense bonuses'
    },
    NAVY_AND_PORTS: {
        displayName: 'Navies and ports',
        description: 'Seas are divided into sea territories that can be controlled by player-controlled navies'
    },
    CAPITALS: {
        displayName: 'Capitals',
        description: 'Each player has a territory with a capital city in it. Occupying an enemy capital city will force that player to surrender'
    },
    TIME_PROGRESS: {
        displayName: 'Timeline',
        description: 'Each turn represents a given number of days in a timeline'
    },
    HEROES: {
        displayName: 'Heroes',
        description: 'Players have access not only to regular armies but also special hero units that offer unique bonuses'
    }
};

module.exports = {
    STANCES,
    FACTIONS,
    SPECIAL_RULES,
    createLeader
};
