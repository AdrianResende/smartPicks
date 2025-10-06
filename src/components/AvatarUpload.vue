<template>
  <div class="avatar-upload">
    <!-- Avatar Display -->
    <q-avatar
      :size="size"
      :color="user?.avatar ? 'transparent' : 'primary'"
      :text-color="user?.avatar ? 'transparent' : 'white'"
      class="avatar-container"
      @click="showUploadDialog = true"
    >
      <img v-if="user?.avatar" :src="user.avatar" alt="Avatar do usuário" />
      <q-icon v-else name="person" :size="iconSize" />

      <!-- Overlay de hover -->
      <div class="avatar-overlay">
        <q-icon name="camera_alt" size="sm" />
      </div>
    </q-avatar>

    <!-- Dialog para upload -->
    <q-dialog v-model="showUploadDialog" persistent>
      <q-card class="avatar-dialog">
        <q-card-section class="text-center">
          <div class="text-h6 q-mb-md">Atualizar Avatar</div>

          <!-- Preview -->
          <q-avatar size="120px" class="q-mb-md">
            <img v-if="previewUrl" :src="previewUrl" alt="Preview" />
            <img v-else-if="user?.avatar" :src="user.avatar" alt="Avatar atual" />
            <q-icon v-else name="person" size="60px" color="grey-5" />
          </q-avatar>

          <!-- Input de arquivo -->
          <q-file
            v-model="selectedFile"
            outlined
            label="Escolher imagem"
            accept="image/*"
            max-file-size="2097152"
            @update:model-value="onFileSelected"
            class="q-mb-md"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>

          <div class="text-caption text-grey-6 q-mb-md">
            Formatos aceitos: JPG, PNG, GIF<br />
            Tamanho máximo: 2MB
          </div>
        </q-card-section>

        <q-card-actions align="center" class="q-pb-md">
          <q-btn flat label="Cancelar" @click="closeDialog" :disable="uploading" />

          <q-btn
            v-if="user?.avatar"
            flat
            color="negative"
            label="Remover"
            @click="removeAvatar"
            :loading="removing"
            :disable="uploading"
          />

          <q-btn
            unelevated
            color="primary"
            label="Salvar"
            @click="uploadAvatar"
            :loading="uploading"
            :disable="!selectedFile || removing"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from 'src/stores/auth';

interface Props {
  size?: string;
  editable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: '48px',
  editable: true,
});

const authStore = useAuthStore();
const showUploadDialog = ref(false);
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const uploading = ref(false);
const removing = ref(false);

const user = computed(() => authStore.user);
const iconSize = computed(() => {
  const size = parseInt(props.size);
  return size > 60 ? 'lg' : size > 40 ? 'md' : 'sm';
});

const onFileSelected = (file: File | null) => {
  if (file) {
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      selectedFile.value = null;
      previewUrl.value = null;
      return;
    }

    // Validar tamanho do arquivo (2MB)
    if (file.size > 2 * 1024 * 1024) {
      selectedFile.value = null;
      previewUrl.value = null;
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      previewUrl.value = e.target?.result as string;
    };
    reader.onerror = () => {
      selectedFile.value = null;
      previewUrl.value = null;
    };
    reader.readAsDataURL(file);
  } else {
    previewUrl.value = null;
  }
};

const uploadAvatar = async () => {
  if (!selectedFile.value) return;

  uploading.value = true;
  try {
    const success = await authStore.uploadAvatar(selectedFile.value);
    if (success) {
      closeDialog();
    }
  } finally {
    uploading.value = false;
  }
};

const removeAvatar = async () => {
  removing.value = true;
  try {
    const success = await authStore.removeAvatar();
    if (success) {
      closeDialog();
    }
  } finally {
    removing.value = false;
  }
};

const closeDialog = () => {
  showUploadDialog.value = false;
  selectedFile.value = null;
  previewUrl.value = null;
};
</script>

<style scoped>
.avatar-container {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.avatar-container:hover {
  transform: scale(1.05);
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 50%;
  color: white;
}

.avatar-dialog {
  min-width: 320px;
}

@media (max-width: 480px) {
  .avatar-dialog {
    min-width: 280px;
  }
}
</style>
