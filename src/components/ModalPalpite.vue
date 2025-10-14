<template>
  <q-dialog v-model="dialogVisible" persistent class="q-pa-md">
    <q-card class="modal-palpite">
      <q-card-section class="row items-center q-pb-none q-pt-lg">
        <div class="text-h6">Criar um Novo Palpite</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="fecharModal" />
      </q-card-section>

      <q-card-section>
        <div class="q-mb-sm text-grey-8 text-left">
          Título ou comentário do seu palpite (opcional)
        </div>

        <q-input v-model="tituloComentario" bg-color="grey-2" placeholder="Digite um título ou comentário" outlined
          dense class="q-mb-md" />
        <q-separator></q-separator>

        <div class="text-h7 text-weight-bold q-my-md text-left" style="color: #00796B;">
          Detalhes do Bilhete
        </div>
        <div class="q-mb-sm text-grey-8 text-left">
          Imagem da BET*:
        </div>
        <div class="text-center q-mb-md">
          <div class="q-mb-md">
            <q-file v-model="imagemPalpite" outlined accept="image/*" label="Adicionar imagem" class="upload-input"
              @input="onImageUpload">
              <template v-slot:prepend>
                <q-icon name="cloud_upload" />
              </template>
            </q-file>
          </div>

          <q-separator></q-separator>

          <div v-if="imagemPreview" class="image-preview-clean q-mt-md">
            <img :src="imagemPreview" alt="Preview do palpite" class="preview-img-large" />
            <q-btn flat round icon="close" size="sm" class="remove-image-btn-simple" @click="removerImagem" />
          </div>
        </div>

        <div class="q-mb-sm text-grey-8 text-left">
          Link da aposta (opcional)
        </div>
        <q-input v-model="linkAposta" type="text" placeholder="https://www.bet365.bet.br/#/HO/" outlined dense
          class="q-mb-md" bg-color="grey-2" @keyup.enter="enviarPalpite" />
        <q-card-actions align="center">
          <q-btn size="lg" class="q-pa-lg" color="primary" style="min-width: 200px; font-size: 16px;" no-caps
            @click="enviarPalpite" :loading="enviando" :disable="!palpiteValido">
            Criar Palpite
          </q-btn>
        </q-card-actions>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { QDialog, QCard, QCardSection, QCardActions, QBtn, QInput, QSpace, QFile, useQuasar } from 'quasar';
import { api } from 'src/boot/axios';


interface Props {
  show: boolean;
}

const props = defineProps<Props>();


const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'close'): void;
}>();

const $q = useQuasar();

const tituloComentario = ref<string>('');
const palpite = ref<number | null>(null);
const linkAposta = ref<string>('');
const imagemPalpite = ref<File | null>(null);
const imagemPreview = ref<string | null>(null);
const enviando = ref(false);


const dialogVisible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
});

const palpiteValido = computed(() => {
  return imagemPalpite.value !== null;
});

watch(() => props.show, (novoValor) => {
  if (novoValor) {
    tituloComentario.value = '';
    palpite.value = null;
    imagemPalpite.value = null;
    imagemPreview.value = null;
  }
});


const onImageUpload = (file: File) => {
  if (file) {
    imagemPalpite.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagemPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const removerImagem = () => {
  imagemPalpite.value = null;
  imagemPreview.value = null;
};

const fecharModal = () => {
  dialogVisible.value = false;
  emit('close');
};

const enviarPalpite = async () => {
  if (!palpiteValido.value) {
    $q.notify({
      type: 'negative',
      message: 'Por favor, adicione uma imagem da aposta',
      position: 'top-right'
    });
    return;
  }

  enviando.value = true;

  try {
    const formData = new FormData();

    if (tituloComentario.value) {
      formData.append('titulo', tituloComentario.value);
    }
    if (linkAposta.value) {
      formData.append('linkAposta', linkAposta.value);
    }
    if (imagemPalpite.value) {
      formData.append('imagem', imagemPalpite.value);
    }


    const response = await api.post('/palpites', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.status === 200 || response.status === 201) {
      fecharModal();
      $q.notify({
        type: 'positive',
        message: 'Palpite criado com sucesso!',
        position: 'top-right'
      });
    }

  } catch (error) {

    let mensagemErro = 'Erro ao enviar palpite. Tente novamente.';

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status: number; data?: { message?: string } } };

      if (axiosError.response?.status === 401) {
        mensagemErro = 'Você precisa estar logado para criar um palpite';
      } else if (axiosError.response?.status === 400) {
        mensagemErro = axiosError.response.data?.message || 'Dados inválidos';
      }
    }

    $q.notify({
      type: 'negative',
      message: mensagemErro,
      position: 'top-right'
    });
  } finally {
    enviando.value = false;
  }
};
</script>

<style scoped>
.modal-palpite {
  border-radius: 12px;
  padding: 1.0rem;
  min-height: 500px;
  width: 550px;
  max-width: 90vw;
}

.text-h7 {
  font-size: 1.125rem;
  line-height: 1.5rem;
}

.upload-input {
  max-width: 300px;
  margin: 0 auto;
}

.image-preview-clean {
  position: relative;
  display: inline-block;
  max-width: 100%;
  width: 100%;
}

.preview-img-large {
  width: 100%;
  height: auto;
  max-height: 250px;
  min-height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.remove-image-btn-simple {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 50%;
}

.remove-image-btn-simple:hover {
  background-color: rgba(255, 0, 0, 0.8);
}

/* Responsividade */
@media (max-width: 480px) {
  .modal-palpite {
    width: 95vw;
    min-height: 450px;
  }

  .preview-img-large {
    max-height: 180px;
    min-height: 150px;
  }
}
</style>
