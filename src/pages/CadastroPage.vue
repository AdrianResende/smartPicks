<template>
  <q-page class="cadastro-page">
    <div class="cadastro-wrapper">
      <div class="logo-section">
        <div class="logo-container">
          <img src="icons/smart.png" alt="SmartPicks Logo" class="main-logo" />
        </div>
      </div>
      <div class="cadastro-card-wrapper">
        <q-card class="cadastro-card" flat>
          <q-card-section class="card-header">
            <div class="welcome-text">
              <h2 class="welcome-title">Crie sua conta!</h2>
              <p class="welcome-subtitle">Preencha seus dados para começar</p>
            </div>
          </q-card-section>

          <q-card-section class="card-content">
            <q-form ref="formRef" @submit.prevent="onSubmit" class="cadastro-form">
              <div class="input-group">
                <q-input
                  v-model="nome"
                  outlined
                  type="text"
                  label="Nome completo"
                  :rules="[(val) => !!val || 'Campo obrigatório']"
                  class="modern-input"
                  size="lg"
                  color="primary"
                  label-color="grey-7"
                  bg-color="grey-1"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" color="grey-6" />
                  </template>
                </q-input>
              </div>

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

              <div class="input-group">
                <q-input
                  v-model="confirmPassword"
                  outlined
                  type="password"
                  label="Confirme a Senha"
                  :rules="[(val) => !!val || 'Campo obrigatório']"
                  class="modern-input"
                  size="lg"
                  color="primary"
                  label-color="grey-7"
                  bg-color="grey-1"
                  :error="isPasswordMismatch"
                  error-message="As senhas não conferem"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock_outline" color="grey-6" />
                  </template>
                </q-input>
              </div>

              <div class="input-group">
                <q-input
                  v-model="cpf"
                  outlined
                  type="text"
                  label="CPF"
                  :rules="cpfRules"
                  class="modern-input"
                  size="lg"
                  color="primary"
                  label-color="grey-7"
                  bg-color="grey-1"
                  mask="###.###.###-##"
                  fill-mask
                  unmasked-value
                >
                  <template v-slot:prepend>
                    <q-icon name="badge" color="grey-6" />
                  </template>
                </q-input>
              </div>

              <div class="input-group">
                <q-input
                  v-model="dataNascimento"
                  outlined
                  type="text"
                  label="Data de Nascimento"
                  :rules="dataNascimentoRules"
                  class="modern-input"
                  size="lg"
                  color="primary"
                  label-color="grey-7"
                  bg-color="grey-1"
                  mask="##/##/####"
                  fill-mask
                >
                  <template v-slot:prepend>
                    <q-icon name="cake" color="grey-6" />
                  </template>
                </q-input>
              </div>

              <div class="input-group">
                <q-select
                  v-model="perfil"
                  :options="perfilOptions"
                  outlined
                  label="Tipo de Usuário"
                  :rules="[(val) => !!val || 'Campo obrigatório']"
                  class="modern-input"
                  size="lg"
                  color="primary"
                  label-color="grey-7"
                  bg-color="grey-1"
                  emit-value
                  map-options
                >
                  <template v-slot:prepend>
                    <q-icon
                      :name="perfil === 'admin' ? 'admin_panel_settings' : 'person'"
                      color="grey-6"
                    />
                  </template>
                </q-select>
              </div>

              <div class="action-group">
                <q-btn
                  type="submit"
                  unelevated
                  rounded
                  color="primary"
                  text-color="white"
                  label="Cadastrar"
                  class="cadastro-btn"
                  size="lg"
                  :loading="isSubmitting"
                  :disable="isSubmitDisabled"
                  no-caps
                >
                  <template v-slot:loading>
                    <q-spinner-hourglass class="on-left" />
                    Cadastrando...
                  </template>
                </q-btn>
              </div>

              <div class="login-link">
                <span class="login-text">Já tem uma conta? </span>
                <router-link to="/" class="login-btn-link"> Faça login aqui </router-link>
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
import type { QForm } from 'quasar';

