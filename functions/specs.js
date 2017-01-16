module.exports = [
  {
    name: 'login',
    path: '/user/write/login/{uid}',
    func: require('./actions/login')
  },
  {
    name: 'email',
    path: '/admin/queues/email/{key}',
    func: require('./actions/email')
  },
  {
    name: 'timers',
    path: '/user/owned/state/{uid}/timers/{key}',
    func: require('./actions/timers')
  },
  {
    name: 'search',
    path: '/admin/search/timers/{key}',
    func: require('./actions/timers-search')
  },
  {
    name: 'sitemap',
    endpoint: 'https://us-central1-quiver-timer.cloudfunctions.net/sitemap',
    func: require('./actions/timers-search')
  }
];