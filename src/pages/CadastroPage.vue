<template>
  <q-page class="flex flex-center bg-gradient-to-br from-primary to-info">
    <div class="row full-width justify-center items-center q-pa-lg q-gutter-lg">
      <!-- Seção da Logo -->
      <div class="col-4 flex flex-center">
        <div class="text-center">
          <img src="icons/LogoSmartFull.png" alt="SmartPicks Logo" class="logo-responsive" />
        </div>
      </div>

      <!-- Seção do Formulário -->
      <div class="col-7 flex flex-center">
        <q-card class="cadastro-card q-pa-md" flat bordered>
          <q-card-section class="text-center q-pb-2">
            <div class="text-h4 text-weight-bold text-primary q-mb-sm">Crie sua conta!</div>
          </q-card-section>

          <q-card-section class="q-pt-md">
            <q-form ref="formRef" @submit.prevent="onSubmit" class="column">
              <q-input v-model="nome" outlined rounded type="text" label="Nome completo"
                :rules="[(val) => !!val || 'Campo obrigatório']" color="primary" label-color="grey-7" bg-color="grey-1"
                class="q-mb-sm full-width">
                <template v-slot:prepend>
                  <q-icon name="person" color="grey-6" />
                </template>
              </q-input>

              <q-input v-model="email" outlined rounded type="email" label="E-mail"
                :rules="[(val) => !!val || 'Campo obrigatório']" color="primary" label-color="grey-7" bg-color="grey-1"
                class="full-width">
                <template v-slot:prepend>
                  <q-icon name="mail" color="grey-6" />
                </template>
              </q-input>

              <q-input v-model="password" outlined rounded type="password" label="Senha"
                :rules="[(val) => !!val || 'Campo obrigatório']" color="primary" label-color="grey-7" bg-color="grey-1"
                class="full-width">
                <template v-slot:prepend>
                  <q-icon name="lock" color="grey-6" />
                </template>
              </q-input>

              <q-input v-model="confirmPassword" outlined rounded type="password" label="Confirme a Senha"
                :rules="[(val) => !!val || 'Campo obrigatório']" color="primary" label-color="grey-7" bg-color="grey-1"
                class="full-width" :error="isPasswordMismatch" error-message="As senhas não conferem">
                <template v-slot:prepend>
                  <q-icon name="lock_outline" color="grey-6" />
                </template>
              </q-input>

              <q-input v-model="cpf" outlined rounded type="text" label="CPF" :rules="cpfRules" color="primary"
                label-color="grey-7" bg-color="grey-1" mask="###.###.###-##" fill-mask class="full-width"
                unmasked-value>
                <template v-slot:prepend>
                  <q-icon name="badge" color="grey-6" />
                </template>
              </q-input>

              <q-input v-model="dataNascimento" outlined rounded type="text" label="Data de Nascimento"
                :rules="dataNascimentoRules" color="primary" label-color="grey-7" bg-color="grey-1" class="full-width"
                mask="##/##/####" fill-mask>
                <template v-slot:prepend>
                  <q-icon name="cake" color="grey-6" />
                </template>
              </q-input>

              <q-select v-model="perfil" :options="perfilOptions" outlined rounded label="Tipo de Usuário"
                :rules="[(val) => !!val || 'Campo obrigatório']" color="primary" label-color="grey-7" bg-color="grey-1"
                class="full-width" emit-value map-options>
                <template v-slot:prepend>
                  <q-icon :name="perfil === 'admin' ? 'admin_panel_settings' : 'person'" color="grey-6" />
                </template>
              </q-select>

              <q-btn type="submit" unelevated rounded color="primary" text-color="white" label="Cadastrar"
                class="full-width q-py-md q-mt-md" :loading="isSubmitting" :disable="isSubmitDisabled" no-caps>
                <template v-slot:loading>
                  <q-spinner-hourglass class="on-left" />
                  Cadastrando...
                </template>
              </q-btn>

              <div class="text-center q-mt-lg q-pt-md" style="border-top: 1px solid rgba(0, 0, 0, 0.1)">
                <span class="text-grey-6">Já tem uma conta? </span>
                <router-link to="/" class="text-primary text-weight-medium text-decoration-none">
                  Faça login aqui
                </router-link>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { toast } from 'vue3-toastify';
import type { QForm } from 'quasar';

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
      senha: password.value,
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
</script>

<style scoped>
.bg-gradient-to-br {
  background: linear-gradient(135deg, #2ebac6 0%, #0582a6 100%);
  min-height: 100vh;
}

.logo-responsive {
  width: 280px;
  height: auto;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
}

.cadastro-card {
  width: 100%;
  max-width: 480px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.1),
    0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

/* Layout sempre lado a lado */
.row {
  max-width: 1400px;
  margin: 0 auto;
  gap: 2rem;
}

/* Responsividade otimizada para layout horizontal */
@media (min-width: 1025px) {
  .logo-responsive {
    width: 320px;
  }

  .cadastro-card {
    max-width: 520px;
  }
}

@media (max-width: 1024px) {
  .logo-responsive {
    width: 280px;
  }

  .cadastro-card {
    max-width: 460px;
  }
}

@media (max-width: 768px) {
  .logo-responsive {
    width: 220px;
  }

  .cadastro-card {
    max-width: 380px;
  }

  .row {
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .logo-responsive {
    width: 160px;
  }

  .cadastro-card {
    max-width: 280px;
  }

  .row {
    gap: 0.5rem;
    padding: 0.5rem;
  }
}

/* Hover effects */
.q-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(46, 186, 198, 0.4);
}

.text-decoration-none:hover {
  text-decoration: underline !important;
}
</style>
