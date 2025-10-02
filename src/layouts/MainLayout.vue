<template>
  <q-layout view="lHh Lpr lFf">
    <q-header v-if="authStore.isAuthenticated" elevated class="bg-white text-dark">
      <q-toolbar>
        <q-btn flat round dense icon="psychology" to="/dashboard" aria-label="SmartPicks" />
        <q-toolbar-title>
          <router-link to="/dashboard" class="brand-link">SmartPicks</router-link>
        </q-toolbar-title>
        <q-space />

        <div class="row items-center no-wrap q-gutter-sm">
          <q-chip square color="primary" text-color="white" icon="person">
            {{ userEmail }}
          </q-chip>
          <q-btn flat icon="logout" color="negative" label="Sair" @click="onLogout" no-caps />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';

export default defineComponent({
  name: 'MainLayout',
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();

    const userEmail = computed(() => authStore.user?.email || 'Usuário');

    const onLogout = async () => {
      try {
        await authStore.logout();
      } finally {
        await router.replace({ name: 'login' }).catch(() => {});
      }
    };

    return {
      authStore,
      userEmail,
      onLogout,
    };
  },
});
</script>

<style scoped>
.brand-link {
  text-decoration: none;
  color: inherit;
}
.brand-link:hover {
  text-decoration: underline;
}
</style>
