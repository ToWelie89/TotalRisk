/*********************
* IMPORTS
*********************/

import GameEngine from './../gameEngine';
import MapController from './../map/mapController';
import { GAME_PHASES } from './../gameConstants';

(function() {
    var app = angular.module('risk', []);

    /**
     * @constructor MainController
     * @memberof controllers
     * @description Main controller for the whole site
     */
    var mainController = ['$scope', function($scope) {
        // PUBLIC FUNCTIONS
        $scope.filterByOwner = filterByOwner;
        $scope.filterByRegion = filterByRegion;
        $scope.nextTurn = nextTurn;
        $scope.getCurrentPlayerColor = getCurrentPlayerColor;
        $scope.init = init;
        $scope.startGame = startGame;

        $scope.gamePhases = GAME_PHASES;
        $scope.currentGamePhase = GAME_PHASES.PLAYER_SETUP;

        $scope.turn = {};

        var gameEngine;
        var mapController;

        function init() {
            gameEngine = new GameEngine();

            mapController = new MapController(gameEngine.players, gameEngine.map);
            mapController.updateMap(gameEngine.map);
            document.getElementById('hilite').addEventListener('click', (e) => { clickCountry(e); });

            $scope.turn = gameEngine.turn;
            $scope.filter = 'byOwner';
        }

        function startGame() {
            gameEngine.startGame();
            $scope.currentGamePhase = $scope.gamePhases.GAME;
            $scope.troopsToDeploy = gameEngine.troopsToDeploy;
        }

        function filterByOwner() {
            gameEngine.map.regions.forEach(region => {
                region.territories.forEach(territory => {
                    mapController.updateColorOfTerritory(territory, gameEngine.players.get(territory.owner).color);
                    mapController.updateTroopIndicator(territory, gameEngine.players.get(territory.owner).color);
                });
            });
            $scope.filter = 'byOwner';
        }

        function filterByRegion() {
            gameEngine.map.regions.forEach(region => {
                region.territories.forEach(territory => {
                    mapController.updateColorOfTerritory(territory, region.color);
                    mapController.updateTroopIndicator(territory, region.color);
                });
            });
            $scope.filter = 'byRegion';
        }

        function nextTurn() {
            $scope.turn = gameEngine.nextTurn();
            console.log($scope.turn);
        }

        function getCurrentPlayerColor(){
            return gameEngine.players.get($scope.turn.player.name).color.mainColor;
        }

        function clickCountry(evt) {
            let country = evt.target.getAttribute('country');
            gameEngine.handleCountryClick(country);
            mapController.updateMap(gameEngine.map);
            $scope.troopsToDeploy = gameEngine.troopsToDeploy;
        }
    }];

    app.controller('mainController', mainController);
}());