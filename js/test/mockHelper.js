const mockSoundService = jasmine.createSpyObj('soundService', [
    'bleep',
    'cheer',
    'screamSound',
    'addTroopSound'
]);
mockSoundService.bleep = jasmine.createSpyObj('bleep', [
    'play'
]);
mockSoundService.cheer = jasmine.createSpyObj('cheer', [
    'play'
]);
mockSoundService.screamSound = jasmine.createSpyObj('screamSound', [
    'play'
]);
mockSoundService.addTroopSound = jasmine.createSpyObj('addTroopSound', [
    'play'
]);

export {
    mockSoundService
};