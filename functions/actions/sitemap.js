const functions = require('firebase-functions');

module.exports = function (req, res, db) {
  var Readable = require('stream').Readable;
  var _ = require('lodash');
  var sm = require('sitemap');
  var env = require('../services/environment');
  var sitemapConfig = _.clone(env.sitemap);
  var gcloud = require('google-cloud');
  var gcs = gcloud.storage(env.googleCloud);
  var bucket = gcs.bucket(env.googleCloud.bucket);
  var file = bucket.file(env.sitemap.filename);
  var database = functions.database() && functions.database().ref ? functions.database() : db;
  var timersRef = database.ref(env.model.admin.search.timers);


  return timersRef.once('value')
    .then(function (snap) {
      snap.forEach(function (timerSnap) {
        var timer = timerSnap.val();
        var key = timerSnap.key;
        sitemapConfig.urls.push({
          url: '/public/' + key + '/' + timer.slug,
          changefreq: 'daily',
          priority: 0.7
        });

      });

      return new Promise(function (resolve, reject) {
        sm.createSitemap(sitemapConfig).toXML((err, xml) => err ? reject(err) : resolve(xml));
      });
    })
    .then(function (xml) {
      return new Promise(function (resolve, reject) {
        var s = new Readable();

        s.pipe(file.createWriteStream())
          .on('error', err => reject(err))
          .on('finish', res => resolve(res));

        s.push(xml);
        s.push(null);
      });
    })
    .then(function () {
      return new Promise(function (resolve, reject) {
        file.acl.add({
          entity: 'allUsers',
          role: gcs.acl.READER_ROLE
        }, (err, res) => err ? reject(err) : resolve(res));
      });
    })
    .then(function () {
      return new Promise(function (resolve, reject) {
        file.setMetadata(env.sitemap.metadata, (err, res) => err ? reject(err) : resolve(res));
      });
    })
    .catch(function (err) {
      console.log('error', err);
    });
};