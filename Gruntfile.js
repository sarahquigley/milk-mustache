module.exports = function(grunt) {

  require('time-grunt')(grunt);

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Configure variables for use across grunt tasks
  var config = {
    dirs: {
      src: 'src',
      dev: '.dev',
      build: '.build',
    },
    files: {
      scripts: [
        '<%= config.dirs.src %>/scripts/main.js',
      ],
      tests: [
        '<%= config.dirs.src %>/scripts/**/*.spec.js'
      ]
    }
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    config: config,

    // Clean tasks    - For erasing contents of specified directories
    // clean:dev      - Clean temporary directory created for holding compiled files during development
    // clean:build    - Clean build directory created for holding built files used for deployment
    clean: {
      dev: [config.dirs.dev],
      build: [config.dirs.build],
    },

    // Concurrent tasks   - Allow tasks to be run concurrently
    // concurrent:test    - Allow unit-tests and watch task to be run simultaneously
    concurrent: {
      test: {
        tasks: [
          'jekyll:dev',
          'karma:concurrent',
          'watch'
        ],
        options: {
          logConcurrentOutput: true
        }
      },
      dev: {
        tasks: [
          'jekyll:dev',
          'watch'
        ],
        options: {
          logConcurrentOutput: true
        }
      }
    },

    // Copy task      - Copy files from one directory to another
    // copy:build     - Copy files from src directory to build directory during build process
    copy: {
      build: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: '<%= config.dirs.dev %>',
            dest: '<%= config.dirs.build %>',
            src: [
              '*.json',
              'CNAME',
              '*.{html,xml}',
              '*/**/*.html',
              'assets/**/*',
              'uploads/**/*',
              'images/**/*',
              '!bower_components/**/*.html',
              '!scripts/**/*.js',
              '!styles/**/*.css',
            ]
          }
        ]
      }
    },

    // Filerev tasks    - Rename files for browser caching purposes
    // filerev:build    - Filerev tasks used during build process
    filerev: {
      build: {
        src: [
          '<%= config.dirs.build %>/scripts/{,*/}*.js',
          '<%= config.dirs.build %>/styles/{,*/}*.css',
          '<%= config.dirs.build %>/assets/**/*',
        ]
      }
    },

    // Filerev_replace tasks    - Replace asset names in files with new names from filerev task
    filerev_replace: {
      options: {
        assets_root: '<%= config.dirs.build %>/assets/'
      },
      compiled_assets: {
        src: [
          '<%= config.dirs.build %>/scripts/{,*/}*.js',
          '<%= config.dirs.build %>/styles/{,*/}*.css',
        ]
      },
      views: {
        options: {
          views_root: '<%= config.dirs.build %>'
        },
        src: '<%= config.dirs.build %>/**/*.html'
      }
    },

    // gh-pages task    - Push build to the gh-pages branch.
    'gh-pages': {
      options: {
        base: '<%= config.dirs.build %>',
      },
      src: ['**']
    },

    // Htmlmin tasks    - Minify html files
    // htmlmin:build    - Minify html files during build process
    htmlmin: {
      build: {
        options: {
          collapseWhitespace: true,
          conservativeCollapse: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= config.dirs.build %>',
          src: ['*.html', '*/**/*.html'],
          dest: '<%= config.dirs.build %>'
        }]
      }
    },

    // Jekyll - static site generator
    jekyll: {
      options: {
        bundleExec: true,
        src : '<%= config.dirs.src %>'
      },
      dev: {
        options: {
          config: '<%= config.dirs.src %>/_config.yml,<%= config.dirs.src %>/_config-dev.yml',
          serve: true,
          watch: true,
          dest: '<%= config.dirs.dev %>',
          drafts: true,
          future: true
        }
      },
      build: {
        options: {
          config: '<%= config.dirs.src %>/_config.yml',
          serve: false,
          watch: false,
          dest: '<%= config.dirs.dev %>',
          drafts: false,
          future: false
        }
      }
    },

    // Karma - test runner
    // karma:concurrent   - Run test in the background
    // karma:single       - Run tests once
    karma: {
      options: {
        configFile: 'karma.conf.js'
      },
      // Keep tests running in the background
      concurrent: {
        singleRun: false
      },
      // Run tests once
      single: {
        singleRun: true
      },
      // Run only in headless browsers
      'continuous-integration': {
        singleRun: true,
        browsers: ['PhantomJS'],
      }
    },

    // UseminPrepare tasks  - Reads HTML for usemin blocks to enable smart builds that automatically
    //                        concat, minify and revision files. Creates configurations in memory so
    //                        additional tasks can operate on them
    // useminPrepare:build  - UseminPrepare task for build process
    useminPrepare: {
      build: {
        src: ['<%= config.dirs.dev %>/index.html'],
        options: {
          staging: '<%= config.dirs.dev %>/tmp',
          dest: '<%= config.dirs.build %>',
          flow: {
            steps: {
              js: ['concat', 'uglifyjs'],
              css: ['cssmin']
            },
            post: {}
          }
        }
      }
    },

    // Usemin tasks         - Performs rewrites based on filerev and the useminPrepare configuration
    // usemin:html          - Usemin task for .html files
    // usemin:css          - Usemin task for .css files
    usemin: {
      html: ['<%= config.dirs.build %>/**/*.html'],
      css: ['<%= config.dirs.build %>/styles/**/*.css'],
      options: {
        assetsDirs: ['<%= config.dirs.build %>']
      }
    },

    // Watch tasks      - Watch for changes in specified directories, and re-run specified task(s)
    // watch:babel      - Watch ES6 javascript files, re-compile ES6 javascript files
    // watch:sass       - Watch .scss and .sass files, re-compile on change
    // watch:wiredep    - Watch bower.json for new bower_components, and inject new dependencies
    // watch:livereload - Trigger livereload on update of html or scripts
    watch: {
      options: {
        livereload: true
      },

      livereload: {
        host: 'localhost',
        port: '4000',
        files: [
          '<%= config.dirs.dev %>/**/*.{html,js,css}',
        ]
      },

      wiredep: {
        files: ['bower.json'],
        tasks: [
          'wiredep:dev',
          'wiredep:devSCSS',
          'wiredep:test',
        ]
      }
    },

    // Wiredep tasks    - Inject bower dependencies automatically into source code
    // wiredep:dev      - Inject bower dependencies into html pages and scss files
    // wiredep:test     - Inject bower dependencies into karma config
    wiredep: {
      dev: {
        ignorePath: '..',
        src: [
          '<%= config.dirs.src %>/_includes/head.html',
          '<%= config.dirs.src %>/_includes/scripts.html',
        ],
        exclude: [
          '<%= config.dirs.src %>/bower_components/respond/dest/respond.src.js',
          '<%= config.dirs.src %>/bower_components/html5shiv/dist/html5shiv.js'
        ],
        html: {
          ignorePath: '..'
        },
      },

      devSCSS: {
        src: [
          '<%= config.dirs.src %>/styles/main.scss',
        ]
      },

      test:{
        src: 'karma.conf.js',
        fileTypes: {
          js: {
            block: /(([\s\t]*)\/\/\s*bower:*(\S*))(\n|\r|.)*?(\/\/\s*endbower)/gi, // Wire dependencies between '// bower:extension' and '// endbower'
            detect: {
              js: /'(.*\.js)'/gi
            },
            replace: {
              js: '\'{{filePath}}\','
            }
          }
        }
      }
    }

  });

  // Custom tasks

  // build                    - Build src, ready for deployment
  //    [--no-install-deps]   - Skip dependency installation.
  grunt.registerTask('build', 'Build, ready for deployment', function(){
    if(! grunt.option('no-install-deps')){
      grunt.task.run([
        'npm-install',
      ]);
    }

    grunt.task.run([
      'clean:build',
      'wiredep:dev',
      'wiredep:devSCSS',
      'jekyll:build',
      'copy:build',
      'useminPrepare',
      'concat',
      'cssmin',
      'uglify',
      'filerev',
      'filerev_replace',
      'usemin',
      'htmlmin',
    ]);
  });

  // deploy                    - Build src, deploy to gh-pages branch on Github
  grunt.registerTask('deploy', 'Build src, deploy to gh-pages branch', function(){
    grunt.task.run([
      'build',
      'gh-pages',
    ]);
  });

  // serve                    - Compile site assets, serve site
  //    [--test]              - run unit tests concurrently
  //    [--no-install-deps]   - Skip dependency installation.
  grunt.registerTask('serve', 'Compile, serve, optionally run tests', function(){
    if(! grunt.option('no-install-deps')){
      grunt.task.run([
        'npm-install',
      ]);
    }

    grunt.task.run([
      'clean:dev',
      'wiredep:dev',
      'wiredep:devSCSS',
    ]);

    if(grunt.option('test')){
      grunt.task.run([
        'wiredep:test',
        'concurrent:test'
      ]);
    } else {
      grunt.task.run([
        'concurrent:dev'
      ]);
    }
  });

  // default task   - run by grunt when no task is specified
  grunt.registerTask('default', 'serve');
};
