const path = require('path')

module.exports = {
  rootDir: path.resolve(__dirname, './js'),
  moduleFileExtensions: [
    'js'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/js/$1'
  },
  //setupFiles: ['<rootDir>/test/unit/setup'],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    'js/**/*.{js}'
  ],
}
