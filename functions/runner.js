const env = require('./services/environment');
const specs = require('./specs');
const LocalFunctions = require('firebase-local-functions');
const functions = require('firebase-functions');

new LocalFunctions({
  specs: specs.filter(function(spec) {
    return spec.path
  }),
  firebaseConfig: env.firebaseConfig,
  path: 'timer/development',
  params: {
    environment: 'development'
  }
});