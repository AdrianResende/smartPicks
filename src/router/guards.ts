import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';

export const requireAuth = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
): Promise<void> => {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated) {
    await authStore.validateToken();
  }

  if (authStore.isAuthenticated) {
    next();
  } else {
    next({
      path: '/',
      query: { redirect: to.fullPath },
    });
  }
};

export const requireGuest = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
): Promise<void> => {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated) {
    await authStore.validateToken();
  }

  if (authStore.isAuthenticated) {
    next('/dashboard');
  } else {
    next();
  }
};

export const requireAdmin = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
): Promise<void> => {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated) {
    await authStore.validateToken();
  }

  if (authStore.isAuthenticated && authStore.user?.perfil === 'admin') {
    next();
  } else {
    next('/acesso-negado');
  }
};

export const initializeAuth = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
): Promise<void> => {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated) {
    try {
      await authStore.initialize();
    } catch (error) {
      console.error('Erro na inicialização da autenticação:', error);
    }
  }

  next();
};
