/*
* IMPORTS
*/

import {MainController} from './mainController';
import {GameSetupController} from './gameSetupController';
import {AttackModalController} from './attackModalController';
import GameEngine from './../gameEngine';

const app = angular.module('risk', ['rzModule']);

app.constant('gameEngine', new GameEngine());

app.controller('mainController', MainController);
app.controller('gameSetupController', GameSetupController);
app.controller('attackModalController', AttackModalController);
