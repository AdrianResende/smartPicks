<template>
  <q-layout view="lHh Lpr lFf">
    <q-header v-if="authStore.isAuthenticated" elevated class="bg-white text-dark"
      style="height: 80px; min-height: 80px">
      <q-toolbar class="AppHeader-toolbar">
        <div class="AppHeader-logo-section">
          <img src="/icons/LogoSmart.png" alt="SmartPicks Logo" class="AppHeader-logo" />
          <img src="/icons/NameSmart.png" alt="SmartPicks Nome" class="AppHeader-name gt-xs" />
        </div>

        <div class="AppHeader-search-container gt-sm">
          <q-input dense rounded debounce="300" v-model="searchQuery" placeholder="Buscar..." class="AppHeader-search"
            bg-color="white" outlined>
            <template v-slot:prepend>
              <q-icon name="search" color="primary" />
            </template>
          </q-input>
        </div>

        <div class="AppHeader-actions">
          <q-btn class="lt-md q-mr-sm" flat round color="primary" icon="search" size="md"
            @click="showSearchModal = true">
            <q-tooltip>Buscar</q-tooltip>
          </q-btn>

          <div class="AppHeader-user-info gt-sm">
            <div v-if="showAvatar" class="AppHeader-user-info gt-sm">
              <UserAvatar :size="'36px'" class="q-mr-sm" />
            </div>
            <span class="AppHeader-welcome">
              Olá, {{ userName }}!
            </span>
          </div>

          <q-btn class="AppHeader-new-bet gt-sm" rounded color="primary" label="Novo Palpite" no-caps icon="add"
            unelevated @click="dialog = true" />

          <q-btn class="AppHeader-new-bet-mobile lt-md" flat round color="primary" icon="add" size="md"
            @click="dialog = true">
            <q-tooltip>Novo Palpite</q-tooltip>
          </q-btn>
          <div class="lt-md AppHeader-user-mobile">
            <UserAvatar :size="'32px'" class="q-mr-sm" />
          </div>

          <q-btn class="AppHeader-logout gt-xs" unelevated rounded color="negative" text-color="white" icon="logout"
            label="Sair" :loading="loggingOut" @click="onLogout" no-caps>
          </q-btn>

          <q-btn class="AppHeader-logout-mobile lt-sm" flat round color="negative" icon="logout" size="md"
            :loading="loggingOut" @click="onLogout">
            <q-tooltip>Sair</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>

  <q-dialog v-model="showSearchModal" position="top">
    <q-card class="AppHeader-search-modal">
      <q-card-section class="q-pa-md">
        <q-input v-model="mobileSearchQuery" placeholder="Buscar..." autofocus outlined rounded dense
          @keyup.enter="performSearch" @keyup.esc="showSearchModal = false">
          <template v-slot:prepend>
            <q-icon name="search" color="primary" />
          </template>
          <template v-slot:append>
            <q-btn flat round dense icon="close" @click="showSearchModal = false" />
          </template>
        </q-input>
      </q-card-section>
    </q-card>
  </q-dialog>

  <ModalPalpite v-model:show="dialog" @close="dialog = false" @novo-palpite="onNovoPalpite"
    @palpite-criado="handlePalpiteCriado" />
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { QLayout, QHeader, QToolbar, QBtn, QIcon, QInput, QPageContainer, QTooltip } from 'quasar';
import ModalPalpite from 'src/components/ModalPalpite.vue';
import UserAvatar from 'src/components/UserAvatar.vue';

const router = useRouter();
const authStore = useAuthStore();
const loggingOut = ref(false);
const searchQuery = ref('');
const userName = computed(() => authStore.user?.nome || 'Usuário');
const dialog = ref(false);
const showSearchModal = ref(false);
const mobileSearchQuery = ref(''); const showAvatar = ref(false);

const canShowAvatar = () => {
  return window.scrollY > 150;
};

