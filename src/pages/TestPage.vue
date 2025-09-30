<template>
  <div class="q-pa-md">
    <h1>Teste de Carregamento de Componentes</h1>
    <p>Se você está vendo isso, as rotas estão funcionando!</p>

    <div class="q-gutter-md">
      <q-btn color="primary" to="/" label="Ir para Login" />
      <q-btn color="secondary" to="/cadastro" label="Ir para Cadastro" />
    </div>

    <div class="q-mt-lg">
      <h3>Teste de Componentes Quasar:</h3>
      <q-card class="q-mt-md">
        <q-card-section>
          <div class="text-h6">Card de Teste</div>
          <div class="text-subtitle2">Se você vê este card, o Quasar está funcionando</div>
        </q-card-section>
        <q-card-actions>
          <q-btn flat>Botão 1</q-btn>
          <q-btn flat>Botão 2</q-btn>
        </q-card-actions>
      </q-card>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TestPage',

  mounted() {
    console.log('TestPage mounted successfully!');
  },
});
</script>
