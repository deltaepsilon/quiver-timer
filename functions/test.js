var axios = require('axios');
var env = require('./services/environment');
var admin = require('firebase-admin');
admin.initializeApp({
  databaseURL: env.firebaseConfig.databaseURL,
  credential: admin.credential.cert(env.firebaseConfig.serviceAccount)
});

var sitemapRef = admin.database().ref(env.model.admin.queues.sitemap);
var logsRef = admin.database().ref(env.model.admin.logs.sitemap);
var sitemapPostUrl = sitemapRef.toString() + '.json?auth=' + env.firebaseConfig.secret;

axios.post(sitemapRef.toString() + '.json?auth=' + env.firebaseConfig.secret, {})
  .then(function(res) {
    console.log('res.data', res.data);
  });
