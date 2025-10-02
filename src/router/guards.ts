import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';

export const requireAuth = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
): Promise<void> => {
  const authStore = useAuthStore();

  // Só valida o token se ainda não estiver autenticado (evita invalidação logo após login)
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

  // Evita chamada desnecessária se já estiver autenticado
  if (!authStore.isAuthenticated) {
    await authStore.validateToken();
  }

  if (authStore.isAuthenticated) {
    next('/dashboard');
  } else {
    next();
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
