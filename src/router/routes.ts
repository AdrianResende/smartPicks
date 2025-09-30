import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('pages/LoginPage.vue'),
      },
      {
        path: 'cadastro',
        name: 'cadastro',
        component: () => import('pages/CadastroPage.vue'),
      },
      {
        path: 'test',
        name: 'test',
        component: () => import('pages/TestPage.vue'),
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    name: 'error',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
