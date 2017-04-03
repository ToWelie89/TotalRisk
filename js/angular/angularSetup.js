/*
* IMPORTS
*/

import {MainController} from './mainController';
import GameSetupController from './gameSetupController';
import {AttackModalController} from './attackModalController';
import {MovementModalController} from './movementModalController';
import ColorPopoverController from './colorPopoverController';
import {TurnPresentationController} from './turnPresentationController';
import {SoundService} from './../sound/soundService';
import MapService from './../map/mapService';
import GameEngine from './../gameEngine';
import GameAnnouncer from './../voice/gameAnnouncer';

const app = angular.module('risk', ['rzModule', 'ui.bootstrap']);

/* MAIN GAME ENGINE */
app.service('gameEngine', GameEngine);
/* CONTROLLERS */
app.controller('mainController', MainController);
app.controller('gameSetupController', GameSetupController);
app.controller('attackModalController', AttackModalController);
app.controller('movementModalController', MovementModalController);
app.controller('colorPopoverController', ColorPopoverController);
app.controller('turnPresentationController', TurnPresentationController);
/* SERVICES */
app.service('soundService', SoundService);
app.service('mapService', MapService);
app.service('gameAnnouncerService', GameAnnouncer);
