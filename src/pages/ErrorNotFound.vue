<template>
  <div class="error-page">
    <q-card class="error-card shadow-3">
      <q-icon name="error_outline" size="80px" color="negative" class="q-mb-md" />

      <h1 class="error-title">404 — Página não encontrada</h1>

      <p class="error-subtitle">
        A página que você tentou acessar não existe, foi removida ou está temporariamente
        indisponível.
      </p>

      <div class="error-actions">
        <q-btn
          unelevated
          color="primary"
          icon="home"
          label="Voltar ao início"
          to="/"
          no-caps
          class="q-px-md"
        />

        <q-btn
          outline
          color="grey-8"
          icon="refresh"
          label="Recarregar"
          @click="reloadPage"
          no-caps
          class="q-px-md"
        />
      </div>

      <div class="error-footer text-grey q-mt-lg">
        <q-icon name="shield" size="20px" class="q-mr-xs" />
        <span>SmartPicks © {{ new Date().getFullYear() }}</span>
      </div>
    </q-card>
  </div>
</template>

<script setup lang="ts">
const reloadPage = () => {
  window.location.reload();
};
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  background: #f5f6f7;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.error-card {
  background: #fff;
  border-radius: 16px;
  padding: 3rem 2rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
  transition: all 0.3s ease;
}

.error-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.1);
}

.error-title {
  color: #2e2e2e;
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.error-subtitle {
  color: #6b6b6b;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.error-footer {
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
