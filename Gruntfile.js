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
            build: ['build/*']
        },
        watch: {
            scripts: {
                files: ['js/**/*.js', 'less/**/*.less', 'json/**/*.json', 'src/**/*.html', 'assets/map.svg'],
                tasks: ['default'],
                options: {
                    spawn: false
                }
            }
        },
        shell: {
            webpack: {
                command: 'npm run webpack'
            }
        },
        jsonlint: {
            src: [
                'package.json'
            ]
        },
        notify: {
            watch: {
                options: {
                    title: 'Grunt watch', // optional
                    message: 'Build complete' // required
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
                }]
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-jsonlint');
    grunt.loadNpmTasks('grunt-notify');
    grunt.loadNpmTasks('grunt-replace');

    // Default task for building
    grunt.registerTask('default', [
        // 'jsonlint',
        'clean', // Clean previous build files
        'shell:webpack',
        'uglify', // Minify and uglify css and put it in build folder
        'less', // Compile CSS files and put them in build folder
        'replace:inlineModalSvgs',
        'replace:inlineSvg',
        'notify'
    ]);
};
