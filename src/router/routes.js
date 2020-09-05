const routes = [
  /* authentication routes and route guard are registered inside boot file */
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { auth: true },
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: 'dashboard', component: () => import('pages/Dashboard.vue') },
      { path: '/me', component: () => import('pages/Me.vue') },
      { path: '/projects', component: () => import('pages/Project.vue') },
      {
        path: '/projects/:project',
        component: () => import('layouts/ProjectLayout.vue'),
        children: [
          {
            path: '',
            component: () => import('pages/Project/Index.vue'),
            meta: { label: 'Übersicht' },
          },
          {
            path: 'boqs',
            component: () => import('pages/Project/Boqs.vue'),
            meta: { label: 'Leistungsverzeichnisse' },
          },
        ],
      },
    ],
  },
  {
    path: '*',
    component: () => import('pages/Error404.vue'),
  },
];

export default routes;
