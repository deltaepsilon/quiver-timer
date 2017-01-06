const functions = require('firebase-functions');
const _ = require('lodash');
const utils = require('../services/utils');
const md5 = require('md5');


module.exports = function (e) {
  var env = require('../services/environment');
  var timer = e.data.val();
  var searchRef = e.data.adminRef.root.child(env.model.admin.search.timers).child(e.params.key);
  var accountRef = e.data.adminRef.root.child(utils.replaceWildcard(env.model.user.read.account, 'uid', e.params.uid));
  var md5Hash = md5(_.omit(timer, ['uid', 'updated'])).replace(/\//, '|');

  if (!timer || timer.private) return searchRef.remove();

  if (!timer.owned || timer.copy) return true;

  return accountRef.once('value')
    .then(function(snap) {
      var account = snap.val();
      timer.email = account.email;
      timer.displayName = account.displayName;
      timer.photoUrl = account.photoUrl;
      timer.uid = e.params.uid;
      timer.md5Hash = md5Hash;
      timer = utils.cleanObject(timer);

      return searchRef.parent.orderByChild('md5Hash').equalTo(timer.md5Hash).once('value');
    })
    .then(function(snap) {
      if (snap.val() && !~Object.keys(snap.val()).indexOf(e.params.key)) return true;
      return searchRef.update(_.omit(timer, ['owned', 'private']));
    });
  
};