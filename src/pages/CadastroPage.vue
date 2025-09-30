<template>
  <q-page class="flex flex-center">
    <div class="cadastro-container">
      <div class="text-center q-mb-lg">
        <q-avatar size="80px" color="primary" text-color="white" class="q-mb-md">
          <q-icon name="person_add" size="40px" />
        </q-avatar>
        <h4 class="text-primary q-ma-none">Criar Conta</h4>
        <p class="text-grey-6">Junte-se ao SmartPicks</p>
      </div>

      <q-form @submit="handleSubmit" class="q-gutter-md">
        <q-input
          v-model="form.nome"
          type="text"
          label="Nome completo"
          outlined
          :rules="[
            (val) => !!val || 'Nome é obrigatório',
            (val) => val.length >= 2 || 'Nome deve ter pelo menos 2 caracteres',
          ]"
          hint="Digite seu nome completo"
        >
          <template v-slot:prepend>
            <q-icon name="person" />
          </template>
        </q-input>

        <q-input
          v-model="form.email"
          type="email"
          label="E-mail"
          outlined
          :rules="[
            (val) => !!val || 'E-mail é obrigatório',
            (val) => /.+@.+\..+/.test(val) || 'E-mail deve ser válido',
          ]"
          hint="Digite um e-mail válido"
        >
          <template v-slot:prepend>
            <q-icon name="email" />
          </template>
        </q-input>

        <q-input
          v-model="form.senha"
          :type="showPassword ? 'text' : 'password'"
          label="Senha"
          outlined
          :rules="[
            (val) => !!val || 'Senha é obrigatória',
            (val) => val.length >= 6 || 'Senha deve ter pelo menos 6 caracteres',
          ]"
          hint="Mínimo 6 caracteres"
          counter
          maxlength="50"
        >
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
          <template v-slot:append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <q-input
          v-model="form.confirmarSenha"
          :type="showConfirmPassword ? 'text' : 'password'"
          label="Confirmar senha"
          outlined
          :rules="[
            (val) => !!val || 'Confirmação de senha é obrigatória',
            (val) => val === form.senha || 'As senhas não coincidem',
          ]"
          hint="Digite a senha novamente"
        >
          <template v-slot:prepend>
            <q-icon name="lock_outline" />
          </template>
          <template v-slot:append>
            <q-icon
              :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showConfirmPassword = !showConfirmPassword"
            />
          </template>
        </q-input>

        <q-checkbox
          v-model="form.aceitarTermos"
          label="Aceito os termos de uso e política de privacidade"
          :rules="[(val: boolean) => val || 'Você deve aceitar os termos']"
          class="q-mt-md"
        />

        <q-btn
          type="submit"
          label="Criar Conta"
          color="primary"
          class="full-width"
          size="lg"
          :loading="loading"
          :disable="loading"
        >
          <template v-slot:loading>
            <q-spinner-hourglass class="on-left" />
            Criando conta...
          </template>
        </q-btn>
      </q-form>

      <q-separator spaced class="q-my-lg" />

      <div class="text-center">
        <p class="text-grey-6 q-mb-md">Já tem uma conta?</p>
        <q-btn flat color="primary" label="Fazer Login" to="/" no-caps />
      </div>

      <!-- Notificações -->
      <q-banner
        v-if="mensagem"
        :class="mensagemTipo === 'success' ? 'bg-positive text-white' : 'bg-negative text-white'"
        class="q-mt-md"
        rounded
      >
        <template v-slot:avatar>
          <q-icon :name="mensagemTipo === 'success' ? 'check_circle' : 'error'" />
        </template>
        {{ mensagem }}
        <template v-slot:action>
          <q-btn flat color="white" icon="close" @click="mensagem = ''" />
        </template>
      </q-banner>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'CadastroPage',

  setup() {
    const router = useRouter();

    const form = ref({
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      aceitarTermos: false,
    });

    const mensagem = ref('');
    const mensagemTipo = ref<'success' | 'error'>('success');
    const loading = ref(false);
    const showPassword = ref(false);
    const showConfirmPassword = ref(false);

    const handleSubmit = async () => {
      try {
        loading.value = true;

        // Simulação de cadastro (substitua pela lógica real da API)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        mensagem.value = 'Conta criada com sucesso! Redirecionando...';
        mensagemTipo.value = 'success';

        // Redirecionar para login após sucesso
        setTimeout(() => {
          void router.push('/');
        }, 2000);
      } catch (error: unknown) {
        console.error('Erro ao criar conta:', error);
        mensagem.value = 'Erro ao criar conta. Tente novamente.';
        mensagemTipo.value = 'error';
      } finally {
        loading.value = false;
      }
    };

    return {
      form,
      mensagem,
      mensagemTipo,
      loading,
      showPassword,
      showConfirmPassword,
      handleSubmit,
    };
  },
});
</script>

<style scoped>
.cadastro-container {
  width: 100%;
  max-width: 450px;
  padding: 2rem;
}

@media (max-width: 600px) {
  .cadastro-container {
    padding: 1rem;
    max-width: 100%;
  }
}
</style>
