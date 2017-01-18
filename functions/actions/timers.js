const functions = require('firebase-functions');
const _ = require('lodash');
const utils = require('../services/utils');
const md5 = require('md5');

module.exports = function (e) {
  var env = require('../services/environment');
  var timer = e.data.val();
  var key = e.params.key;
  var uid = e.params.uid;
  var searchRef = e.data.adminRef.root.child(env.model.admin.search.timers).child(key);
  var accountRef = e.data.adminRef.root.child(utils.replaceWildcard(env.model.user.read.account, 'uid', uid));
  var timersRef = e.data.adminRef.root.child(utils.replaceWildcard(env.model.user.owned.state, 'uid', uid)).child('timers');
  var md5Hash = md5(JSON.stringify(_.omit(timer, ['uid', 'updated']))).replace(/\//, '|');

  console.log(key, timer ? timer.name : 'remove me!');
  if (!timer || timer.private) {
    // console.log('removing', key);
    return searchRef.remove();
  }

  if (!timer.owned || timer.copy) {
    // console.log('skipping', timer.name);
    return true;
  }

  return accountRef.once('value')
    .then(function(snap) {
      var account = snap.val();
      timer.email = account.email;
      timer.displayName = account.displayName;
      timer.photoUrl = account.photoUrl;
      timer.uid = uid;
      timer.md5Hash = md5Hash;
      timer = utils.cleanObject(timer);

      return searchRef.parent.orderByChild('md5Hash').equalTo(timer.md5Hash).once('value');
    })
    .then(function(snap) {
      if (snap.val() && !~Object.keys(snap.val()).indexOf(key)) return true; // Skip records with matching hashes
      // console.log('set', timer.name, key);
      return searchRef.set(_.omit(timer, ['owned', 'private']));
    })
    .then(function() {
      return Promise.all([
        searchRef.parent.orderByChild('uid').equalTo(uid).once('value'),
        timersRef.once('value')
      ]);
    })
    .then(function(values) {
      var searchKeys = Object.keys(values[0].val() || {});
      var userKeys = Object.keys(values[1].val() || {});
      var toRemove = _.difference(searchKeys, userKeys);
      var updates = toRemove.reduce(function(updates, key) {
        return updates[key] = null, updates;
      }, {});
      // console.log('updates', updates);
      searchRef.parent.update(updates);
    })

    // .then(function() {
    //   if (!timer.default) return true;

    //   var defaultsRef = e.data.adminRef.root.child(env.model.public.defaults.timers + '/' + e.params.key);
    //   defaultsRef.update(timer);
    // });
  
};