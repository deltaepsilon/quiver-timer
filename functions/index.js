const functions = require('firebase-functions');
const specs = require('./specs');

specs.forEach(function (spec) {
  var path = `/timer/production` + spec.path;
  console.log(`Exporting ${spec.name} on ${path}`);
  exports[spec.name] = functions.database().path(path).onWrite(spec.func);
});