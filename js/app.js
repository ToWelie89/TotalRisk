/*
* IMPORTS
*/
import firebase from 'firebase';

import FirebaseSettings from './firebaseSettings';
firebase.initializeApp(FirebaseSettings);

import AutoUpdater from './autoUpdating/AutoUpdater';
const autoUpdater = new AutoUpdater();

// Controllers
import MainController from './mainController';
import GameController from './game/gameController';
import GameControllerTutorial from './game/gameControllerTutorial';
import GameControllerMultiplayer from './game/gameControllerMultiplayer';
import AuthenticationController from './authentication/authenticationController';
import GameSetupController from './gameSetup/gameSetupController';
import AttackModalController from './attack/attackModalController';
import MovementModalController from './game/movementModalController';
import CardTurnInModalController from './game/cardTurnInModalController';
import ColorPopoverController from './gameSetup/colorPopoverController';
import TurnPresentationController from './presenter/turnPresentationController';
import SettingsController from './settings/settingsController';
import PauseMenuModalController from './game/pauseMenuModalController';
import EndScreenController from './game/endScreenController';
import PlayerTypePopoverController from './gameSetup/playerTypePopoverController';
import CharacterSelectionController from './gameSetup/characterSelectionController.js';
import CharacterCreatorController from './editor/characterCreatorController.js';
import CharacterGalleryController from './gallery/characterGalleryController.js';
import AutoUpdaterModalController from './patching/autoUpdaterModalController.js';
import HostNewGameModalController from './multiplayer/hostNewGameModalController.js';
import JoinPrivateLobbyController from './multiplayer/joinPrivateLobbyController.js';
import LobbiesController from './multiplayer/lobbiesController.js';
import LobbyController from './multiplayer/lobbyController.js';
import EditProfileController from './editProfile/editProfileController';
import ProfileController from './profile/profileController';
import LeaderboardController from './leaderboard/leaderboardController';
import ScenarioSelectorModalController from './scenario/scenarioSelectorModalController';
// Services
import SoundService from './sound/soundService';
import TutorialService from './tutorial/tutorialService';
import SocketService from './multiplayer/socketService';
import MapService from './map/mapService';
import ToastService from './toast/toastService';
import Settings from './settings/settings';
import AiHandler from './ai/aiHandler';
import GameEngine from './gameEngine';
import GameAnnouncer from './voice/gameAnnouncer';
import TimerService from './timerService/timerService';
// Directives
import WavingFlagDirective from './directives/wavingFlagDirective';
import PlayerPortraitDirective from './directives/playerPortraitDirective';
import InjectSVGDirective from './directives/injectSvgDirective';

const app = angular.module('risk', ['rzModule', 'ui.bootstrap', 'ngSanitize']);

app.config(['$uibModalProvider', function ($uibModalProvider) {
    $uibModalProvider.options = {
        animation: false
    };
}]);

/* MAIN GAME ENGINE */
app.service('gameEngine', GameEngine);
/* LOAD SETTINGS */
app.service('settings', Settings);
/* CONTROLLERS */
app.controller('mainController', MainController);
app.controller('gameController', GameController);
app.controller('gameControllerTutorial', GameControllerTutorial);
app.controller('gameControllerMultiplayer', GameControllerMultiplayer);
app.controller('authenticationController', AuthenticationController);
app.controller('gameSetupController', GameSetupController);
app.controller('attackModalController', AttackModalController);
app.controller('movementModalController', MovementModalController);
app.controller('cardTurnInModalController', CardTurnInModalController);
app.controller('colorPopoverController', ColorPopoverController);
app.controller('turnPresentationController', TurnPresentationController);
app.controller('settingsController', SettingsController);
app.controller('endScreenController', EndScreenController);
app.controller('pauseMenuModalController', PauseMenuModalController);
app.controller('autoUpdaterModalController', AutoUpdaterModalController);
app.controller('playerTypePopoverController', PlayerTypePopoverController);
app.controller('characterSelectionController', CharacterSelectionController);
app.controller('characterCreatorController', CharacterCreatorController);
app.controller('characterGalleryController', CharacterGalleryController);
app.controller('lobbiesController', LobbiesController);
app.controller('lobbyController', LobbyController);
app.controller('hostNewGameModalController', HostNewGameModalController);
app.controller('joinPrivateLobbyController', JoinPrivateLobbyController);
app.controller('editProfileController', EditProfileController);
app.controller('profileController', ProfileController);
app.controller('leaderboardController', LeaderboardController);
app.controller('scenarioSelectorModalController', ScenarioSelectorModalController);
/* SERVICES */
app.service('soundService', SoundService);
app.service('mapService', MapService);
app.service('gameAnnouncerService', GameAnnouncer);
app.service('tutorialService', TutorialService);
app.service('aiHandler', AiHandler);
app.service('toastService', ToastService);
app.service('socketService', SocketService);
app.service('timerService', TimerService);
/* DIRECTIVES */
app.directive('wavingFlag', () => new WavingFlagDirective());
app.directive('playerPortrait', () => new PlayerPortraitDirective());
app.directive('injectSvg', () => new InjectSVGDirective());