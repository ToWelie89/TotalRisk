/*
* IMPORTS
*/

import {MainController} from './mainController';
import {GameSetupController} from './gameSetupController';
import {AttackModalController} from './attackModalController';
import {MovementModalController} from './movementModalController';
import ColorPopoverController from './colorPopoverController';
import {SoundService} from './../sound/soundService';
import MapService from './../map/mapService';
import GameEngine from './../gameEngine';

const app = angular.module('risk', ['rzModule', 'ui.bootstrap']);

/* CONSTANTS */
app.constant('gameEngine', new GameEngine());
/* CONTROLLERS */
app.controller('mainController', MainController);
app.controller('gameSetupController', GameSetupController);
app.controller('attackModalController', AttackModalController);
app.controller('movementModalController', MovementModalController);
app.controller('colorPopoverController', ColorPopoverController);
/* SERVICES */
app.service('soundService', SoundService);
app.service('mapService', MapService);
