<template>
  <div class="avatar-container">
    <!-- Avatar principal -->
    <q-avatar :size="size" class="cursor-pointer user-avatar" :class="{ 'editable': editable }"
      @click="openUploadDialog">
      <img v-if="avatarUrl" :src="avatarUrl" :alt="altText" @error="handleImageError" />
      <q-icon v-else name="person" :size="iconSize" color="grey-6" />

      <div v-if="editable" class="edit-overlay">
        <q-icon name="photo_camera" size="16px" />
      </div>

      <q-tooltip v-if="editable">
        {{ avatarUrl ? 'Alterar avatar' : 'Adicionar avatar' }}
      </q-tooltip>
    </q-avatar>

    <!-- Dialog de upload simplificado -->
    <q-dialog v-model="showUploadDialog" persistent>
      <q-card class="upload-card">
        <q-card-section class="text-center">
          <div class="text-h6">Alterar Avatar</div>
        </q-card-section>

        <q-card-section class="text-center q-pt-none">
          <!-- Preview do avatar -->
          <div class="preview-container q-mb-md">
            <q-avatar size="120px" class="preview-avatar">
              <img v-if="previewUrl || avatarUrl" :src="(previewUrl || avatarUrl)!" class="avatar-image" />
              <q-icon v-else name="person" size="50px" color="grey-5" />
            </q-avatar>
          </div>

          <!-- Upload de arquivo -->
          <q-file v-model="selectedFile" outlined dense label="Escolher imagem" accept=".jpg,.jpeg,.png,.gif,.webp"
            max-file-size="5242880" @update:model-value="onFileSelected" class="full-width" :loading="isUploading">
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>

          <div class="text-caption text-grey q-mt-sm">
            Formatos: JPG, PNG, GIF, WebP • Máx: 5MB
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey" @click="closeDialog" :disable="isUploading" />
          <q-btn v-if="avatarUrl" flat label="Remover" color="negative" @click="removeAvatar" :loading="isUploading" />
          <q-btn unelevated label="Salvar" color="primary" @click="uploadAvatar" :loading="isUploading"
            :disable="!selectedFile" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { useQuasar } from 'quasar';

interface Props {
  size?: string;
  editable?: boolean;
  userId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: '48px',
  editable: true
});

const $q = useQuasar();
const authStore = useAuthStore();

// Refs
const showUploadDialog = ref(false);
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const isUploading = ref(false);
const hasError = ref(false);

// Computed
const user = computed(() => authStore.user);
const avatarUrl = computed(() => {
  if (hasError.value) return null;
  return user.value?.avatar || null;
});

const altText = computed(() => user.value?.nome || 'Usuário');
const iconSize = computed(() => {
  const sizeNum = parseInt(props.size);
  if (sizeNum > 60) return 'lg';
  if (sizeNum > 40) return 'md';
  return 'sm';
});

// Methods
const openUploadDialog = () => {
  if (props.editable) {
    showUploadDialog.value = true;
  }
};

const closeDialog = () => {
  showUploadDialog.value = false;
  selectedFile.value = null;
  previewUrl.value = null;
  hasError.value = false;
};

const handleImageError = () => {
  console.warn('Erro ao carregar avatar, usando fallback');
  hasError.value = true;
};

const onFileSelected = (file: File | null) => {
  if (!file) {
    previewUrl.value = null;
    return;
  }

  // Criar preview
  const reader = new FileReader();
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const uploadAvatar = async () => {
  if (!selectedFile.value) return;

  isUploading.value = true;

  try {
    // Validar arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(selectedFile.value.type)) {
      throw new Error('Tipo de arquivo não suportado');
    }

    if (selectedFile.value.size > 5 * 1024 * 1024) {
      throw new Error('Arquivo muito grande (máx. 5MB)');
    }

    // Fazer upload
    await authStore.uploadAvatar(selectedFile.value);

    $q.notify({
      type: 'positive',
      message: 'Avatar atualizado com sucesso!',
      position: 'top'
    });

    closeDialog();
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Erro ao atualizar avatar',
      position: 'top'
    });
  } finally {
    isUploading.value = false;
  }
};

const removeAvatar = async () => {
  isUploading.value = true;

  try {
    await authStore.removeAvatar();

    $q.notify({
      type: 'positive',
      message: 'Avatar removido com sucesso!',
      position: 'top'
    });

    closeDialog();
  } catch (error) {
    console.error('Erro ao remover avatar:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao remover avatar',
      position: 'top'
    });
  } finally {
    isUploading.value = false;
  }
};

// Watch para resetar error quando avatar mudar
watch(avatarUrl, (newUrl) => {
  if (newUrl) {
    hasError.value = false;
  }
});
</script>

<style scoped>
.avatar-container {
  display: inline-block;
  position: relative;
}

.user-avatar {
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.user-avatar.editable:hover {
  border-color: var(--q-primary);
  transform: scale(1.05);
}

.edit-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  background: var(--q-primary);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.user-avatar.editable:hover .edit-overlay {
  opacity: 1;
}

.upload-card {
  min-width: 350px;
  border-radius: 12px;
}

.preview-container {
  position: relative;
  display: inline-block;
}

.preview-avatar {
  border: 3px solid var(--q-primary);
  background: white;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

/* Estilos responsivos */
@media (max-width: 600px) {
  .upload-card {
    min-width: 300px;
    margin: 16px;
  }

  .preview-avatar {
    width: 100px;
    height: 100px;
  }
}

/* Animações */
.q-avatar {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
