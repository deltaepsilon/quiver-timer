var fs = require('fs');

var serviceWorker = fs.readFileSync('./build/unbundled/service-worker.js', 'utf8');

var editedServiceWorker = serviceWorker.replace(/index\.html/g, 'cast.html');

fs.writeFileSync('./build/bundled/service-worker-cast.js', editedServiceWorker, 'utf8');
fs.writeFileSync('./build/unbundled/service-worker-cast.js', editedServiceWorker, 'utf8');
