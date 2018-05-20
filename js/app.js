/*
* IMPORTS
*/

import MainController from './angular/mainController';
import GameController from './angular/gameController';
import GameSetupController from './angular/gameSetupController';
import AttackModalController from './angular/attackModalController';
import MovementModalController from './angular/movementModalController';
import CardTurnInModalController from './angular/cardTurnInModalController';
import ColorPopoverController from './angular/colorPopoverController';
import TurnPresentationController from './angular/turnPresentationController';
import SettingsController from './angular/settingsController';
import PauseMenuModalController from './angular/pauseMenuModalController';
import EndScreenTableController from './angular/endScreenTableController';
import PlayerTypePopoverController from './angular/playerTypePopoverController';
import CharacterSelectionController from './angular/characterSelectionController.js';
import SoundService from './sound/soundService';
import TutorialService from './tutorial/tutorialService';
import MapService from './map/mapService';
import Settings from './settings/settings';
import AiHandler from './ai/aiHandler';
import GameEngine from './gameEngine';
import GameAnnouncer from './voice/gameAnnouncer';
import WavingFlagDirective from './directives/wavingFlagDirective';

const app = angular.module('risk', ['rzModule', 'ui.bootstrap', 'ngSanitize']);

/* MAIN GAME ENGINE */
app.service('gameEngine', GameEngine);
/* LOAD SETTINGS */
app.service('settings', Settings);
/* CONTROLLERS */
app.controller('mainController', MainController);
app.controller('gameController', GameController);
app.controller('gameSetupController', GameSetupController);
app.controller('attackModalController', AttackModalController);
app.controller('movementModalController', MovementModalController);
app.controller('cardTurnInModalController', CardTurnInModalController);
app.controller('colorPopoverController', ColorPopoverController);
app.controller('turnPresentationController', TurnPresentationController);
app.controller('settingsController', SettingsController);
app.controller('endScreenTableController', EndScreenTableController);
app.controller('pauseMenuModalController', PauseMenuModalController);
app.controller('playerTypePopoverController', PlayerTypePopoverController);
app.controller('characterSelectionController', CharacterSelectionController);
/* SERVICES */
app.service('soundService', SoundService);
app.service('mapService', MapService);
app.service('gameAnnouncerService', GameAnnouncer);
app.service('tutorialService', TutorialService);
app.service('aiHandler', AiHandler);
/* DIRECTIVES */
app.directive('wavingFlag', () => new WavingFlagDirective());