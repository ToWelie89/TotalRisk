/*********************
* IMPORTS
*********************/

import GameEngine from './../gameEngine';
import MapController from './../map/mapController';

(function() {
    var app = angular.module('risk', []);

    /**
     * @constructor MainController
     * @memberof controllers
     * @description Main controller for the whole site
     */
    var mainController = ['$scope', function($scope) {
        $scope.filterByOwner = filterByOwner;
        $scope.filterByRegion = filterByRegion;
        $scope.nextTurn = nextTurn;
        $scope.turn = {};

        var gameEngine = new GameEngine();

        var mapController = new MapController(gameEngine.players, gameEngine.map);
        mapController.updateMap(gameEngine.map);

        gameEngine.startGame();
        $scope.turn = gameEngine.turn;
        $scope.filter = 'byOwner';

        function filterByOwner() {
            gameEngine.map.regions.forEach(region => {
                region.territories.forEach(territory => {
                    mapController.updateColorOfTerritory(territory.name, gameEngine.players.get(territory.owner).color);
                });
            });
            $scope.filter = 'byOwner';
        }

        function filterByRegion() {
            gameEngine.map.regions.forEach(region => {
                region.territories.forEach(territory => {
                    mapController.updateColorOfTerritory(territory.name, region.color);
                });
            });
            $scope.filter = 'byRegion';
        }

        function nextTurn() {
            $scope.turn = gameEngine.nextTurn();
            console.log($scope.turn);
        }
    }];

    app.controller('mainController', mainController);
}());