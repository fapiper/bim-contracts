const isArrayOrString = (variable) =>
  typeof variable === typeof [] || typeof variable === typeof '';

export default ({ app, router, store, Vue }) => {
  /**
   * Register auth store
   */
  // This is already done inside index file of store -> store.registerModule('auth', auth);

  /**
   * Register route authentication guard
   */
  router.beforeEach(async (to, from, next) => {
    const record = to.matched.find((record) => record.meta.auth);
    if (record) {
      await store.dispatch('auth/fetch');
      if (!store.getters['auth/loggedIn']) {
        console.log('Not logged in');
        next('/auth/login');
      } else if (
        isArrayOrString(record.meta.auth) &&
        !store.getters['auth/check'](record.meta.auth)
      ) {
        next('/dashboard');
      }
    }
    next();
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

  const helper = {};
  helper.register = (data) => {
    return store.dispatch('auth/register', data);
  };
  helper.loggedIn = () => {
    return store.getters['auth/loggedIn'];
  };
  helper.check = (roles) => {
    return store.getters['auth/check'](roles);
  };
  helper.login = (data) => {
    return store.dispatch('auth/login', data);
  };
  helper.setToken = (user) => {
    return store.dispatch('auth/setToken', user);
  };
  helper.logout = () => {
    return store.dispatch('auth/logout');
  };
  helper.verify = (user) => {
    return store.dispatch('auth/verify', user);
  };
  helper.fetch = () => {
    return store.dispatch('auth/fetch');
  };
  helper.user = () => {
    return store.getters['auth/user'];
  };
  Vue.prototype.$auth = helper;
};
