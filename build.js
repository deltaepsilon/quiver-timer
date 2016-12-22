const fs = require('fs');
const serverEnv = require('./env.server.json');
const clientEnv = require('./env.client.json');
const firebaseTools = require('firebase-tools');
const firebaseToolsOptions = {
  project: serverEnv.firebaseConfig.project,
  token: serverEnv.firebaseConfig.token
};

function getEnvCommands(env, path = []) {
  if (!env) {
    return [path.join('.')];
  }
  var keys = Object.keys(env);
  var i = keys.length;
  var commands = [];

  while (i--) {
    if (env[keys[i]] && typeof env[keys[i]] == 'object' && !Object.keys(env[keys[i]]).length) {
      commands.push(`${path.concat(keys[i]).join('.')}="undefined"`);
    } else if (typeof env[keys[i]] == 'string') {
      commands.push(`${path.concat(keys[i]).join('.')}="${env[keys[i]]}"`);
    } else {
      commands = commands.concat(getEnvCommands(env[keys[i]], path.concat(keys[i])));
    }
  }
  return commands;
};

serverEnv.model = clientEnv.model;


firebaseTools.env.get([], firebaseToolsOptions)
  .then(function(env) {
   var commands = getEnvCommands(env).map(function(command) {
      return command.split('=')[0];
    }).filter(function(command) {
      return command.split('.')[0] != 'firebase';
    });
   if (!commands.length) return true;
   return firebaseTools.env.unset(commands, firebaseToolsOptions);
  })
  .then(function() {
    var commands = getEnvCommands(serverEnv);
    return firebaseTools.env.set(commands, firebaseToolsOptions)  
  })
  .then(function() {
    return firebaseTools.env.get([], firebaseToolsOptions);
  })
  .then(function(env) {
    console.log("env set:\n\n", env);
    process.exit();
  })
  .catch(function(err) {
    console.log('error', err);
  });