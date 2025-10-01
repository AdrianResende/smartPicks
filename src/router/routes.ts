import type { RouteRecordRaw } from 'vue-router';
import { requireAuth, requireGuest } from './guards';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('pages/LoginPage.vue'),
        beforeEnter: requireGuest,
      },
      {
        path: 'cadastro',
        name: 'cadastro',
        component: () => import('pages/CadastroPage.vue'),
        beforeEnter: requireGuest,
      },
    ],
  },

  {
    path: '/dashboard',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: requireAuth,
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('pages/DashboardPage.vue'),
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
