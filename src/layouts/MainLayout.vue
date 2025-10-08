<template>
  <q-layout view="lHh Lpr lFf">
    <q-header
      v-if="authStore.isAuthenticated"
      elevated
      class="bg-white text-dark"
      style="height: 80px; min-height: 80px"
    >
      <q-toolbar
        class="row items-center justify-between q-px-md"
        style="height: 80px; min-height: 80px"
      >
        <!-- Lado esquerdo: Logos -->
        <div class="row items-center q-gutter-md">
          <img src="icons/LogoSmart.png" alt="SmartPicks Logo" class="header-logo" />
          <img src="icons/NameSmart.png" alt="SmartPicks Logo" class="header-logo" />
        </div>

        <!-- Lado direito: Usuário e ações -->
        <div class="row items-center no-wrap q-gutter-sm">
          <!-- Avatar do usuário -->
          <AvatarUpload size="40px" />

          <span class="text-body1 text-weight-medium q-mx-md ellipsis">Olá, {{ userName }}!</span>

          <q-btn class="q-mx-md" rounded color="primary" label="Novo Palpite" no-caps />

          <q-btn
            class="q-mx-md"
            unelevated
            rounded
            color="negative"
            text-color="white"
            icon="logout"
            label="Sair"
            :loading="loggingOut"
            @click="onLogout"
            no-caps
          >
            <q-tooltip anchor="top middle" self="bottom middle"> Fazer logout </q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import AvatarUpload from 'src/components/AvatarUpload.vue';

export default defineComponent({
  name: 'MainLayout',
  components: {
    AvatarUpload,
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const loggingOut = ref(false);

    const userName = computed(() => authStore.user?.nome || 'Usuário');

    const onLogout = async () => {
      loggingOut.value = true;
      try {
        await authStore.logout();
        await router.replace({ name: 'login' }).catch(() => {});
      } catch (error) {
        console.error('Erro ao fazer logout:', error);
      } finally {
        loggingOut.value = false;
      }
    };

    return {
      authStore,
      userName,
      loggingOut,
      onLogout,
    };
  },
});
</script>

<style scoped>
.header-logo {
  width: 180px;
  height: 60px;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.header-logo:hover {
  transform: scale(1.05);
}

/* Apenas estilos que não podem ser substituídos por classes Quasar */
@media (max-width: 1024px) {
  .header-logo {
    width: 150px;
    height: 50px;
  }
}

@media (max-width: 768px) {
  .header-logo {
    width: 120px;
    height: 40px;
  }
}

@media (max-width: 600px) {
  .header-logo {
    width: 100px;
    height: 35px;
  }
}

@media (max-width: 480px) {
  .header-logo {
    width: 80px;
    height: 30px;
  }
}
</style>
