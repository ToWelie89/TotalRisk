module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                sourceMap: true
            },
            build: {
                files: [{
                    src: 'build/app.bundle.js',
                    dest: 'build/app.bundle.min.js'
                }]
            }
        },
        less: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                cleancss: true
            },
            all: {
                files: [{
                    src: 'less/init.less',
                    dest: 'build/default.css'
                }]
            }
        },
        clean: {
            build: ['build/app.bundle.js', 'build/default.css'],
            test: ['build/testApp.bundle.js']
        },
        watch: {
            scripts: {
                files: ['js/**/*.js', 'less/**/*.less', 'json/**/*.json', 'src/**/*.html', 'assets/map.svg', '*.html'],
                tasks: ['default'],
                options: {
                    spawn: false
                }
            },
            tests: {
                files: ['js/test/**/*.js'],
                tasks: ['test'],
                options: {
                    spawn: false
                }
            }
        },
        browserify: {
            build: {
                files: {
                    'build/app.bundle.js': 'js/app.js'
                },
                options: {
                    transform: [['babelify', { presets: "es2015" }]],
                    browserifyOptions: {
                        debug: true
                    }
                }
            },
            test: {
                files: {
                    'build/testApp.bundle.js': 'js/test/test.js'
                },
                options: {
                    transform: [['babelify', { presets: "es2015" }]],
                    browserifyOptions: {
                        debug: true
                    }
                }
            }
        },
        notify: {
            build: {
                options: {
                    title: 'Grunt watch', // optional
                    message: 'Build complete' // required
                }
            },
            test: {
                options: {
                    title: 'Grunt watch', // optional
                    message: 'Test complete' // required
                }
            }
        },
        replace: {
            inlineSvg: {
                options: {
                    patterns: [{
                        match: 'mapSvg',
                        replacement: '<%= grunt.file.read("assets/map.svg") %>'
                    }, {
                        match: 'troopSvg',
                        replacement: '<%= grunt.file.read("assets/troopIcons/soldier.svg") %>'
                    }, {
                        match: 'customCharacterSvg',
                        replacement: '<%= grunt.file.read("assets/avatarSvg/custom.svg") %>'
                    }]
                },
                files: [{
                    src: ['src/index.html'],
                    dest: 'index.html'
                }]
            },
            inlineModalSvgs: {
                options: {
                    patterns: [{
                        match: 'cannonSvg',
                        replacement: '<%= grunt.file.read("assets/troopIcons/cannon.svg") %>'
                    }, {
                        match: 'horseSvg',
                        replacement: '<%= grunt.file.read("assets/troopIcons/horse.svg") %>'
                    }, {
                        match: 'troopSvg',
                        replacement: '<%= grunt.file.read("assets/troopIcons/soldier.svg") %>'
                    }]
                },
                files: [{
                    src: ['src/attackModal.html'],
                    dest: 'attackModal.html'
                }, {
                    src: ['src/turnPresentationModal.html'],
                    dest: 'turnPresentationModal.html'
                }, {
                    src: ['src/cardTurnInModal.html'],
                    dest: 'cardTurnInModal.html'
                }]
            }
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },
        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: [],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['package.json'],
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: true,
                pushTo: 'origin',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
                globalReplace: false,
                prereleaseName: false,
                metadata: '',
                regExp: false
            }
        }
    });
    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-notify');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-bump');

    // Default task for building
    grunt.registerTask('default', [
        'clean:build', // Clean previous build files
        'browserify:build', // Use browserify to transpile ES6 source code with babel
        // 'uglify', // Minify and uglify css and put it in build folder
        'less', // Compile CSS files and put them in build folder
        'replace:inlineModalSvgs',
        'replace:inlineSvg',
        'notify:build'
    ]);

    // Default task for building
    grunt.registerTask('test', [
        'clean:test', // Clean previous build files
        'browserify:test', // Use browserify to transpile ES6 source code with babel
        'karma',
        'notify:test'
    ]);
};