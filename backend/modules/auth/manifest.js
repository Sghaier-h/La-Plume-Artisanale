export default {
  name: 'auth',
  version: '1.0.0',
  description: 'Module Authentification - Login, logout, session',
  category: 'base',
  depends: [],
  routes: [
    'routes/auth.routes.js'
  ],
  apiPaths: {
    'routes/auth.routes.js': '/api/auth'
  },
  active: true
};
