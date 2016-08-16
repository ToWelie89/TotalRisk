/*********************
* IMPORTS
*********************/

(function() {
    var app = angular.module('risk', []);

    /**
     * @constructor MainController
     * @memberof controllers
     * @description Main controller for the whole site
     */
    var gameSetupController = ['$scope', function($scope) {
        var vm = this;

        // PUBLIC FUNCTIONS
        function lol() {
            $scope.hej = '';
        }
    }];

    app.controller('gameSetupController', gameSetupController);
}());