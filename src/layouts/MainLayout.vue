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
        <div class="row items-center q-gutter-md">
          <img src="/icons/LogoSmart.png" alt="SmartPicks Logo" class="header-logo" />
          <img
            src="/icons/NameSmart.png"
            alt="SmartPicks Logo"
            class="header-logo"
            style="margin-left: -4.5em"
          />
        </div>

        <div class="row items-center no-wrap q-gutter-sm">
          <UserAvatar size="40px" />

          <span class="text-body1 text-weight-medium q-mx-md ellipsis gt-xs">
            Olá, {{ userName }}!
          </span>

          <q-btn
            class="q-mx-md gt-sm"
            rounded
            color="primary"
            label="Novo Palpite"
            no-caps
            unelevated
          />

          <q-btn class="lt-md" flat round color="primary" icon="add" size="md">
            <q-tooltip>Novo Palpite</q-tooltip>
          </q-btn>

          <q-btn
            class="q-mx-md gt-xs"
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
            <q-tooltip>Fazer logout</q-tooltip>
          </q-btn>

          <q-btn
            class="lt-sm"
            flat
            round
            color="negative"
            icon="logout"
            size="md"
            :loading="loggingOut"
            @click="onLogout"
          >
            <q-tooltip>Sair</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import UserAvatar from 'src/components/UserAvatar.vue';

// Store e composables
const router = useRouter();
const authStore = useAuthStore();

// Estado reativo
const loggingOut = ref(false);

// Computed properties
const userName = computed(() => authStore.user?.nome || 'Usuário');

// Métodos
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

/* Melhorias de responsividade para o header */
@media (max-width: 768px) {
  .q-toolbar {
    padding: 0 8px !important;
  }
}

@media (max-width: 600px) {
  .q-toolbar {
    padding: 0 4px !important;
  }

  .q-btn {
    min-width: auto;
  }
}

/* Animações suaves */
.q-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.q-btn:hover {
  transform: translateY(-1px);
}

/* Estilo para o header */
.q-header {
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
</style>
