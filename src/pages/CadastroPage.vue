<template>
  <div class="cadastro-container flex items-center justify-center">
    <div class="cadastro-layout flex items-stretch overflow-hidden rounded-borders">
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
              Faça seu Cadastro
            </h3>
          </div>

          <q-card flat class="rounded-borders cadastro-card">
            <q-card-section class="q-pa-lg">
              <q-form ref="formRef" @submit.prevent="onSubmit" class="q-gutter-md">
                <q-input
                  v-model="nome"
                  outlined
                  type="text"
                  label="Nome completo"
                  :rules="[(val) => !!val || 'Campo obrigatório']"
                  class="full-width"
                  size="lg"
                />

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

                <q-input
                  v-model="confirmPassword"
                  outlined
                  type="password"
                  label="Confirme a Senha"
                  :rules="[(val) => !!val || 'Campo obrigatório']"
                  class="full-width"
                  size="lg"
                  :error="isPasswordMismatch"
                  error-message="As senhas não conferem"
                />

                <q-input
                  v-model="cpf"
                  outlined
                  type="text"
                  label="CPF"
                  :rules="cpfRules"
                  class="full-width"
                  size="lg"
                  mask="###.###.###-##"
                  fill-mask
                  unmasked-value
                />

                <q-input
                  v-model="dataNascimento"
                  outlined
                  type="text"
                  label="Data de Nascimento"
                  :rules="dataNascimentoRules"
                  class="full-width"
                  size="lg"
                  mask="##/##/####"
                  fill-mask
                />

                <q-select
                  v-model="perfil"
                  :options="perfilOptions"
                  outlined
                  label="Tipo de Usuário"
                  :rules="[(val) => !!val || 'Campo obrigatório']"
                  class="full-width"
                  size="lg"
                  emit-value
                  map-options
                >
                  <template v-slot:prepend>
                    <q-icon :name="perfil === 'admin' ? 'admin_panel_settings' : 'person'" />
                  </template>
                </q-select>

                <q-btn
                  type="submit"
                  color="primary"
                  text-color="white"
                  label="Cadastrar"
                  class="full-width large-btn text-weight-bold"
                  size="lg"
                  style="font-style: italic"
                  :disable="isSubmitDisabled"
                  no-caps
                />
              </q-form>

              <div class="text-center q-mt-md">
                <q-btn
                  to="/"
                  flat
                  no-caps
                  color="primary"
                  class="text-weight-medium"
                  label="Já tem uma conta? Faça login"
                />
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
      perfil.value = 'usuario';
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
      const cpfLimpo = cpf.value.replace(/\D/g, ''); // Apenas números
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
.cadastro-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #2ebac6 0%, #0582a6 100%);
}

.cadastro-layout {
  width: 92%;
  max-width: 1100px;
  min-height: 85vh;
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
  max-width: 520px;
}

.form-title {
  color: #0f4c75;
}

.cadastro-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.large-btn {
  height: 60px !important;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .cadastro-layout {
    flex-direction: column;
    height: auto;
    min-height: auto;
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
