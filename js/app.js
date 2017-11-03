/*
* IMPORTS
*/

import MainController from './angular/mainController';
import GameSetupController from './angular/gameSetupController';
import AttackModalController from './angular/attackModalController';
import MovementModalController from './angular/movementModalController';
import CardTurnInModalController from './angular/cardTurnInModalController';
import ColorPopoverController from './angular/colorPopoverController';
import AvatarPopoverController from './angular/avatarPopoverController';
import TurnPresentationController from './angular/turnPresentationController';
import SoundService from './sound/soundService';
import TutorialService from './tutorial/tutorialService';
import MapService from './map/mapService';
import GameEngine from './gameEngine';
import GameAnnouncer from './voice/gameAnnouncer';

const app = angular.module('risk', ['rzModule', 'ui.bootstrap', 'ngSanitize']);

/* MAIN GAME ENGINE */
app.service('gameEngine', GameEngine);
/* CONTROLLERS */
app.controller('mainController', MainController);
app.controller('gameSetupController', GameSetupController);
app.controller('attackModalController', AttackModalController);
app.controller('movementModalController', MovementModalController);
app.controller('cardTurnInModalController', CardTurnInModalController);
app.controller('colorPopoverController', ColorPopoverController);
app.controller('avatarPopoverController', AvatarPopoverController);
app.controller('turnPresentationController', TurnPresentationController);
/* SERVICES */
app.service('soundService', SoundService);
app.service('mapService', MapService);
app.service('gameAnnouncerService', GameAnnouncer);
app.service('tutorialService', TutorialService);
