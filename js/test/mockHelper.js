const createUibModalInstance = () => {
    const mock = jasmine.createSpyObj('$uibModalInstance', [
        'close'
    ]);
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
        diceRoll: jasmine.createSpyObj('diceRoll', ['play'])

    };
    return mock;
};

const createScope = () => {
    const mock = jasmine.createSpyObj('$scope', [
        '$apply'
    ]);
    return mock;
};

export {
    createSoundService,
    createUibModalInstance,
    createScope
};