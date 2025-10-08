<template>
  <div class="avatar-upload">
    <q-avatar
      :size="size"
      :color="user?.avatar ? 'transparent' : 'primary'"
      :text-color="user?.avatar ? 'transparent' : 'white'"
      class="avatar-container cursor-pointer"
      @click="openUploadDialog"
    >
      <img v-if="user?.avatar" :src="user.avatar" alt="Avatar do usuário" class="avatar-image" />
      <q-icon v-else name="person" :size="iconSize" />

      <q-tooltip v-if="editable" class="bg-primary">
        {{ user?.avatar ? 'Alterar avatar' : 'Adicionar avatar' }}
      </q-tooltip>
    </q-avatar>

    <q-dialog v-model="showUploadDialog" persistent>
      <q-card class="avatar-upload-card" style="min-width: 400px">
        <q-card-section class="text-center">
          <div class="text-h6">{{ user?.avatar ? 'Alterar Avatar' : 'Adicionar Avatar' }}</div>
        </q-card-section>

        <q-card-section class="text-center">
          <div class="avatar-preview-container q-mb-lg">
            <q-avatar size="140px" class="avatar-preview">
              <img v-if="previewUrl" :src="previewUrl" alt="Preview" class="preview-image" />
              <img
                v-else-if="user?.avatar"
                :src="user.avatar"
                alt="Avatar atual"
                class="preview-image"
              />
              <q-icon v-else name="person" size="70px" color="grey-5" />
            </q-avatar>

            <q-btn
              v-if="previewUrl || user?.avatar"
              fab-mini
              color="negative"
              icon="close"
              class="remove-preview-btn"
              @click="clearPreview"
              :disable="isProcessing"
            />
          </div>

          <q-linear-progress
            v-if="isUploading && uploadProgress > 0"
            :value="uploadProgress / 100"
            color="primary"
            size="8px"
            rounded
            class="q-mb-md"
          />

          <div v-if="isOptimizing" class="text-center q-mb-md">
            <q-spinner-dots size="20px" color="primary" />
            <div class="text-caption text-primary q-mt-xs">
              Otimizando imagem para alta qualidade...
            </div>
          </div>

          <q-file
            v-model="selectedFile"
            outlined
            rounded
            label="Escolher nova imagem (alta qualidade)"
            accept="image/jpeg,image/png,image/gif,image/webp"
            max-file-size="10485760"
            @update:model-value="onFileSelected"
            @rejected="onFileRejected"
            class="q-mb-md full-width"
            :error="!!fileError"
            :error-message="fileError"
            :disable="isProcessing"
          >
            <template v-slot:prepend>
              <q-icon name="image" color="primary" />
            </template>

            <template v-slot:append>
              <q-btn round dense flat icon="info" color="info" size="sm">
                <q-tooltip class="bg-info" anchor="top middle" self="bottom middle">
                  <div class="text-body2">
                    <strong>Formatos aceitos:</strong> JPG, PNG, GIF, WebP<br />
                    <strong>Tamanho máximo:</strong> 10MB<br />
                    <strong>Resolução recomendada:</strong> 800x800px ou superior<br />
                    <strong>Otimização:</strong> Automática para 800x800px
                  </div>
                </q-tooltip>
              </q-btn>
            </template>
          </q-file>

          <div class="text-caption text-grey-6 q-mb-md">
            💡 A imagem será automaticamente otimizada para alta qualidade<br />
            🎯 Recomendamos imagens com resolução mínima de 800x800px
          </div>
        </q-card-section>

        <q-card-actions align="center" class="q-pt-md q-pb-lg q-px-lg">
          <q-btn
            flat
            label="Cancelar"
            @click="closeDialog"
            :disable="isProcessing"
            class="q-px-lg"
          />

          <q-btn
            v-if="user?.avatar && !previewUrl"
            flat
            color="negative"
            label="Remover Avatar"
            icon="delete"
            @click="handleRemoveAvatar"
            :loading="isRemoving"
            :disable="isUploading"
            class="q-px-lg"
          />

          <q-btn
            unelevated
            rounded
            color="primary"
            :label="user?.avatar ? 'Atualizar' : 'Salvar'"
            icon="save"
            @click="handleUploadAvatar"
            :loading="isUploading"
            :disable="!canSave"
            class="q-px-lg"
          />
        </q-card-actions>

        <q-inner-loading :showing="isProcessing">
          <q-spinner-dots size="50px" color="primary" />
        </q-inner-loading>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { useQuasar } from 'quasar';

defineOptions({ name: 'UserAvatar' });

interface Props {
  size?: string;
  editable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: '48px',
  editable: true,
});

const $q = useQuasar();
const authStore = useAuthStore();

const showUploadDialog = ref(false);
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const fileError = ref<string>('');
const isUploading = ref(false);
const isRemoving = ref(false);
const uploadProgress = ref(0);
const isOptimizing = ref(false);

const user = computed(() => authStore.user);
const isProcessing = computed(() => isUploading.value || isRemoving.value || isOptimizing.value);
const iconSize = computed(() => {
  const size = parseInt(props.size);
  return size > 60 ? 'lg' : size > 40 ? 'md' : 'sm';
});
const canSave = computed(() => selectedFile.value && !fileError.value && !isProcessing.value);

const openUploadDialog = () => {
  if (props.editable) {
    showUploadDialog.value = true;
  }
};

const closeDialog = () => {
  showUploadDialog.value = false;
  clearPreview();
};

const clearPreview = () => {
  selectedFile.value = null;
  previewUrl.value = null;
  fileError.value = '';
  uploadProgress.value = 0;
};

