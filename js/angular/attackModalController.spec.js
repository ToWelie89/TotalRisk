/*
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
*/

describe('attackModalController', function() {

    var $rootScope, $scope, $controller, $log, attackModalController;

    // beforeEach(module('risk'));
    angular.mock.module('risk');

    beforeEach(inject(function(_$rootScope_, _$controller_){
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $controller = _$controller_;

        angular.mock.inject(function ($injector) {
            $log = $injector.get('$log');
        });

        attackModalController = $controller('attackModalController', {'$rootScope' : $rootScope, '$scope': $scope, '$log': $log, 'soundService': {}});
    }));

    it('should exist', function() {
        expect(attackModalController).toBeDefined();
    });
});