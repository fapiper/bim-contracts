export default ({ router, store, Vue }) => {
  /**
   * Register auth store
   */
  // This is already done inside index file of store -> store.registerModule('auth', auth);

  /**
   * Register route authentication guard
   */
  router.beforeEach(async (to, from, next) => {
    const record = to.matched.find((record) => record.meta.auth);
    if (record && record.meta.auth) {
      if (store.getters['auth/loggedIn']) {
        next();
      } else {
        const fetched = await store.dispatch('auth/fetch');
        if (!fetched) {
          next('/auth/login');
        } else {
          next();
        }
      }
    } else {
      next();
    }
  });

  /**
   * Set authentication routes
   */
  const routes = {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: 'login', component: () => import('pages/Auth/Login.vue') },
      { path: 'register', component: () => import('pages/Auth/Register.vue') },
      {
        path: '*',
        component: () => import('pages/Error404.vue'),
      },
    ],
  };
  router.addRoutes([routes]);

  const auth = {};
  auth.register = (data) => {
    return store.dispatch('auth/register', data);
  };
  auth.loggedIn = () => {
    return store.getters['auth/loggedIn'];
  };
  auth.check = (roles) => {
    return store.getters['auth/check'](roles);
  };
  auth.login = (data) => {
    return store.dispatch('auth/login', data);
  };
  auth.setKey = (user) => {
    return store.dispatch('auth/setKey', user);
  };
  auth.logout = () => {
    return store.dispatch('auth/logout');
  };
  auth.fetch = () => {
    return store.dispatch('auth/fetch');
  };
  auth.user = () => {
    return store.getters['auth/user'];
  };
  Vue.prototype.$auth = auth;
};
