<template>
  <q-page class="flex flex-center bg-grey-1">
    <div class="text-center">
      <q-icon name="psychology" size="80px" color="primary" class="q-mb-md" />
      <h4 class="text-h4 text-weight-medium q-mt-none q-mb-sm">
        Bem-vindo ao Admin {{ sanitizedUserName }}!
      </h4>
      <p class="text-body1 text-grey-7">
        {{ authStore.isAdmin ? 'Painel Administrativo' : 'Seu painel de controle' }}
      </p>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { toast } from 'vue3-toastify';

export default defineComponent({
  name: 'AdminDashboard',

  setup() {
    const router = useRouter();
    const authStore = useAuthStore();

    const sanitizedUserName = computed(() => {
      return authStore.user?.nome ? authStore.sanitizeInput(authStore.user.nome) : 'Usuário';
    });

    onMounted(async () => {
      if (!authStore.isAuthenticated) {
        try {
          const isValid = await authStore.validateToken();
          if (!isValid) {
            toast.error('Sessão expirada. Faça login novamente.');
            await router.push('/');
            return;
          }
        } catch {
          toast.error('Erro ao validar sessão. Faça login novamente.');
          await router.push('/');
          return;
        }
      }
    });

    return {
      sanitizedUserName,
      authStore,
    };
  },
});
</script>
