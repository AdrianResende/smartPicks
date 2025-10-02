<template>
  <div class="login-container flex items-center justify-center">
    <div class="login-layout flex overflow-hidden rounded-borders">
      <div
        class="image-section flex flex-1 items-center justify-center relative overflow-hidden q-pr-lg"
      >
        <div class="text-center text-white relative" style="z-index: 2">
          <div class="q-mb-xl">
            <q-icon name="psychology" size="80px" color="white" />
            <h2 class="brand-title text-h2 text-weight-bold q-mt-md q-mb-sm">SmartPicks</h2>
            <p class="text-h6 text-weight-light q-ma-none" style="opacity: 0.9">
              Sua plataforma inteligente de escolhas
            </p>
          </div>
        </div>
      </div>

      <div class="separator-container">
        <q-separator vertical />
      </div>

      <div class="flex flex-1 items-center justify-center q-pa-xl bg-white">
        <div class="full-width form-container">
          <div class="full-width flex justify-center q-mb-lg">
            <h3 class="form-title text-h4 text-weight-medium text-italic text-center q-ma-none">
              Faça seu login
            </h3>
          </div>

          <q-card flat class="rounded-borders login-card">
            <q-card-section class="q-pa-lg">
              <q-form @submit.prevent="onSubmit" class="q-gutter-md">
                <q-input
                  v-model="email"
                  outlined
                  type="email"
                  label="E-mail"
                  :rules="[(val) => !!val || 'Campo obrigatório']"
                  class="full-width"
                  size="lg"
                />

                <q-input
                  v-model="password"
                  outlined
                  type="password"
                  label="Senha"
                  :rules="[(val) => !!val || 'Campo obrigatório']"
                  class="full-width"
                  size="lg"
                />

                <q-btn
                  type="submit"
                  color="primary"
                  text-color="white"
                  label="Entrar"
                  class="full-width large-btn text-weight-bold"
                  size="lg"
                  style="font-style: italic"
                  :disable="isLoginDisabled"
                  no-caps
                />
              </q-form>

              <div class="text-center q-mt-md">
                <p class="text-h6 text-weight-medium text-black q-mb-md">
                  Não tem uma conta?
                  <router-link
                    to="/cadastro"
                    class="text-primary text-weight-bold text-decoration-none"
                  >
                    Cadastre-se
                  </router-link>
                </p>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </div>
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
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #2ebac6 0%, #0582a6 100%);
}

.login-layout {
  width: 90%;
  max-width: 1000px;
  height: 80vh;
  max-height: 600px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.image-section {
  background: linear-gradient(135deg, #0582a6 0%, #2ebac6 100%);
}

.brand-title {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.form-container {
  max-width: 450px;
}

.form-title {
  color: #0f4c75;
}

.login-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.large-btn {
  height: 60px !important;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .login-layout {
    flex-direction: column;
    height: auto;
    min-height: 80vh;
    width: 95%;
  }

  .image-section {
    flex: 0 0 200px;
    padding-right: 1rem !important;
  }

  .brand-title {
    font-size: 2rem !important;
  }

  .separator-container {
    display: none;
  }
}

@media (max-width: 480px) {
  .form-title {
    font-size: 1.5rem !important;
  }
}
</style>
