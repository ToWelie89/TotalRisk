describe('attackModalController', function() {

    let attackModalController;
    let $scope;
    let $rootScope;
    let $log;
    let soundService;

    beforeEach(() => {
        soundService = jasmine.createSpyObj('SoundService', [
            'bleep',
            'cheer',
            'screamSound',
            'addTroopSound'
        ]);

        angular.mock.module('risk');
        angular.mock.inject(($injector) => {
            const $controller = $injector.get('$controller');
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();
            $log = $injector.get('$log');

            attackModalController = $controller('attackModalController as attackModal', {
                $scope,
                $rootScope,
                $log,
                soundService
            });
        });
    });

    it('has a dummy spec to test 2 + 2', function() {
        attackModalController.resetController();
        expect(attackModalController.fightIsOver).toEqual(false);
        expect(attackModalController.showMoveTroops).toEqual(false);
        expect(attackModalController.moveNumberOfTroops).toEqual(1);
    });
});
