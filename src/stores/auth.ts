import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';
import { toast } from 'vue3-toastify';

interface User {
  id: number;
  nome: string;
  email: string;
  perfil: 'user' | 'admin';
  cpf?: string;
  data_nascimento?: string;
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
  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.perfil === 'admin');

  // Métodos de controle de tentativas de login
  const getClientFingerprint = (): string => {
    // Simples identificação baseada em IP/sessão (em produção use biblioteca mais robusta)
    return `${navigator.userAgent}-${window.location.host}`;
  };

  const isBlocked = (email: string): boolean => {
    const fingerprint = `${email}-${getClientFingerprint()}`;
    const attempt = loginAttempts.value.get(fingerprint);

    if (!attempt) return false;

    // Remove bloqueio expirado
    if (attempt.blockedUntil) {
      if (new Date() < attempt.blockedUntil) return true;
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
    const lastEmail = localStorage.getItem('smartpicks_last_login_email');

    const emailToValidate = storedUser ? JSON.parse(storedUser).email : lastEmail;
    if (!emailToValidate) return false;

    try {
      if (storedToken) {
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }

      const response = await api.get('/users/permissions', {
        params: { email: emailToValidate },
      });

      const responseUser = response.data?.user || response.data;
      if (responseUser) {
        user.value = responseUser;
        localStorage.setItem('smartpicks_user', JSON.stringify(responseUser));
      } else if (storedUser) {
        user.value = JSON.parse(storedUser);
      }

      if (storedToken) token.value = storedToken;
      return !!user.value;
    } catch (error) {
      console.error('Falha ao validar sessão/token:', error);
      delete api.defaults.headers.common['Authorization'];
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);

    if (isBlocked(sanitizedEmail)) {
      const remainingTime = getRemainingBlockTime(sanitizedEmail);
      toast.error(`Conta temporariamente bloqueada. Tente novamente em ${remainingTime} minutos.`);
      return false;
    }

    try {
      isLoading.value = true;
      localStorage.setItem('smartpicks_last_login_email', sanitizedEmail);

      const response = await api.post('/login', {
        email: sanitizedEmail,
        password: sanitizedPassword,
      });

      if (response.data?.user && response.data?.token) {
        clearFailedAttempts(sanitizedEmail);
        user.value = response.data.user;
        token.value = response.data.token;

        localStorage.setItem('smartpicks_token', response.data.token);
        localStorage.setItem('smartpicks_user', JSON.stringify(response.data.user));

        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        toast.success(response.data?.message || 'Login realizado com sucesso!');
        return true;
      }

      if (response.status >= 200 && response.status < 300) {
        try {
          const permissions = await checkUserPermissions(sanitizedEmail);
          if (permissions) {
            const resolvedUser = permissions.user || permissions;
            if (resolvedUser) {
              user.value = resolvedUser as User;
              localStorage.setItem('smartpicks_user', JSON.stringify(resolvedUser));

              clearFailedAttempts(sanitizedEmail);
              toast.success('Login realizado com sucesso!');
              return true;
            }
          }
        } catch {
          // Ignorar, será tratado abaixo
        }
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
      localStorage.removeItem('smartpicks_last_login_email');

      // Remover header de autorização
      delete api.defaults.headers.common['Authorization'];

      toast.info('Logout realizado com sucesso!');
    }
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

  // Helper: extrai mensagens de erro do backend
  const extractErrorMessages = (err: unknown): string[] => {
    const messages: string[] = [];
    const resp = (err as { response?: { data?: unknown; status?: number; statusText?: string } })
      ?.response;
    const data = resp?.data as
      | string
      | {
          message?: string;
          error?: string;
          errors?: unknown;
          detail?: string | string[];
          details?: unknown;
          violations?: unknown;
        }
      | undefined;

    const push = (m?: unknown, prefix?: string): void => {
      if (!m) return;
      if (typeof m === 'string') {
        messages.push(m);
      } else if (typeof m === 'number' || typeof m === 'boolean') {
        messages.push(String(m));
      } else if (Array.isArray(m)) {
        m.forEach((i) => push(i, prefix));
      } else if (typeof m === 'object') {
        const obj = m as Record<string, unknown>;
        if ('message' in obj || 'field' in obj) {
          const field = (obj.field as string) || prefix;
          const msg = obj.message as string | undefined;
          if (msg) messages.push(field ? `${field}: ${msg}` : msg);
        } else {
          Object.entries(obj).forEach(([key, val]) => {
            if (Array.isArray(val)) val.forEach((v) => push(v, key));
            else if (typeof val === 'string') messages.push(`${key}: ${val}`);
            else push(val, key);
          });
        }
      }
    };

    if (typeof data === 'string') {
      messages.push(data);
    } else if (data) {
      push(data.message);
      push(data.error);
      push(data.errors);
      push(data.detail);
      push(data.details);
      push(data.violations);
    }

    if (messages.length === 0 && resp?.status) {
      messages.push(`Erro ${resp.status}${resp.statusText ? ` - ${resp.statusText}` : ''}`);
    }

    return [...new Set(messages.filter((m) => m?.trim()))];
  };

  // Cadastro
  const register = async (userData: {
    nome: string;
    email: string;
    password: string;
    cpf: string;
    data_nascimento: string;
    perfil?: 'user' | 'admin';
  }): Promise<boolean> => {
    try {
      isLoading.value = true;

      const sanitizedData = {
        nome: sanitizeInput(userData.nome),
        email: sanitizeInput(userData.email),
        password: userData.password,
        cpf: sanitizeInput(userData.cpf),
        data_nascimento: userData.data_nascimento,
        perfil: userData.perfil || 'user',
      };

      const response = await api.post('/register', sanitizedData);

      toast.success(response.data?.message || 'Cadastro realizado com sucesso!');
      return true;
    } catch (error) {
      const errors = extractErrorMessages(error);
      const message = errors.join('\n') || 'Erro no cadastro. Tente novamente.';
      toast.error(message);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const getAllUsers = async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao carregar lista de usuários');
      return [];
    }
  };

  const checkUserPermissions = async (email: string) => {
    try {
      const response = await api.get('/users/permissions', {
        params: { email: sanitizeInput(email) },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      return null;
    }
  };

  const getUsersByProfile = async (profile: 'admin' | 'user') => {
    try {
      const response = await api.get('/users/profile', {
        params: { profile },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuários por perfil:', error);
      toast.error(`Erro ao carregar usuários do perfil ${profile}`);
      return [];
    }
  };

  const checkTableStatus = async () => {
    try {
      const response = await api.get('/users/check');
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar status da tabela:', error);
      return null;
    }
  };

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    register,
    validateToken,
    initialize,
    sanitizeInput,
    isBlocked,
    getRemainingBlockTime,
    getAllUsers,
    checkUserPermissions,
    getUsersByProfile,
    checkTableStatus,
  };
});
