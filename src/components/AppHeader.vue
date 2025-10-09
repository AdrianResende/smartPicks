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
        <!-- Logo à esquerda -->
        <div class="row items-center q-gutter-md">
          <img src="/icons/LogoSmart.png" alt="SmartPicks Logo" class="AppHeader-logo" />
          <img
            src="/icons/NameSmart.png"
            alt="SmartPicks Nome"
            class="AppHeader-logo"
            style="margin-left: -4.5em"
          />
        </div>

        <!-- Barra de pesquisa (borda mais fina + cor do fundo do palpite) -->
        <div class="AppHeader-search-container">
          <q-input
            dense
            rounded
            debounce="300"
            v-model="searchQuery"
            placeholder="Buscar..."
            class="AppHeader-search"
            bg-color="white"
            outlined
          >
            <template v-slot:prepend>
              <q-icon name="search" color="primary" />
            </template>
          </q-input>
        </div>

        <!-- Parte direita -->
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
const searchQuery = ref('');

// Computed
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
.AppHeader-logo {
  width: 180px;
  height: 60px;
  object-fit: contain;
}

/* Central com leve deslocamento para direita */
.AppHeader-search-container {
  flex: 1;
  display: flex;
  justify-content: center;
  margin-left: 60px;
}

.AppHeader-search {
  width: 100%;
  max-width: 400px;
  transition: all 0.25s ease-in-out;
  border: 1px solid var(--q-primary);
  border-radius: 25px;
  background-color: #fafafa;
}

.AppHeader-search:hover,
.AppHeader-search.q-field--focused {
  border-color: var(--q-primary);
  box-shadow: 0 0 5px rgba(33, 150, 243, 0.25);
}

/* Responsividade */
@media (max-width: 1024px) {
  .AppHeader-logo {
    width: 150px;
    height: 50px;
  }

  .AppHeader-search-container {
    margin-left: 40px;
  }
}

@media (max-width: 768px) {
  .AppHeader-logo {
    width: 120px;
    height: 40px;
  }

  .AppHeader-search {
    max-width: 280px;
  }

  .AppHeader-search-container {
    margin-left: 20px;
  }
}

@media (max-width: 600px) {
  .AppHeader-logo {
    width: 100px;
    height: 35px;
  }

  .AppHeader-search-container {
    display: none;
  }
}

@media (max-width: 480px) {
  .AppHeader-logo {
    width: 80px;
    height: 30px;
  }
}

/* Botões com animação */
.q-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.q-btn:hover {
  transform: translateY(-1px);
}
</style>
