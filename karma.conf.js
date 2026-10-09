module.exports = function (config) {
  config.set({
    basePath: '',

    frameworks: ['jasmine'],

    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
    ],

    client: {
      jasmine: {
      },
    },

    jasmineHtmlReporter: {
      suppressAll: true
    },

    coverageReporter: {
      dir: require('path').join(
        __dirname,
        './coverage/frontcanchasdeportivas'
      ),
      subdir: '.',

      reporters: [
        { type: 'html' },
        { type: 'lcovonly' },
        { type: 'cobertura' },
        { type: 'text-summary' }
      ]
    },

    reporters: [
      'progress',
      'kjhtml'
    ],

    browsers: ['Chrome'],

    restartOnFileChange: true
  });
};