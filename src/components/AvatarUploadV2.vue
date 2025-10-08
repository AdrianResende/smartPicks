<template>
  <div class="avatar-upload">
    <q-avatar
      :size="size"
      :color="user?.avatar ? 'transparent' : 'primary'"
      :text-color="user?.avatar ? 'transparent' : 'white'"
      class="avatar-container"
      :class="{ loading: isProcessing }"
      @click="openUploadDialog"
    >
      <img v-if="user?.avatar" :src="user.avatar" alt="Avatar do usuário" class="avatar-image" />
      <q-icon v-else name="person" :size="iconSize" />

      <div class="avatar-overlay">
        <q-icon name="camera_alt" size="sm" />
      </div>

      <q-tooltip v-if="editable" anchor="bottom middle" self="top middle" :delay="300">
        {{ user?.avatar ? 'Alterar avatar' : 'Adicionar avatar' }}
      </q-tooltip>
    </q-avatar>

    <q-dialog v-model="showUploadDialog" persistent transition-show="scale" transition-hide="scale">
      <q-card class="avatar-dialog">
        <q-card-section class="text-center q-pb-none">
          <div class="text-h6 text-weight-bold q-mb-lg">
            {{ user?.avatar ? 'Alterar Avatar' : 'Adicionar Avatar' }}
          </div>

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

          <!-- Progress bar durante upload -->
          <q-linear-progress
            v-if="isUploading && uploadProgress > 0"
            :value="uploadProgress / 100"
            color="primary"
            size="8px"
            rounded
            class="q-mb-md"
          />

          <q-file
            v-model="selectedFile"
            outlined
            rounded
            label="Escolher nova imagem"
            accept="image/jpeg,image/png,image/gif,image/webp"
            max-file-size="5242880"
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
                    <strong>Tamanho máximo:</strong> 5MB<br />
                    <strong>Resolução recomendada:</strong> 400x400px
                  </div>
                </q-tooltip>
              </q-btn>
            </template>
          </q-file>

          <div class="text-caption text-grey-6">
            Dica: Use uma imagem quadrada para melhor resultado
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
import { useAvatar } from 'src/composables/useAvatar';

interface Props {
  size?: string;
  editable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: '48px',
  editable: true,
});

// Usar o composable personalizado
const {
  user,
  isUploading,
  isRemoving,
  isProcessing,
  uploadProgress,
  validateFile,
  createImagePreview,
  uploadAvatar,
  confirmRemoveAvatar,
} = useAvatar({
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
});

// Estado local do componente
const showUploadDialog = ref(false);
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const fileError = ref<string>('');

// Computed properties
const iconSize = computed(() => {
  const size = parseInt(props.size);
  return size > 60 ? 'lg' : size > 40 ? 'md' : 'sm';
});

const canSave = computed(() => selectedFile.value && !isProcessing.value && !fileError.value);

// Métodos
const openUploadDialog = () => {
  if (props.editable) {
    showUploadDialog.value = true;
  }
};

const clearPreview = () => {
  selectedFile.value = null;
  previewUrl.value = null;
  fileError.value = '';
};

const onFileRejected = () => {
  fileError.value = 'Arquivo rejeitado. Verifique o formato e tamanho.';
};

const onFileSelected = async (file: File | null) => {
  fileError.value = '';

  if (!file) {
    previewUrl.value = null;
    return;
  }

  // Validar arquivo usando o composable
  const validationError = await validateFile(file);
  if (validationError) {
    fileError.value = validationError;
    selectedFile.value = null;
    previewUrl.value = null;
    return;
  }

  // Criar preview da imagem
  try {
    previewUrl.value = await createImagePreview(file);
  } catch {
    fileError.value = 'Erro ao processar a imagem';
    selectedFile.value = null;
    previewUrl.value = null;
  }
};

const handleUploadAvatar = async () => {
  if (!selectedFile.value || !canSave.value) return;

  const success = await uploadAvatar(selectedFile.value);
  if (success) {
    closeDialog();
  }
};

const handleRemoveAvatar = async () => {
  const success = await confirmRemoveAvatar();
  if (success) {
    closeDialog();
  }
};

const closeDialog = () => {
  showUploadDialog.value = false;
  selectedFile.value = null;
  previewUrl.value = null;
  fileError.value = '';
};
</script>

<style scoped>
.avatar-container {
  position: relative;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-container:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 50%;
  color: white;
  backdrop-filter: blur(2px);
}

.avatar-dialog {
  min-width: 400px;
  max-width: 500px;
  border-radius: 16px;
  overflow-x: hidden;
}

.avatar-preview-container {
  position: relative;
  display: inline-block;
}

.avatar-preview {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  transition: transform 0.3s ease;
}

.avatar-preview:hover {
  transform: scale(1.02);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.remove-preview-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Responsividade */
@media (max-width: 600px) {
  .avatar-dialog {
    min-width: 90vw;
    max-width: 95vw;
    margin: 8px;
  }

  .avatar-preview {
    width: 120px !important;
    height: 120px !important;
  }
}

@media (max-width: 480px) {
  .avatar-dialog {
    min-width: 95vw;
    margin: 4px;
    border-radius: 12px;
  }

  .avatar-preview {
    width: 100px !important;
    height: 100px !important;
  }
}

/* Estados especiais */
.avatar-container:focus-visible {
  outline: 2px solid var(--q-primary);
  outline-offset: 2px;
}

.avatar-container.loading {
  pointer-events: none;
  opacity: 0.6;
}

.q-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.q-btn:hover {
  transform: translateY(-1px);
}
</style>