const handleScroll = () => {
  showAvatar.value = canShowAvatar();
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

const handlePalpiteCriado = () => {
  emit('palpite-criado');
};

const onLogout = async () => {
  loggingOut.value = true;
  try {
    await authStore.logout();
    await router.replace({ name: 'login' }).catch(() => { });
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  } finally {
    loggingOut.value = false;
  }
};

const onNovoPalpite = (dados: { titulo: string; linkAposta: string; imagem: File | null }) => {
  console.log('Novo palpite recebido:', dados);
};

const performSearch = () => {
  if (mobileSearchQuery.value.trim()) {
    console.log('Pesquisando por:', mobileSearchQuery.value);
    showSearchModal.value = false;
    mobileSearchQuery.value = '';
  }
};
const emit = defineEmits<{
  (e: 'palpite-criado'): void
}>();
</script>

<style scoped>
.AppHeader-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 80px;
  min-height: 80px;
  gap: 8px;
}

.AppHeader-logo-section {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  position: relative;
}

.AppHeader-logo {
  width: 180px;
  height: 60px;
  object-fit: contain;
  flex-shrink: 0;
}

.AppHeader-name {
  width: 180px;
  height: 60px;
  object-fit: contain;
  margin-left: -4.5em;
  flex-shrink: 0;
}

.AppHeader-search-container {
  flex: 1;
  display: flex;
  justify-content: center;
  margin: 0 20px;
  max-width: 500px;
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

.AppHeader-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.AppHeader-user-info {
  display: flex;
  align-items: center;
  margin: 0 12px;
}

.AppHeader-welcome {
  font-weight: 500;
  white-space: nowrap;
  font-size: 14px;
}

.AppHeader-user-mobile {
  display: flex;
  align-items: center;
}

.AppHeader-new-bet {
  margin: 0 8px;
}

.AppHeader-new-bet-mobile {
  margin: 0 4px;
}

.AppHeader-logout {
  margin: 0 8px;
}

.AppHeader-logout-mobile {
  margin: 0 4px;
}

@media(max-width: 1200px) {
  .AppHeader-search-container {
    max-width: 350px;
    margin: 0 16px;
  }

  .AppHeader-welcome {
    font-size: 13px;
  }
}

@media(max-width: 1024px) {
  .AppHeader-logo {
    width: 150px;
    height: 50px;
  }

  .AppHeader-name {
    width: 150px;
    height: 50px;
    margin-left: -3.8em;
  }

  .AppHeader-search-container {
    margin: 0 12px;
  }
}

@media(max-width: 768px) {
  .AppHeader-toolbar {
    padding: 0 12px;
    gap: 6px;
  }

  .AppHeader-logo {
    width: 120px;
    height: 40px;
  }

  .AppHeader-name {
    width: 120px;
    height: 40px;
    margin-left: -3em;
  }

  .AppHeader-actions {
    gap: 6px;
  }
}

@media(max-width: 600px) {
  .AppHeader-toolbar {
    padding: 0 8px;
    gap: 4px;
  }

  .AppHeader-logo {
    width: 100px;
    height: 35px;
  }

  .AppHeader-name {
    width: 100px;
    height: 35px;
    margin-left: -2.5em;
  }

  .AppHeader-actions {
    gap: 4px;
  }
}

@media(max-width: 480px) {
  .AppHeader-logo {
    width: 80px;
    height: 30px;
  }

  .AppHeader-name {
    width: 80px;
    height: 30px;
    margin-left: -2em;
  }
}

@media(max-width: 400px) {
  .AppHeader-toolbar {
    padding: 0 4px;
  }

  .AppHeader-logo {
    width: 70px;
    height: 25px;
  }

  .AppHeader-name {
    display: none;
  }
}

.q-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.q-btn:hover {
  transform: translateY(-1px);
}

.AppHeader-search-modal {
  width: 90vw;
  max-width: 400px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);

  .q-card-section {
    padding: 16px;
  }

  .q-input {
    width: 100%;

    .q-field__control {
      border-radius: 25px;
    }
  }
}
</style>
