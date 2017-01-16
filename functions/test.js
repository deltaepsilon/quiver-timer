var env = require('./services/environment');
var admin = require('firebase-admin');
var sitemap = require('./actions/sitemap');

admin.initializeApp({
  databaseURL: env.firebaseConfig.databaseURL,
  credential: admin.credential.cert(env.firebaseConfig.serviceAccount)  
});

sitemap(null, null, admin.database());