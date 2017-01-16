const functions = require('firebase-functions');
const specs = require('./specs');

specs.filter(function(spec) {
  return spec.path;
}).forEach(function (spec) {
  var path = `/timer/production` + spec.path;
  console.log(`Exporting ${spec.name} on ${path}`);
  exports[spec.name] = functions.database().path(path).onWrite(spec.func);
});

specs.filter(function(spec) {
  return !spec.path;
}).forEach(function (spec) {
  console.log(`Exporting ${spec.name} on http`);
  exports[spec.name] = functions.https().onRequest(spec.func);
});