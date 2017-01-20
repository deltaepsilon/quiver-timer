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
    path: '/admin/queues/sitemap/{key}',
    func: require('./actions/sitemap')
  },
  {
    name: 'feedback',
    path: '/user/write/feedback/{key}',
    func: require('./actions/feedback')
  }
];