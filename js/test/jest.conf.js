const path = require('path');

module.exports = {
    rootDir: path.resolve(__dirname, './../'),
    moduleFileExtensions: [
        'js'
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1'
    },
    setupFiles: ['<rootDir>/test/setup'],
    coverageDirectory: '<rootDir>/../coverage',
    collectCoverageFrom: [
        '**/*.{js}',
        '!libs/**',
        '!test/**',
        '!app.js',
        '!gameConstants.js',
        '!autoUpdating/updaterConstants.js',
        '!card/cardConstants.js',
        '!map/worldMapConfiguration.js',
        '!player/playerConstants.js',
        '!settings/defaultSettings.js',
        '!settings/electronDefaultSettings.js',
        '!settings/electronStore.js',
        '!settings/electronStoreTwo.js'
    ],
};