import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import { toast } from 'vue3-toastify';

interface User {
  id: number;
  name: string;
  email: string;
  perfil: 'usuario' | 'admin';
}

interface LoginAttempt {
  email: string;
  attempts: number;
  lastAttempt: Date;
  blockedUntil?: Date;
}

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isLoading = ref(false);
  const loginAttempts = ref<Map<string, LoginAttempt>>(new Map());

  // Configurações de segurança
  const MAX_LOGIN_ATTEMPTS = 5;
  const BLOCK_DURATION_MINUTES = 15;

  // Computed
  const isAuthenticated = computed(() => !!user.value && !!token.value);
  const isAdmin = computed(() => user.value?.perfil === 'admin');
  const isUsuario = computed(() => user.value?.perfil === 'usuario');

  // Métodos de controle de tentativas de login
  const getClientFingerprint = (): string => {
    // Simples identificação baseada em IP/sessão (em produção use biblioteca mais robusta)
    return `${navigator.userAgent}-${window.location.host}`;
  };

  const isBlocked = (email: string): boolean => {
    const fingerprint = `${email}-${getClientFingerprint()}`;
    const attempt = loginAttempts.value.get(fingerprint);

    if (!attempt) return false;

    if (attempt.blockedUntil && new Date() < attempt.blockedUntil) {
      return true;
    }

    // Remove bloqueio expirado
    if (attempt.blockedUntil && new Date() >= attempt.blockedUntil) {
      loginAttempts.value.delete(fingerprint);
      return false;
    }

    return attempt.attempts >= MAX_LOGIN_ATTEMPTS;
  };

  const registerFailedAttempt = (email: string): void => {
    const fingerprint = `${email}-${getClientFingerprint()}`;
    const now = new Date();
    const existing = loginAttempts.value.get(fingerprint);

    if (existing) {
      existing.attempts++;
      existing.lastAttempt = now;

      if (existing.attempts >= MAX_LOGIN_ATTEMPTS) {
        existing.blockedUntil = new Date(now.getTime() + BLOCK_DURATION_MINUTES * 60 * 1000);
        toast.error(
          `Muitas tentativas falharam. Tente novamente em ${BLOCK_DURATION_MINUTES} minutos.`,
        );
      }
    } else {
      loginAttempts.value.set(fingerprint, {
        email,
        attempts: 1,
        lastAttempt: now,
      });
    }
  };

  const clearFailedAttempts = (email: string): void => {
    const fingerprint = `${email}-${getClientFingerprint()}`;
    loginAttempts.value.delete(fingerprint);
  };

  const getRemainingBlockTime = (email: string): number => {
    const fingerprint = `${email}-${getClientFingerprint()}`;
    const attempt = loginAttempts.value.get(fingerprint);

    if (!attempt?.blockedUntil) return 0;

    const remaining = attempt.blockedUntil.getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(remaining / 1000 / 60)); // minutos
  };

  // Sanitização de dados
  const sanitizeInput = (input: string): string => {
    if (!input) return '';

    return input
      .replace(/[<>'"&]/g, (char) => {
        const entities: Record<string, string> = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;',
        };
        return entities[char] || char;
      })
      .trim();
  };

  // Validação de token
  const validateToken = async (): Promise<boolean> => {
    const storedToken = localStorage.getItem('smartpicks_token');
    const storedUser = localStorage.getItem('smartpicks_user');

    if (!storedToken || !storedUser) {
      return false;
    }

    try {
      // Validar token com o backend
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      const response = await api.get('/auth/validate');

      if (response.data?.valid) {
        token.value = storedToken;
        user.value = JSON.parse(storedUser);
        return true;
      }
    } catch (error) {
      console.error('Token inválido:', error);
      await logout();
    }

    return false;
  };

  // Login
  const login = async (email: string, password: string): Promise<boolean> => {
    // Sanitizar inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);

    // Verificar se está bloqueado
    if (isBlocked(sanitizedEmail)) {
      const remainingTime = getRemainingBlockTime(sanitizedEmail);
      toast.error(`Conta temporariamente bloqueada. Tente novamente em ${remainingTime} minutos.`);
      return false;
    }

    try {
      isLoading.value = true;

      const response = await api.post('/auth/login', {
        email: sanitizedEmail,
        password: sanitizedPassword,
      });

      if (response.data?.user && response.data?.token) {
        // Limpar tentativas falhadas
        clearFailedAttempts(sanitizedEmail);

        // Armazenar dados do usuário
        user.value = response.data.user;
        token.value = response.data.token;

        // Persistir no localStorage
        localStorage.setItem('smartpicks_token', response.data.token);
        localStorage.setItem('smartpicks_user', JSON.stringify(response.data.user));

        // Configurar header de autorização
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        toast.success(response.data?.message || 'Login realizado com sucesso!');
        return true;
      }

      return false;
    } catch (error) {
      // Registrar tentativa falhada
      registerFailedAttempt(sanitizedEmail);

      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Não foi possível realizar o login.';
      toast.error(message);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      // Notificar o backend sobre o logout (opcional)
      if (token.value) {
        await api.post('/auth/logout').catch(() => {
          // Ignorar erros de logout no backend
        });
      }
    } finally {
      // Limpar estado local
      user.value = null;
      token.value = null;

      // Limpar localStorage
      localStorage.removeItem('smartpicks_token');
      localStorage.removeItem('smartpicks_user');

      // Remover header de autorização
      delete api.defaults.headers.common['Authorization'];

      toast.info('Logout realizado com sucesso!');
    }
  };

  // Regenerar ID da sessão (simular)
  const regenerateSessionId = (): void => {
    // Em uma aplicação real, isso seria feito no backend
    // Aqui apenas limpamos dados sensíveis do sessionStorage
    sessionStorage.clear();
  };

  // Inicialização
  const initialize = async (): Promise<void> => {
    try {
      await validateToken();
    } catch (error) {
      console.error('Erro na inicialização da autenticação:', error);
      await logout();
    }
  };

  return {
    // Estado
    user: computed(() => user.value),
    token: computed(() => token.value),
    isLoading: computed(() => isLoading.value),
    isAuthenticated,
    isAdmin,
    isUsuario,

    // Métodos
    login,
    logout,
    validateToken,
    initialize,
    sanitizeInput,
    isBlocked,
    getRemainingBlockTime,
    regenerateSessionId,
  };
});
