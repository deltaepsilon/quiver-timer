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
  }
];