const validateFile = (file: File): string | null => {
  const maxSize = 10 * 1024 * 1024; // Aumentado para 10MB para permitir imagens de alta qualidade
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return 'Formato não suportado. Use JPG, PNG, GIF ou WebP.';
  }

  if (file.size > maxSize) {
    return 'Arquivo muito grande. Máximo permitido: 10MB.';
  }

  return null;
};

const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsDataURL(file);
  });
};

// Função para redimensionar e otimizar a imagem
const resizeAndOptimizeImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Definir tamanho ideal para avatar (800x800 para alta qualidade)
      const targetSize = 800;
      canvas.width = targetSize;
      canvas.height = targetSize;

      if (!ctx) {
        reject(new Error('Erro ao criar contexto do canvas'));
        return;
      }

      // Configurar qualidade máxima
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Calcular dimensões para crop centralizado
      const size = Math.min(img.width, img.height);
      const offsetX = (img.width - size) / 2;
      const offsetY = (img.height - size) / 2;

      // Desenhar imagem redimensionada e otimizada
      ctx.drawImage(
        img,
        offsetX,
        offsetY,
        size,
        size, // fonte (crop centralizado)
        0,
        0,
        targetSize,
        targetSize, // destino
      );

      // Converter para blob com alta qualidade
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Erro ao processar imagem'));
            return;
          }

          // Criar novo arquivo otimizado
          const optimizedFile = new File([blob], `avatar_${Date.now()}.jpg`, {
            type: 'image/jpeg',
          });

          resolve(optimizedFile);
        },
        'image/jpeg',
        0.95, // 95% de qualidade para manter alta definição
      );
    };

    img.onerror = () => reject(new Error('Erro ao carregar imagem'));
    img.src = URL.createObjectURL(file);
  });
};

const onFileSelected = async (file: File | null) => {
  if (!file) {
    clearPreview();
    return;
  }

  fileError.value = '';

  const error = validateFile(file);
  if (error) {
    fileError.value = error;
    selectedFile.value = null;
    return;
  }

  try {
    isOptimizing.value = true;

    // Mostrar preview da imagem original primeiro
    previewUrl.value = await createImagePreview(file);

    // Processar e otimizar a imagem em segundo plano
    const optimizedFile = await resizeAndOptimizeImage(file);
    selectedFile.value = optimizedFile;

    // Atualizar preview com a imagem otimizada
    previewUrl.value = await createImagePreview(optimizedFile);
  } catch (error) {
    console.error('Erro ao processar imagem:', error);
    fileError.value = 'Erro ao processar imagem';
    selectedFile.value = null;
    previewUrl.value = null;
  } finally {
    isOptimizing.value = false;
  }
};

const onFileRejected = () => {
  fileError.value = 'Arquivo rejeitado. Verifique o formato e tamanho.';
};

const handleUploadAvatar = async () => {
  if (!selectedFile.value) return;

  isUploading.value = true;
  uploadProgress.value = 20;

  try {
    uploadProgress.value = 50;
    const success = await authStore.uploadAvatar(selectedFile.value);
    uploadProgress.value = 100;

    // A store já mostra as notificações de sucesso/erro
    // Apenas fechar o diálogo se o upload foi bem-sucedido
    if (success) {
      closeDialog();
    }
    // Se não foi sucesso, a store já mostrou a mensagem de erro
    // O diálogo permanece aberto para o usuário tentar novamente
  } catch (error) {
    // A store já lida com os erros e mostra as notificações
    // Apenas log para debug
    console.error('Erro no upload:', error);
  } finally {
    isUploading.value = false;
    uploadProgress.value = 0;
  }
};

const handleRemoveAvatar = () => {
  $q.dialog({
    title: 'Confirmar',
    message: 'Tem certeza que deseja remover seu avatar?',
    ok: {
      push: true,
      color: 'negative',
      label: 'Remover',
    },
    cancel: {
      push: true,
      color: 'grey',
      label: 'Cancelar',
    },
    persistent: true,
  }).onOk(() => {
    void (async () => {
      isRemoving.value = true;
      try {
        const success = await authStore.removeAvatar();

        // A store já mostra as notificações de sucesso/erro
        // Apenas fechar o diálogo se a remoção foi bem-sucedida
        if (success) {
          closeDialog();
        }
        // Se não foi sucesso, a store já mostrou a mensagem de erro
      } catch (error) {
        // A store já lida com os erros e mostra as notificações
        // Apenas log para debug
        console.error('Erro ao remover avatar:', error);
      } finally {
        isRemoving.value = false;
      }
    })();
  });
};
</script>

<style scoped>
.avatar-container {
  transition: transform 0.2s ease;
  position: relative;
}

.avatar-container:hover {
  transform: scale(1.05);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
  /* Otimizações para alta qualidade e nitidez */
  image-rendering: auto;
  image-rendering: -webkit-optimize-contrast;
  backface-visibility: hidden;
  transform: translateZ(0);
  /* Suavização de borda para alta qualidade */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* Manter proporção e qualidade */
  max-width: 100%;
  height: auto;
  height: 100%;
}

.avatar-preview-container {
  position: relative;
  display: inline-block;
}

.avatar-preview {
  border: 3px solid var(--q-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
  /* Otimizações para máxima qualidade no preview */
  image-rendering: auto;
  image-rendering: -webkit-optimize-contrast;
  backface-visibility: hidden;
  transform: translateZ(0);
  /* Anti-aliasing e suavização premium */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  filter: contrast(1.02) saturate(1.05);
  /* Melhorar contraste e saturação levemente */
}

.remove-preview-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  z-index: 1;
}

.avatar-upload-card {
  max-width: 500px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
</style>
