import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import type { RouterHistory } from 'vue-router';
import routes from './routes';
import { initializeAuth } from './guards';


export default defineRouter(function (/* { store, ssrContext } */) {
  const mode = process.env.VUE_ROUTER_MODE || 'hash';
  const base = process.env.VUE_ROUTER_BASE || '/';

  let history: RouterHistory;

  if (mode === 'history') {
    history = createWebHistory(base);
  } else if (mode === 'hash') {
    history = createWebHashHistory(base);
  } else {
    history = createMemoryHistory(base);
  }

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history,
  });

  Router.beforeEach(initializeAuth);

  return Router;
});
