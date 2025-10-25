<template>
  <q-page class="dashboard-container">
    <div class="welcome-section">
      <q-icon name="psychology" size="80px" color="primary" class="q-mb-md" />
      <h4 class="text-h4 text-weight-medium q-mt-none q-mb-sm">
        Bem-vindo ao SmartPicks, {{ sanitizedUserName }}!
      </h4>
      <p class="text-body1 text-grey-7">
        {{ authStore.isAdmin ? 'Painel Administrativo' : 'Seu painel de controle' }}
      </p>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { toast } from 'vue3-toastify';

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
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  text-align: center;
}

.welcome-section {
  text-align: center;
  background: white;
  padding: 3rem 2rem;
  border-radius: 16px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  max-width: 500px;
  width: 100%;
  margin: 0 auto;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.welcome-section:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }

  .welcome-section {
    padding: 2rem 1.5rem;
  }
}
</style>
