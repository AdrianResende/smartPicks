<template>
  <div class="login-container">
    <div class="login-layout">
      <div class="image-section">
        <div class="image-content">
          <div class="brand-logo">
            <q-icon name="psychology" size="80px" color="white" />
            <h2 class="brand-title">SmartPicks</h2>
            <p class="brand-subtitle">Sua plataforma inteligente de escolhas</p>
          </div>
        </div>
      </div>

      <div class="separator-container">
        <q-separator vertical class="separator" />
      </div>

      <div class="form-section">
        <div class="form-container">
          <div class="form-header">
            <h3 class="form-title">Faça seu login</h3>
          </div>

          <q-card class="login-card" flat>
            <q-card-section class="q-pa-lg">
              <q-form @submit="onSubmit" class="q-gutter-md">
                <q-input
                  v-model="email"
                  outlined
                  type="email"
                  label="E-mail"
                  :rules="[(val) => !!val || 'Campo obrigatório']"
                  class="full-width q-mb-md"
                  size="lg"
                >
                </q-input>

                <q-input
                  v-model="password"
                  outlined
                  type="password"
                  label="Senha"
                  :rules="[(val) => !!val || 'Campo obrigatório']"
                  class="full-width q-mb-md"
                  size="lg"
                >
                </q-input>

                <q-btn
                  type="submit"
                  style="background-color: #0582a6"
                  text-color="white"
                  label="Entrar"
                  class="full-width large-btn"
                  size="lg"
                  :style="{ fontStyle: 'italic' }"
                  :disable="isLoginDisabled"
                  no-caps
                />
              </q-form>

              <div class="text-center q-mt-md">
                <p class="signup-text q-mb-md">
                  Não tem uma conta?
                  <router-link to="/cadastro" class="cadastre-link">Cadastre-se</router-link>
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
import { toast } from 'vue3-toastify';

export default defineComponent({
  name: 'LoginPage',
  setup() {
    const email = ref('');
    const password = ref('');

    const isLoginDisabled = computed(() => !email.value || !password.value);

    const onSubmit = () => {
      if (isLoginDisabled.value) {
        toast.error('Informe e-mail e senha para continuar.');
        return;
      }

      console.log('Login data:', { email: email.value, password: password.value });
      toast.success('Login realizado com sucesso!');
    };

    return {
      email,
      password,
      onSubmit,
      isLoginDisabled,
    };
  },
});
</script>
<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #2ebac6 0%, #0582a6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.login-layout {
  width: 90%;
  max-width: 1000px;
  height: 80vh;
  max-height: 600px;
  display: flex;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  overflow: hidden;
}

/* Seção da Imagem (Esquerda) */
.image-section {
  flex: 1;
  background: linear-gradient(135deg, #0582a6 0%, #2ebac6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding-right: 2rem;
}

.image-content {
  text-align: center;
  color: white;
  z-index: 2;
  position: relative;
}

.brand-logo {
  margin-bottom: 2rem;
}

.brand-title {
  font-size: 3rem;
  font-weight: 700;
  margin: 1rem 0 0.5rem 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.brand-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 300;
}

/* Elementos Decorativos */
.decorative-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.floating-element {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.element-1 {
  width: 120px;
  height: 120px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.element-2 {
  width: 80px;
  height: 80px;
  top: 70%;
  right: 15%;
  animation-delay: 2s;
}

.element-3 {
  width: 60px;
  height: 60px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

/* Seção do Formulário (Direita) */
.form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  padding-left: 3rem;
  background: white;
}

.form-container {
  width: 100%;
  max-width: 450px;
}

.form-header {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.form-title {
  color: #0f4c75;
  font-size: 2rem;
  font-weight: 600;
  font-style: italic;
  margin: 0 0 0.5rem 0;
  text-align: center;
}

.form-subtitle {
  color: #7f8c8d;
  font-size: 1rem;
  margin: 0;
}

.login-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* Estilos da seção de cadastro */
.signup-text {
  font-size: 18px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 1.5rem;
}

.cadastre-link {
  color: #0582a6;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
}

.cadastre-link:hover {
  text-decoration: underline;
}

.signup-btn {
  color: #0582a6;
  font-weight: 600;
  font-size: 16px;
  margin-top: 1rem;
}

.signup-btn:hover {
  background-color: rgba(5, 130, 166, 0.1);
}

/* Estilos dos Campos de Input */
.large-input {
  width: 100%;
  display: block;
}

.large-input :deep(.q-field__control) {
  height: 60px;
  border: 3px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
}

.large-input :deep(.q-field__control):hover {
  border-color: #0582a6;
}

.large-input :deep(.q-field__control):focus-within {
  border-color: #0582a6;
  border-width: 3px;
  box-shadow: 0 0 0 2px rgba(5, 130, 166, 0.2);
}

.large-input :deep(.q-field__native) {
  padding: 0 16px;
  font-size: 16px;
  font-weight: 500;
}

.large-input :deep(.q-field__label) {
  font-size: 16px;
  font-weight: 500;
  color: #666;
}

.large-input :deep(.q-field__prepend) {
  padding-left: 16px;
}

/* Estilo do Botão Grande */
.large-btn {
  height: 60px !important;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
}

.large-btn :deep(.q-btn__content) {
  font-size: 16px;
  font-weight: 600;
}

/* Animações */
@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* Responsividade */
@media (max-width: 768px) {
  .login-layout {
    flex-direction: column;
    height: auto;
    min-height: 80vh;
    width: 95%;
  }

  .image-section {
    flex: 0 0 200px;
  }

  .brand-title {
    font-size: 2rem;
  }

  .brand-subtitle {
    font-size: 1rem;
  }

  .image-section {
    padding-right: 1rem;
  }

  .form-section {
    padding: 1rem;
    padding-left: 1rem;
  }

  .separator-container {
    display: none;
  }
}

@media (max-width: 480px) {
  .form-section {
    padding: 0.5rem;
  }

  .form-title {
    font-size: 1.5rem;
  }
}
</style>
