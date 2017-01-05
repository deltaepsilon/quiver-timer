const functions = require('firebase-functions');
const _ = require('lodash');
const utils = require('../services/utils');
const md5 = require('md5');


module.exports = function (e) {
  var env = require('../services/environment');
  var timer = e.data.val();
  var searchRef = e.data.adminRef.root.child(env.model.admin.search.timers).child(e.params.key);

  if (!timer || timer.private) return searchRef.remove()
    .then(function() {
      console.log('removed', e.params.key);
    });

  if (!timer.owned || timer.copy) return true;

  return searchRef.update(_.omit(timer, ['owned', 'private']));
};