const createUibModalInstance = () => {
    return {
        close: jest.fn()
    };
};

const createUibModal = () => {
    return {
        open: jest.fn()
    };
};

const createGameAnnouncerService = () => {
    return {
        mute: jest.fn()
    };
};

const createSocketService = () => {
    return {
        gameSocket: {
            emit: jest.fn()
        }
    };
};

const createTutorialService = () => {
    return {
        initTutorialData: jest.fn(),
        attackModalExplanation: jest.fn().mockImplementation(() => Promise.resolve()),
        attackModalFightExplanation: jest.fn().mockImplementation(() => Promise.resolve()),
        attackModalRetreatExplanation: jest.fn().mockImplementation(() => Promise.resolve()),
        startAttack: jest.fn().mockImplementation(() => Promise.resolve()),
        afterAttack: jest.fn().mockImplementation(attackData => Promise.resolve()),
        afterAttack2: jest.fn().mockImplementation(attackData => Promise.resolve()),
        moveAfterAttackExplanation: jest.fn().mockImplementation(attackData => Promise.resolve())
    };
};

const createSoundService = () => {
    return {
        bleep: {
            play: jest.fn()
        },
        cheer: {
            play: jest.fn()
        },
        screamSound: {
            play: jest.fn()
        },
        addTroopSound: {
            play: jest.fn()
        },
        cardTurnIn: {
            play: jest.fn()
        },
        cardSelect: {
            play: jest.fn()
        },
        changeColor: {
            play: jest.fn()
        },
        diceRoll: {
            play: jest.fn()
        },
        bleep2: {
            play: jest.fn()
        },
        remove: {
            play: jest.fn()
        },
        denied: {
            play: jest.fn()
        },
        tick: {
            play: jest.fn()
        }
    };
};

const createScope = () => {
    return {
        $apply: jest.fn(),
        $watch: jest.fn()
    };
};

const createRootScope = () => {
    return {
        $watch: jest.fn()
    };
};

const createSce = () => {
    return {
        trustAsHtml: jest.fn()
    };
};

const createGameEngine = () => {
    return {
        toggleSound: jest.fn(),
        startGame: jest.fn()
    };
};

const createMapService = () => {
    return {
        updateMap: jest.fn()
    };
};

const createSettings = () => {
    return {
        showAnnouncer: jest.fn()
    };
};

const createAiHandler = () => {
    return {
        update: jest.fn()
    };
};

export {
    createSoundService,
    createUibModalInstance,
    createScope,
    createGameEngine,
    createMapService,
    createUibModal,
    createTutorialService,
    createRootScope,
    createSettings,
    createAiHandler,
    createGameAnnouncerService,
    createSce,
    createSocketService
};