const functions = require('firebase-functions');
const _ = require('lodash');
const utils = require('../services/utils');

module.exports = function (e) {
  var env = require('../services/environment');
  var environment = process.env.NODE_ENV;
  var uid = e.data.key;
  var user = e.data.val();

  if (!user) return Promise.resolve();

  if (user.isAnonymous) return e.data.ref.remove();

  function isTimeToVerify(verification) {
    if (!verification) return true;
    return (new Date().getTime() - new Date(verification).getTime()) / 86400000 > env.admin.emailVerificationFrequencyInDays;
  };

  var accountRef = e.data.adminRef.root.child(utils.replaceWildcard(env.model.user.read.account, 'uid', uid));
  var notificationsRef = e.data.adminRef.root.child(utils.replaceWildcard(env.model.user.owned.notifications, 'uid', uid));
  var emailRef = e.data.adminRef.root.child(env.model.admin.queues.email);
  user.serverTimestamp = new Date().toString();
  user.clientTimestamp = user.timestamp;

  if (~env.admin.emails.indexOf(user.email)) {
    user.isAdmin = true;
  } else {
    user.isAdmin = null;
  }

  return accountRef.once('value')
    .then(function (snap) {
      var account = snap.val() || {};
      user.loginCount = (account.loginCount || 0) + 1;
      user.lastVerification = account.lastVerification || false;
      if (!user.emailVerified && isTimeToVerify(account.lastVerification)) {
        user.lastVerification = new Date().toString();
        notificationsRef.push({
          type: 'action',
          icon: '📫', 
          action: 'send-verification-email',
          message: 'Send notification email'
        });
      }
      return accountRef.update(user);
    })
    .then(function() {
      if (!user.emailVerified) return true;
      return accountRef.once('value')
        .then(function(snap) {
          var account = snap.val();
          if (account.addedToEmailList) return true;
          return  emailRef.push(account);
        });
    })
    .then(function () {
      return e.data.ref.remove();
    });
};