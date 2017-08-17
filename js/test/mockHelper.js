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
        addTroopSound: jasmine.createSpyObj('addTroopSound', ['play'])
    };
    return mock;
};

export {
    createSoundService,
    createUibModalInstance
};