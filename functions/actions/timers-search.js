module.exports = function (e) {
  const _ = require('lodash');
  const utils = require('../services/utils');
  const md5 = require('md5');
  const env = require('../services/environment');
  const FirebaseSearch = require('quiver-firebase-search');
  var timer = e.data.val();
  var key = e.data.key;
  var timersRef = e.data.ref.parent;
  var indexName = 'quiver-timer:' + process.env.NODE_ENV + ':timers';
  var firebaseSearch = new FirebaseSearch(timersRef, {
    algolia: env.algolia
  }, indexName);


  if (!timer) {
    return firebaseSearch.algolia.exists()
      .then(function (exists) {
        if (exists) {
          return new Promise(function (resolve, reject) {
            firebaseSearch.algolia.index.getObject(key, function (err, content) {
              return err ? reject(err) : resolve(content);
            });
          });
        }
      })
      .then(function () {
        return firebaseSearch.algolia.deleteObject(key);
      });
  } else {
    var searchTimer = _.omit(timer, ['periods', 'uid', 'tags', 'totalSeconds', 'updated', 'md5Hash']);
    searchTimer.objectID = key;
    searchTimer.minutes = Math.floor(timer.totalSeconds / 60);
    searchTimer.seconds = Math.round(timer.totalSeconds / 60 % 1 * 60);

    return firebaseSearch.algolia.exists()
      .then(function (exists) {
        if (exists) {
          return new Promise(function (resolve, reject) {
            firebaseSearch.algolia.index.getObject(key, function (err, content) {
              return err ? reject(err) : resolve(content);
            });
          });
        } else {
          return Promise.reject();
        }
      })
      .then(function (record) {
        if (_.isEqual(record, searchTimer)) return true;
        return firebaseSearch.algolia.saveObject(searchTimer);
      })
      .catch(function () {
        return firebaseSearch.algolia.addObject(searchTimer);
      });
  }

};