export default defineComponent({
  name: 'CadastroPage',
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const nome = ref('');
    const formRef = ref<QForm | null>(null);
    const email = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const cpf = ref('');
    const dataNascimento = ref('');
    const perfil = ref('user');
    const isSubmitting = ref(false);

    const perfilOptions = [
      { label: 'Usuário Simples', value: 'user', icon: 'person' },
      { label: 'Administrador', value: 'admin', icon: 'admin_panel_settings' },
    ];

    const parseBrazilianDate = (value: string) => {
      const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (!match) {
        return null;
      }

      const [, dayStr, monthStr, yearStr] = match;
      const day = Number(dayStr);
      const monthIndex = Number(monthStr) - 1;
      const year = Number(yearStr);
      const date = new Date(year, monthIndex, day);
      const today = new Date();

      if (
        date.getFullYear() !== year ||
        date.getMonth() !== monthIndex ||
        date.getDate() !== day ||
        year < 1900 ||
        date > today
      ) {
        return null;
      }

      return date;
    };

    const isValidBrazilianDate = (value: string) => parseBrazilianDate(value) !== null;

    const isAdult = (value: string) => {
      const birthDate = parseBrazilianDate(value);
      if (!birthDate) {
        return false;
      }

      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return age >= 18;
    };

    const toIsoDate = (value: string) => {
      const date = parseBrazilianDate(value);
      if (!date) {
        return null;
      }
      return date.toISOString().split('T')[0];
    };

    const isValidCpf = (value: string) => {
      const digits = value.replace(/\D/g, '');
      if (digits.length !== 11 || /^([0-9])\1+$/.test(digits)) {
        return false;
      }

      const calculateCheckDigit = (length: number) => {
        let sum = 0;
        for (let i = 0; i < length; i += 1) {
          sum += Number(digits[i]) * (length + 1 - i);
        }
        const remainder = (sum * 10) % 11;
        return remainder === 10 ? 0 : remainder;
      };

      const firstDigit = calculateCheckDigit(9);
      const secondDigit = calculateCheckDigit(10);

      return firstDigit === Number(digits[9]) && secondDigit === Number(digits[10]);
    };

    const cpfRules: Array<(val: string | null) => true | string> = [
      (val) => !!val || 'Campo obrigatório',
      (val) => (!!val && val.replace(/\D/g, '').length === 11) || 'CPF deve ter 11 dígitos',
      (val) => (!!val && isValidCpf(val)) || 'CPF inválido',
    ];

    const dataNascimentoRules: Array<(val: string | null) => true | string> = [
      (val) => !!val || 'Campo obrigatório',
      (val) => (!!val && isValidBrazilianDate(val)) || 'Data inválida',
      (val) => (!!val && isAdult(val)) || 'É necessário ter pelo menos 18 anos',
    ];

    const isPasswordMismatch = computed(
      () => !!confirmPassword.value && password.value !== confirmPassword.value,
    );

    const requiredFieldsFilled = computed(() =>
      [
        nome.value,
        email.value,
        password.value,
        confirmPassword.value,
        cpf.value,
        dataNascimento.value,
        perfil.value,
      ].every((field) => !!field),
    );

    const isSubmitDisabled = computed(
      () => isSubmitting.value || !requiredFieldsFilled.value || isPasswordMismatch.value,
    );

    const resetForm = () => {
      formRef.value?.resetValidation();
      nome.value = '';
      email.value = '';
      password.value = '';
      confirmPassword.value = '';
      cpf.value = '';
      dataNascimento.value = '';
      perfil.value = 'user';
    };

    const onSubmit = async () => {
      const isFormValid = await formRef.value?.validate();
      if (!isFormValid) {
        toast.error('Corrija os campos destacados antes de continuar.');
        return;
      }

      if (!isValidCpf(cpf.value)) {
        toast.error('Informe um CPF válido.');
        return;
      }

      if (password.value !== confirmPassword.value) {
        toast.error('As senhas não coincidem.');
        return;
      }

      if (!isValidBrazilianDate(dataNascimento.value)) {
        toast.error('Informe uma data de nascimento válida (DD/MM/AAAA).');
        return;
      }

      if (!isAdult(dataNascimento.value)) {
        toast.error('É necessário ter pelo menos 18 anos para se cadastrar.');
        return;
      }

      const nomeSeguro = authStore.sanitizeInput(nome.value);
      const emailSeguro = authStore.sanitizeInput(email.value);
      const cpfLimpo = cpf.value.replace(/\D/g, '');
      const dataNascimentoISO = toIsoDate(dataNascimento.value);

      if (!dataNascimentoISO) {
        toast.error('Não foi possível converter a data de nascimento.');
        return;
      }

      try {
        isSubmitting.value = true;

        const success = await authStore.register({
          nome: nomeSeguro,
          email: emailSeguro,
          password: password.value,
          cpf: cpfLimpo,
          data_nascimento: dataNascimentoISO,
          perfil: perfil.value as 'user' | 'admin',
        });

        if (success) {
          resetForm();
          setTimeout(() => {
            void router.push('/');
          }, 1500);
        }
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      formRef,
      email,
      password,
      nome,
      confirmPassword,
      cpf,
      dataNascimento,
      perfil,
      perfilOptions,
      cpfRules,
      dataNascimentoRules,
      isPasswordMismatch,
      isSubmitDisabled,
      isSubmitting,
      onSubmit,
    };
  },
});
</script>

<style scoped>
.cadastro-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #2ebac6 0%, #0582a6 100%);
  position: relative;
  overflow: hidden;
}

.cadastro-wrapper {
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

/* Card de Cadastro */
.cadastro-card-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 2;
}

.cadastro-card {
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

.cadastro-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
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

.cadastro-btn {
  width: 100%;
  height: 56px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 16px;
  text-transform: none;
  transition: all 0.3s ease;
}

.cadastro-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(46, 186, 198, 0.4);
}

.login-link {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.login-text {
  color: #6b7280;
  font-size: 0.95rem;
}

.login-btn-link {
  color: #2ebac6;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.login-btn-link:hover {
  color: #0582a6;
  text-decoration: underline;
}

/* Responsividade */
@media (max-width: 1024px) {
  .cadastro-wrapper {
    grid-template-columns: 1fr;
    gap: 3rem;
    padding: 2rem;
  }

  .main-logo {
    width: 220px;
  }
}

@media (max-width: 768px) {
  .cadastro-wrapper {
    padding: 1.5rem;
    gap: 2rem;
  }

  .main-logo {
    width: 180px;
    margin-bottom: 1rem;
  }

  .cadastro-card {
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
  .cadastro-wrapper {
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
