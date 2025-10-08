<template>
  <q-page class="admin-dashboard-container">
    <div class="welcome-section">
      <q-icon name="psychology" size="80px" color="primary" class="q-mb-sm" />
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

<style scoped>
.admin-dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.welcome-section {
  text-align: center;
  background: white;
  padding: 3rem 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  max-width: 500px;
  width: 100%;
}

@media (max-width: 768px) {
  .admin-dashboard-container {
    padding: 1rem;
  }

  .welcome-section {
    padding: 2rem 1.5rem;
  }
}
</style>
