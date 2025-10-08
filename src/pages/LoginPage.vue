<template>
  <q-page class="login-page">
    <div class="login-wrapper">
      <div class="logo-section">
        <div class="logo-container">
          <img src="icons/LogoSmartFull.png" class="main-logo" />
        </div>
      </div>
      <div class="login-card-wrapper">
        <q-card class="login-card" flat>
          <q-card-section class="card-header">
            <div class="welcome-text">
              <h2 class="welcome-title">Faça seu login!</h2>
            </div>
          </q-card-section>

          <q-card-section class="card-content">
            <q-form @submit.prevent="onSubmit" class="login-form">
              <div class="input-group">
                <q-input
                  v-model="email"
                  outlined
                  type="email"
                  label="E-mail"
                  :rules="[(val) => !!val || 'Campo obrigatório']"
                  class="modern-input"
                  size="lg"
                  color="primary"
                  label-color="grey-7"
                  bg-color="grey-1"
                >
                  <template v-slot:prepend>
                    <q-icon name="mail" color="grey-6" />
                  </template>
                </q-input>
              </div>

              <div class="input-group">
                <q-input
                  v-model="password"
                  outlined
                  type="password"
                  label="Senha"
                  :rules="[(val) => !!val || 'Campo obrigatório']"
                  class="modern-input"
                  size="lg"
                  color="primary"
                  label-color="grey-7"
                  bg-color="grey-1"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" color="grey-6" />
                  </template>
                </q-input>
              </div>

              <div class="action-group">
                <q-btn
                  type="submit"
                  unelevated
                  rounded
                  color="primary"
                  text-color="white"
                  label="Entrar"
                  class="login-btn"
                  size="lg"
                  :loading="isSubmitting"
                  :disable="isLoginDisabled"
                  no-caps
                >
                  <template v-slot:loading>
                    <q-spinner-hourglass class="on-left" />
                    Entrando...
                  </template>
                </q-btn>
              </div>

              <div class="signup-link">
                <span class="signup-text">Não tem uma conta? </span>
                <router-link to="/cadastro" class="signup-btn"> Cadastre-se aqui </router-link>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { toast } from 'vue3-toastify';

export default defineComponent({
  name: 'LoginPage',
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const email = ref('');
    const password = ref('');

    const isLoginDisabled = computed(
      () =>
        authStore.isLoading || !email.value || !password.value || authStore.isBlocked(email.value),
    );

    const onSubmit = async () => {
      if (isLoginDisabled.value) {
        if (authStore.isBlocked(email.value)) {
          const remainingTime = authStore.getRemainingBlockTime(email.value);
          toast.error(`Conta bloqueada. Tente novamente em ${remainingTime} minutos.`);
        } else {
          toast.error('Informe e-mail e senha para continuar.');
        }
        return;
      }

      const success = await authStore.login(email.value, password.value);

      if (success) {
        const redirectParam = router.currentRoute.value.query.redirect;
        const redirectTo =
          typeof redirectParam === 'string' && redirectParam.length > 0 ? redirectParam : undefined;
        try {
          if (redirectTo) {
            await router.replace(redirectTo);
          } else {
            await router.replace({ name: 'dashboard' });
          }
        } catch {
          await router.replace({ name: 'dashboard' }).catch(() => {});
        }
      }
    };

    return {
      email,
      password,
      onSubmit,
      isSubmitting: computed(() => authStore.isLoading),
      isLoginDisabled,
    };
  },
});
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #2ebac6 0%, #0582a6 100%);
  position: relative;
  overflow: hidden;
}

.login-wrapper {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 4rem;
  padding: 2rem 4rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Seção da Logo */
.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.logo-container {
  text-align: center;
  color: white;
}

.main-logo {
  width: 280px;
  height: auto;
  margin-bottom: 2rem;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
}

.brand-name {
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
  text-shadow: 2px 4px 8px rgba(0, 0, 0, 0.3);
  letter-spacing: -1px;
}

.brand-tagline {
  font-size: 1.3rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 400;
  text-shadow: 1px 2px 4px rgba(0, 0, 0, 0.2);
}

/* Card de Login */
.login-card-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 2;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.1),
    0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.card-header {
  padding: 2.5rem 2.5rem 1rem 2.5rem;
  text-align: center;
  background: linear-gradient(135deg, rgba(46, 186, 198, 0.05) 0%, rgba(5, 130, 166, 0.05) 100%);
}

.welcome-title {
  font-size: 2rem;
  font-weight: 700;
  color: #0f4c75;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.welcome-subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 1rem;
  font-weight: 400;
}

.card-content {
  padding: 1rem 2.5rem 2.5rem 2.5rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  position: relative;
}

.modern-input {
  border-radius: 16px;
}

.modern-input :deep(.q-field__control) {
  border-radius: 16px;
  height: 56px;
}

.modern-input :deep(.q-field__outlined) {
  border-radius: 16px;
}

.action-group {
  margin-top: 1rem;
}

.login-btn {
  width: 100%;
  height: 56px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 16px;
  text-transform: none;
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(46, 186, 198, 0.4);
}

.signup-link {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.signup-text {
  color: #6b7280;
  font-size: 0.95rem;
}

.signup-btn {
  color: #2ebac6;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.signup-btn:hover {
  color: #0582a6;
  text-decoration: underline;
}

/* Responsividade */
@media (max-width: 1024px) {
  .login-wrapper {
    grid-template-columns: 1fr;
    gap: 3rem;
    padding: 2rem;
  }

  .main-logo {
    width: 220px;
  }
}

@media (max-width: 768px) {
  .login-wrapper {
    padding: 1.5rem;
    gap: 2rem;
  }

  .main-logo {
    width: 180px;
    margin-bottom: 1rem;
  }

  .login-card {
    max-width: 100%;
  }

  .card-header {
    padding: 2rem 2rem 0.5rem 2rem;
  }

  .welcome-title {
    font-size: 1.6rem;
  }

  .card-content {
    padding: 1rem 2rem 2rem 2rem;
  }
}

@media (max-width: 480px) {
  .login-wrapper {
    padding: 1rem;
  }

  .main-logo {
    width: 150px;
  }

  .card-header {
    padding: 1.5rem 1.5rem 0.5rem 1.5rem;
  }

  .card-content {
    padding: 1rem 1.5rem 1.5rem 1.5rem;
  }

  .welcome-title {
    font-size: 1.4rem;
  }
}
</style>
