<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card class="modal-palpite" style="min-width: 350px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Novo Palpite</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="fecharModal" />
      </q-card-section>

      <q-card-section>
        <p class="text-body2 q-mb-md">Digite seu palpite para o próximo jogo:</p>

        <q-input v-model.number="palpite" type="number" label="Seu palpite" placeholder="Digite um número" outlined
          dense class="q-mb-md" @keyup.enter="enviarPalpite" :error="erro !== null" :error-message="erro" />

        <div class="text-caption text-grey-6 q-mb-sm">
          Dica: Analise os jogos anteriores para fazer um palpite mais preciso!
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pt-none">
        <q-btn flat label="Cancelar" color="grey" @click="fecharModal" />
        <q-btn unelevated label="Enviar Palpite" color="primary" @click="enviarPalpite" :loading="enviando"
          :disable="!palpiteValido" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { QDialog, QCard, QCardSection, QCardActions, QBtn, QInput, QSpace, useQuasar } from 'quasar';


interface Props {
  show: boolean;
}

const props = defineProps<Props>();


const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'close'): void;
  (e: 'novo-palpite', palpite: number): void;
}>();

// Quasar
const $q = useQuasar();

// Estado
const palpite = ref<number | null>(null);
const enviando = ref(false);
const erro = ref<string | null>(null);


const dialogVisible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
});

const palpiteValido = computed(() => {
  return palpite.value !== null && palpite.value > 0;
});

watch(() => props.show, (novoValor) => {
  if (novoValor) {
    palpite.value = null;
    erro.value = null;
  }
});

const fecharModal = () => {
  dialogVisible.value = false;
  emit('close');
};

const enviarPalpite = async () => {
  erro.value = null;

  if (!palpiteValido.value) {
    erro.value = 'Por favor, digite um palpite válido';
    return;
  }

  enviando.value = true;

  try {
    // Simular envio (aqui você faria a chamada para a API)
    await new Promise(resolve => setTimeout(resolve, 500));

    emit('novo-palpite', palpite.value!);
    fecharModal();

    $q.notify({ type: 'positive', message: 'Palpite enviado com sucesso!' });

  } catch {
    erro.value = 'Erro ao enviar palpite. Tente novamente.';
  } finally {
    enviando.value = false;
  }
};
</script>

<style scoped>
.modal-palpite {
  border-radius: 12px;
}
</style>
