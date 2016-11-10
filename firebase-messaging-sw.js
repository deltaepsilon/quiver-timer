importScripts('/bower_components/firebase/firebase-app.js');
importScripts('/bower_components/firebase/firebase-messaging.js');
importScripts('/bower_components/lodash/lodash.js');

fetch('/env.client.json')
  .then(function(res) {
    return res.json();
  })
  .then(function(rawEnv) {
    var env = _.merge(rawEnv.defaults, rawEnv[location.hostname.split('.').join(':')]);

    firebase.initializeApp(env.firebaseConfig);
    
    const messaging = firebase.messaging();
  });