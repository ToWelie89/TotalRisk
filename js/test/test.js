console.log = () => {
	return;
}

require('babel-polyfill');
require('./../app');
require('./gameSetupController.test');