/*********************
* IMPORTS
*********************/

import GameEngine from './../gameEngine';
import MapController from './../map/mapController';
import { GAME_PHASES, TURN_PHASES } from './../gameConstants';

(function() {
    var app = angular.module('risk', []);

    /**
     * @constructor MainController
     * @memberof controllers
     * @description Main controller for the whole site
     */
    var mainController = ['$scope', function($scope) {
        var vm = this;


        // PUBLIC FUNCTIONS
        vm.filterByOwner = filterByOwner;
        vm.filterByRegion = filterByRegion;
        vm.nextTurn = nextTurn;
        vm.checkIfNextIsDisabled = checkIfNextIsDisabled;
        vm.getCurrentPlayerColor = getCurrentPlayerColor;
        vm.init = init;
        vm.startGame = startGame;

        vm.gamePhases = GAME_PHASES;
        vm.currentGamePhase = GAME_PHASES.PLAYER_SETUP;

        vm.turn = {};

        var gameEngine;
        var mapController;

        function init() {
            gameEngine = new GameEngine();

            mapController = new MapController(gameEngine.players, gameEngine.map);
            mapController.updateMap(gameEngine.map);
            document.getElementById('hilite').addEventListener('click', (e) => { clickCountry(e); });

            vm.turn = gameEngine.turn;
            vm.filter = 'byOwner';
        }

        function startGame() {
            gameEngine.startGame();
            vm.currentGamePhase = vm.gamePhases.GAME;
            vm.troopsToDeploy = gameEngine.troopsToDeploy;
        }

        function filterByOwner() {
            gameEngine.map.regions.forEach(region => {
                region.territories.forEach(territory => {
                    mapController.updateColorOfTerritory(territory, gameEngine.players.get(territory.owner).color);
                    mapController.updateTroopIndicator(territory, gameEngine.players.get(territory.owner).color);
                });
            });
            vm.filter = 'byOwner';
        }

        function filterByRegion() {
            gameEngine.map.regions.forEach(region => {
                region.territories.forEach(territory => {
                    mapController.updateColorOfTerritory(territory, region.color);
                    mapController.updateTroopIndicator(territory, region.color);
                });
            });
            vm.filter = 'byRegion';
        }

        function nextTurn() {
            vm.turn = gameEngine.nextTurn();
            console.log(vm.turn);
        }

        function checkIfNextIsDisabled() {
            if (gameEngine.turn.turnPhase === TURN_PHASES.DEPLOYMENT && gameEngine.troopsToDeploy > 0) {
                return true;
            } else {
                return false;
            }
        }

        function getCurrentPlayerColor(){
            return gameEngine.players.get(vm.turn.player.name).color.mainColor;
        }

        function clickCountry(evt) {
            let country = evt.target.getAttribute('country');
            gameEngine.handleCountryClick(country);
            mapController.updateMap(gameEngine.map);
            vm.troopsToDeploy = gameEngine.troopsToDeploy;
            $scope.$apply();
        }
    }];

    app.controller('mainController', mainController);
}());