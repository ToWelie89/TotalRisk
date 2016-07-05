/*********************
* IMPORTS
*********************/

import GameEngine from './gameEngine';

/*********************
* DECLARATIONS
*********************/

/*********************
* MAIN
*********************/

window.onload = function() {
    let gameEngine = new GameEngine();
    gameEngine.startGame();
};