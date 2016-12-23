/*
* IMPORTS
*/

import {MainController} from './mainController';
import {GameSetupController} from './gameSetupController';
import {AttackModalController} from './attackModalController';
import {MovementModalController} from './movementModalController';
import GameEngine from './../gameEngine';
import SoundEngine from './../sound/soundEngine';

const app = angular.module('risk', ['rzModule']);

app.constant('gameEngine', new GameEngine());
app.constant('soundEngine', new SoundEngine());

app.controller('mainController', MainController);
app.controller('gameSetupController', GameSetupController);
app.controller('attackModalController', AttackModalController);
app.controller('movementModalController', MovementModalController);
