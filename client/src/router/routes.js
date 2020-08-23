const routes = [
  /* authentication routes and route guard are registered inside boot file */
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { auth: true },
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: 'dashboard', component: () => import('pages/Dashboard.vue') },
      { path: '/projects', component: () => import('pages/Project.vue') },
      {
        path: '/projects/:project',
        component: () => import('layouts/ProjectLayout.vue'),
        children: [
          { path: 'boqs', component: () => import('pages/Project/Boqs.vue') },
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
