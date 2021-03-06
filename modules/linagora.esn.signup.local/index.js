'use strict';

var AwesomeModule = require('awesome-module'),
    Dependency = AwesomeModule.AwesomeModuleDependency,
    path = require('path');

const moduleFiles = [
  'app.js',
  'signup-form/signup-form.js',
  'signup-finalize/signup-finalize.js',
  'signup-confirm/signup-confirm.js'
];
const FRONTEND_JS_PATH = `${__dirname}/frontend/app/`;

module.exports = new AwesomeModule('linagora.esn.signup.local', {
  dependencies: [
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.webserver.wrapper', 'webserver-wrapper'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.invitation', 'invitation'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.email', 'email'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.logger', 'logger'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.i18n', 'i18n')
  ],

  states: {
    lib: (dependencies, callback) => callback(null, require('./backend/lib')(dependencies)),
    deploy: (dependencies, callback) => {
      var app = require('./backend/webserver')(dependencies, this),
        server = dependencies('webserver-wrapper'),
        lessFile = path.resolve(__dirname, './frontend/app/styles.less');

      server.injectAngularAppModules('signup', moduleFiles, ['linagora.esn.signup'], ['welcome'], {
        localJsFiles: moduleFiles.map(file => path.join(FRONTEND_JS_PATH, file))
      });
      server.injectLess('signup', [lessFile], 'welcome');
      server.addApp('signup', app);

      return callback();
    },
    start: (dependencies, callback) => callback()
  }
});
