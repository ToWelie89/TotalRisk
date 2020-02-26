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
    ALLIES: 0,
    FORTS: 1,
    NAVY_AND_PORTS: 2,
    CAPITALS: 3,
    TIME_PROGRESS: 4,
    HEROES: 4
};

module.exports = {
    STANCES,
    FACTIONS,
    SPECIAL_RULES,
    createLeader
};
