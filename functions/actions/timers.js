const functions = require('firebase-functions');
const _ = require('lodash');
const utils = require('../services/utils');
const md5 = require('md5');


module.exports = function (e) {
  var env = require('../services/environment');
  var timer = e.data.val();
  var searchRef = e.data.adminRef.root.child(env.model.admin.search.timers).child(e.params.key);
  var accountRef = e.data.adminRef.root.child(utils.replaceWildcard(env.model.user.read.account, 'uid', e.params.uid));
  var md5Hash = md5(JSON.stringify(_.omit(timer, ['uid', 'updated']))).replace(/\//, '|');

  console.log(e.params.key, timer ? timer.name : 'remove me!');
  if (!timer || timer.private) {
    console.log('removing', e.params.key);
    return searchRef.remove();
  } 

  if (!timer.owned || timer.copy) {
    console.log('skipping', timer.name);
    return true;
  }

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
      console.log('updating', timer.name, e.params.key);
      return searchRef.update(_.omit(timer, ['owned', 'private']));
    })
    // .then(function() {
    //   if (!timer.default) return true;

    //   var defaultsRef = e.data.adminRef.root.child(env.model.public.defaults.timers + '/' + e.params.key);
    //   defaultsRef.update(timer);
    // });
  
};