/*********************
* IMPORTS
*********************/

import { MainController } from './mainController';
import { GameSetupController } from './gameSetupController';
import { AttackModalController } from './attackModalController';
import GameEngine from './../gameEngine';

var app = angular.module('risk', []);

app.constant('gameEngine', new GameEngine());

app.controller('mainController', MainController);
app.controller('gameSetupController', GameSetupController);
app.controller('attackModalController', AttackModalController);