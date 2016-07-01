/*********************
* IMPORTS
*********************/

import GameEngine from './gameEngine';
import { initSvgMap } from './map/generateSvgMap';

/*********************
* DECLARATIONS
*********************/

/*********************
* MAIN
*********************/

window.initMap = function() {
    initSvgMap();
}

window.onload = function() {
    let gameEngine = new GameEngine();
    gameEngine.startGame();
};