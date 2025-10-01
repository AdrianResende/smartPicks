<template>
  <div class="cadastro-container">
    <div class="cadastro-layout">
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
            <h3 class="form-title">Faça seu Cadastro</h3>
          </div>

          <q-card class="cadastro-card" flat>
            <q-card-section class="q-pa-lg">
              <q-form ref="formRef" @submit="onSubmit" class="q-gutter-md">
                <q-input
                  v-model="nome"
                  outlined
                  type="text"
                  label="Nome completo"
                  :rules="[(val) => !!val || 'Campo obrigatório']"
                  class="full-width q-mb-md"
                  size="lg"
                >
                </q-input>

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
                <q-input
                  v-model="confirmPassword"
                  outlined
                  type="password"
                  label="Confirme a Senha"
                  :rules="[(val) => !!val || 'Campo obrigatório']"
                  class="full-width q-mb-md"
                  size="lg"
                  :error="isPasswordMismatch"
                  error-message="As senhas não conferem"
                >
                </q-input>
                <q-input
                  v-model="cpf"
                  outlined
                  type="text"
                  label="CPF"
                  :rules="cpfRules"
                  class="full-width q-mb-md"
                  size="lg"
                  mask="###.###.###-##"
                  fill-mask
                  unmasked-value
                >
                </q-input>
                <q-input
                  v-model="dataNascimento"
                  outlined
                  type="text"
                  label="Data de Nascimento"
                  :rules="dataNascimentoRules"
                  class="full-width q-mb-md"
                  size="lg"
                  mask="##/##/####"
                  fill-mask
                >
                </q-input>

                <q-select
                  v-model="perfil"
                  :options="perfilOptions"
                  outlined
                  label="Tipo de Usuário"
                  :rules="[(val) => !!val || 'Campo obrigatório']"
                  class="full-width q-mb-md"
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
                  style="background-color: #0582a6"
                  text-color="white"
                  label="Cadastrar"
                  class="full-width large-btn"
                  size="lg"
                  :style="{ fontStyle: 'italic' }"
                  :disable="isSubmitDisabled"
                  no-caps
                />
              </q-form>

              <div class="text-center q-mt-md">
                <q-btn
                  to="/"
                  flat
                  no-caps
                  class="cadastre-link"
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
import { api } from 'src/boot/axios';

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
    const perfil = ref('usuario');
    const isSubmitting = ref(false);

    const perfilOptions = [
      { label: 'Usuário Simples', value: 'usuario', icon: 'person' },
      { label: 'Administrador', value: 'admin', icon: 'admin_panel_settings' },
    ];

    const formatCpf = (value: string) => {
      const digits = value.replace(/\D/g, '').slice(0, 11);
      if (digits.length !== 11) {
        return digits;
      }
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
    };

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
      const cpfFormatado = formatCpf(cpf.value);
      const dataNascimentoISO = toIsoDate(dataNascimento.value);

      if (!dataNascimentoISO) {
        toast.error('Não foi possível converter a data de nascimento.');
        return;
      }

      try {
        isSubmitting.value = true;

        const response = await api.post('/auth/register', {
          name: nomeSeguro,
          email: emailSeguro,
          password: password.value,
          cpf: cpfFormatado,
          birthDate: dataNascimentoISO,
          perfil: perfil.value,
        });

        toast.success(response.data?.message || 'Cadastro realizado com sucesso!');
        resetForm();
        setTimeout(() => {
          void router.push('/');
        }, 1500);
      } catch (error) {
        const message =
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Não foi possível realizar o cadastro.';
        toast.error(message);
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
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.cadastro-layout {
  width: 92%;
  max-width: 1100px;
  min-height: 85vh;
  display: flex;
  align-items: stretch;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  overflow: hidden;
  padding: 0;
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
  padding: 3rem;
  padding-left: 3.5rem;
  background: white;
  overflow-y: auto;
}

.form-container {
  width: 100%;
  max-width: 520px;
}

.image-section,
.form-section {
  min-height: 100%;
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

.cadastro-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  width: 100%;
}

/* Estilos da seção de cadastro */
.signup-text {
  font-size: 18px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 1.5rem;
}

.cadastre-link {
  font-weight: 700;
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
  .cadastro-layout {
    flex-direction: column;
    height: auto;
    min-height: auto;
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
    padding: 1.5rem;
    padding-left: 1.5rem;
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
