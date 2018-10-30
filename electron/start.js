require('babel-register')({
    presets: [ 'env' ]
})

// Import the rest of our application.
if (process.env.NODE_ENV === 'electron') {
	module.exports = require('./main.js')
} else if (process.env.NODE_ENV === 'web') {
	module.exports = require('./socket.js')
}
