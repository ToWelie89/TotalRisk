console.log = () => {
	return;
}

require('babel-polyfill');
require('./../app');
require('./../angular/attackModalController.test');
require('./../angular/cardTurnInModalController.test');
require('./../angular/gameSetupController.test');