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

export const validateUrl = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
): void => {
  // Lista de rotas válidas
  const validPaths = [
    '/',
    '/cadastro',
    '/dashboard',
    '/admin',
    '/acesso-negado'
  ];

  // Verificar se a rota de destino é válida
  const isValidPath = validPaths.includes(to.path) || to.matched.length > 0;

  if (!isValidPath) {
    // Redirecionar para a página inicial se a rota não for válida
    console.warn(`Tentativa de acesso a rota inválida: ${to.path}`);
    next('/');
    return;
  }

  next();
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
