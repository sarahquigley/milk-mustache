module.exports = function(config){
  config.set({

    basePath : './',

    // List of files/patterns to load in the browser
    files : [
      // bower:js
      'app/bower_components/lodash/lodash.js',
      // endbower
      '.dev/main.js',
      'app/**/*.spec.js',
    ],

    // Enable watching files and executing the tests whenever one of the above files changes
    autoWatch : true,

    frameworks: [
      'jasmine',
      'jasmine-matchers'
    ],

    // List of browsers to launch and capture
    browsers : [
      'Chrome',
      'PhantomJS',
    ],

    plugins : [
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-phantomjs-launcher',
      'karma-jasmine',
      'karma-jasmine-matchers',
      'karma-jasmine-html-reporter',
      'karma-mocha-reporter',
      'karma-babel-preprocessor',
      'karma-coverage',
      'karma-coveralls',
    ],

    // List of reporters to use
    reporters: [
      'html',
      'mocha',
      'coverage',
    ],

    // Preprocessors to use
    preprocessors: {
      'app/**/*.spec.js': 'babel',
      '.dev/main.js': 'coverage',
    },

    coverageReporter: {
      type: 'lcov',
      dir: 'coverage/'
    },

    babelPreprocessor: {
      options: {
        presets: ['es2015'],
        sourceMap: 'inline'
      },
      filename: function (file) {
        return file.originalPath.replace(/\.js$/, '.es5.js');
      },
      sourceFileName: function (file) {
        return file.originalPath;
      }
    }

  });

  if (process.env.TRAVIS) {
    config.reporters.push('coveralls');
  }
};
