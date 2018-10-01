const createUibModalInstance = () => {
    const mock = jasmine.createSpyObj('$uibModalInstance', [
        'close'
    ]);
    return mock;
};

const createUibModal = () => {
    const mock = jasmine.createSpyObj('$uibModal', [
        'open'
    ]);
    return mock;
};

const createTutorialService = () => {
    const mock = jasmine.createSpyObj('tutorialService', ['lol']);
    return mock;
};

const createSoundService = () => {
    const mock = {
        bleep: jasmine.createSpyObj('bleep', ['play']),
        cheer: jasmine.createSpyObj('cheer', ['play']),
        screamSound: jasmine.createSpyObj('screamSound', ['play']),
        addTroopSound: jasmine.createSpyObj('addTroopSound', ['play']),
        cardTurnIn: jasmine.createSpyObj('cardTurnIn', ['play']),
        cardSelect: jasmine.createSpyObj('cardSelect', ['play']),
        changeColor: jasmine.createSpyObj('changeColor', ['play']),
        diceRoll: jasmine.createSpyObj('diceRoll', ['play']),
        bleep2: jasmine.createSpyObj('bleep2', ['play']),
        remove: jasmine.createSpyObj('remove', ['play']),
        denied: jasmine.createSpyObj('denied', ['play']),
        tick: jasmine.createSpyObj('tick', ['play'])

    };
    return mock;
};

const createScope = () => {
    const mock = jasmine.createSpyObj('$scope', [
        '$apply',
        '$watch'
    ]);
    return mock;
};

const createRootScope = () => {
    const mock = jasmine.createSpyObj('$rootScope', [
        '$watch'
    ]);
    return mock;
};

const createGameEngine = () => {
    const mock = jasmine.createSpyObj('gameEngine', [
        'toggleSound',
        'startGame'
    ]);
    return mock;
};

const createMapService = () => {
    const mock = jasmine.createSpyObj('mapService', [
        'updateMap'
    ]);
    return mock;
};

const createSettings = () => {
    const mock = {
        showAnnouncer: true
    }
    return mock;
};

const createAiHandler = () => {
    const mock = jasmine.createSpyObj('aiHandler', [
        'update'
    ]);
    return mock;
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
    createAiHandler
};