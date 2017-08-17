module.exports = function(config) {
    config.set({
        frameworks: ['jasmine'],
        reporters: ['spec', 'progress'],
        files: [
            'node_modules/jquery/dist/jquery.min.js',
            'node_modules/angular/angular.js',
            'build/testApp.bundle.js'
        ],
        browsers: ['PhantomJS'],
        colors: true,
        singleRun: true,
        // logLevel: config.LOG_DEBUG,
        devtool: 'inline-source-map'
    });
};
