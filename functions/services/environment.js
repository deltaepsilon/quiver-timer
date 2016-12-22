var functions = require('firebase-functions');

function normalizeModel(model, env) {
  var keys = Object.keys(model);
  var i = keys.length;
  var result = {};

  while (i--) {
    let key = keys[i];
    let item = model[key];
    result[key] = typeof item == 'string' ? env.firebaseConfig.root + `/${process.env.NODE_ENV}` + item : normalizeModel(item, env);
  }
  return result;
};

try {
  functions.env.model = normalizeModel(functions.env.model, functions.env);
  module.exports = functions.env;
} catch (e) {
  let env = JSON.parse(require('fs').readFileSync('../env.server.json', 'utf8'));
  let model = JSON.parse(require('fs').readFileSync('../env.client.json', 'utf8')).model;
  env.model = normalizeModel(model, env);
  module.exports = env;
}