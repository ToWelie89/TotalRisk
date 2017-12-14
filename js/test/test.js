console.log = () => {
	return;
}

require('babel-polyfill');

jasmine.clock().install();

require('./../app');
require('./../angular/attackModalController.test');
require('./../angular/cardTurnInModalController.test');
require('./../angular/gameSetupController.test');
require('./../angular/gameController.test');
require('./../card/cardHelpers.test');