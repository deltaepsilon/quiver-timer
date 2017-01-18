const functions = require('firebase-functions');

module.exports = function (e) {
  if (!e || !e.data || !e.data.val()) return;

  var Readable = require('stream').Readable;
  var _ = require('lodash');
  var sm = require('sitemap');
  var env = require('../services/environment');
  var sitemapConfig = _.clone(env.sitemap);
  var gcloud = require('google-cloud');
  var gcs = gcloud.storage(env.googleCloud);
  var bucket = gcs.bucket(env.googleCloud.bucket);
  var file = bucket.file(process.env.NODE_ENV + '/' + env.sitemap.filename);
  var logsRef = e.data.ref.root.child(env.model.admin.logs.sitemap);
  var timersRef = e.data.ref.root.child(env.model.admin.search.timers);

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
          .on('error', err => console.log(err))
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
    .then(function () {
      return e.data.ref.remove();
    })
    .then(function () {
      return file.getSignedUrl({
        action: 'read',
        expires: '1-1-' + (new Date().getFullYear() + 10)
      })
        .then(function(urls) {
          return urls[0];
        });
    })
    .then(function (url) {
      return e.data.ref.root.child(env.model.admin.logs.sitemap).push({
        timestamp: new Date().toString(),
        url: url
      });
    })
    .then(function() {
      return true;
    })
    .catch(function (err) {
      return new Promise(function (resolve, reject) {
        gcs.getCredentials((err, credentials) => err ? reject(err) : resolve(credentials));
      })
        .then(function (credentials) {
          return e.data.ref.root.child(env.model.admin.logs.sitemap).push({
            timestamp: new Date().toString(),
            credentials: credentials,
            error: err.toString()
          });
        });
    })
    .catch(function (err) {
      return e.data.ref.root.child(env.model.admin.logs.sitemap).push({
        timestamp: new Date().toString(),
        credentials: 'failed to acquire credentials',
        error: err.toString()
      });
    });
};