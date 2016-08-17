/*********************
* IMPORTS
*********************/

import { MainController } from './mainController';
import { GameSetupController } from './gameSetupController';

var app = angular.module('risk', []);

app.controller('mainController', MainController);
app.controller('gameSetupController', GameSetupController);