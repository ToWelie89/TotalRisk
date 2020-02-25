module.exports = function(grunt) {
    grunt.initConfig({
        replace: {
            dist: {
                options: {
                    patterns: [{
                        match: /https:\/\/totalconquest.herokuapp.com/g,
                        replacement: 'http://127.0.0.1:5000'
                    }]
                },
                files: [{
                    expand: true,
                    flatten: true,
                    src: ['assetsDist/app.bundle.js'],
                    dest: 'assetsDist/'
                }]
            }
        },
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                sourceMap: true
            },
            build: {
                files: [{
                    src: 'assetsDist/app.bundle.js',
                    dest: 'assetsDist/app.bundle.min.js'
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
                    dest: 'assetsDist/default.css'
                }]
            }
        },
        clean: {
            build: ['assetsDist/app.bundle.js', 'assetsDist/default.css']
        },
        watch: {
            prod: {
                files: ['js/**/*.js', 'less/**/*.less', 'json/**/*.json', 'assets/**/*.svg'],
                tasks: ['default'],
                options: {
                    spawn: false
                }
            },
            local: {
                files: ['js/**/*.js', 'less/**/*.less', 'json/**/*.json', 'assets/**/*.svg'],
                tasks: ['default:local'],
                options: {
                    spawn: false
                }
            }
        },
        browserify: {
            build: {
                files: {
                    'assetsDist/app.bundle.js': 'js/app.js'
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
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-replace');

    // Default task for building
    grunt.registerTask('default', [
        'clean:build', // Clean previous build files
        'browserify:build', // Use browserify to transpile ES6 source code with babel
        // 'uglify', // Minify and uglify css and put it in build folder
        'less', // Compile CSS files and put them in build folder
        //'notify:build'
    ]);
    grunt.registerTask('default:local', [
        'default',
        'replace' // replace actual prod endpoint with local 127.0.0.1:5000 for testing locally run server
    ]);
    grunt.registerTask('buildjs', [
        'browserify:build'
    ]);
    grunt.registerTask('buildcss', [
        'less'
    ]);
};