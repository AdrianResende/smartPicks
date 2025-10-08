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

          <div class="text-caption text-grey-6 q-mb-md">
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

const user = computed(() => authStore.user);
const isProcessing = computed(() => isUploading.value || isRemoving.value);
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
  const maxSize = 5 * 1024 * 1024;
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return 'Formato não suportado. Use JPG, PNG, GIF ou WebP.';
  }

  if (file.size > maxSize) {
    return 'Arquivo muito grande. Máximo permitido: 5MB.';
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
    previewUrl.value = await createImagePreview(file);
  } catch {
    fileError.value = 'Erro ao processar imagem';
    selectedFile.value = null;
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

    if (success) {
      closeDialog();
    }
  } catch (error) {
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
        if (success) {
          closeDialog();
        }
      } catch (error) {
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
