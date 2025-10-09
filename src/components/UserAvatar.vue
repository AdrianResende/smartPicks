<template>
  <div class="avatar-upload">
    <!-- Avatar principal -->
    <q-avatar
      :size="size"
      :color="user?.avatar ? 'transparent' : 'primary'"
      :text-color="user?.avatar ? 'transparent' : 'white'"
      class="cursor-pointer"
      @click="openUploadDialog"
    >
      <q-img v-if="user?.avatar" :src="user.avatar" />
      <q-icon v-else name="person" :size="iconSize" />

      <q-tooltip v-if="editable">
        {{ user?.avatar ? 'Alterar avatar' : 'Adicionar avatar' }}
      </q-tooltip>
    </q-avatar>

    <!-- Dialog de upload -->
    <q-dialog v-model="showUploadDialog" persistent>
      <q-card class="q-pa-md rounded-borders shadow-2" style="min-width: 400px">
        <q-card-section class="text-center">
          <div class="text-h6">
            {{ user?.avatar ? 'Alterar Avatar' : 'Adicionar Avatar' }}
          </div>
        </q-card-section>

        <q-card-section class="text-center">
          <q-avatar size="140px" class="shadow-1 q-mb-md" rounded>
            <q-img
              v-if="previewUrl || user?.avatar"
              :src="previewUrl || user?.avatar"
              class="q-img-cover"
            />
            <q-icon v-else name="person" size="70px" color="grey-5" />
          </q-avatar>
          <q-btn
            v-if="previewUrl || user?.avatar"
            fab-mini
            color="negative"
            icon="close"
            class="absolute-top-right"
            @click="clearPreview"
            :disable="isProcessing"
          />
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
            label="Escolher nova imagem"
            accept="image/jpeg,image/png,image/gif,image/webp"
            max-file-size="10485760"
            @update:model-value="onFileSelected"
            @rejected="onFileRejected"
            class="full-width q-mb-md"
            :error="!!fileError"
            :error-message="fileError"
            :disable="isProcessing"
          >
            <template v-slot:prepend>
              <q-icon name="image" color="primary" />
            </template>
            <template v-slot:append>
              <q-btn round dense flat icon="info" color="info" size="sm">
                <q-tooltip class="bg-info">
                  <div class="text-body2">
                    <strong>Formatos:</strong> JPG, PNG, GIF, WebP<br />
                    <strong>Tamanho máximo:</strong> 10MB<br />
                    <strong>Resolução recomendada:</strong> 800x800px ou superior
                  </div>
                </q-tooltip>
              </q-btn>
            </template>
          </q-file>

          <div class="text-caption text-grey-6">
            💡 A imagem será otimizada automaticamente<br />
            🎯 Recomendamos resolução mínima de 800x800px
          </div>
        </q-card-section>

        <q-card-actions align="center" class="q-pt-md q-pb-lg q-px-lg">
          <q-btn flat label="Cancelar" @click="closeDialog" :disable="isProcessing" />
          <q-btn
            v-if="user?.avatar && !previewUrl"
            flat
            color="negative"
            label="Remover Avatar"
            icon="delete"
            @click="handleRemoveAvatar"
            :loading="isRemoving"
            :disable="isUploading"
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
const fileError = ref('');
const isUploading = ref(false);
const isRemoving = ref(false);
const uploadProgress = ref(0);
const isOptimizing = ref(false);

const user = computed(() => authStore.user);
const isProcessing = computed(() => isUploading.value || isRemoving.value || isOptimizing.value);
const canSave = computed(() => selectedFile.value && !fileError.value && !isProcessing.value);
const iconSize = computed(() =>
  parseInt(props.size) > 60 ? 'lg' : parseInt(props.size) > 40 ? 'md' : 'sm',
);

const openUploadDialog = () => {
  if (props.editable) showUploadDialog.value = true;
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

const validateFile = (file: File) => {
  const maxSize = 10 * 1024 * 1024;
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) return 'Formato não suportado. Use JPG, PNG, GIF ou WebP.';
  if (file.size > maxSize) return 'Arquivo muito grande. Máximo permitido: 10MB.';
  return null;
};

const createImagePreview = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsDataURL(file);
  });

const resizeAndOptimizeImage = (file: File) =>
  new Promise<File>((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const targetSize = 800;
      canvas.width = targetSize;
      canvas.height = targetSize;

      if (!ctx) return reject(new Error('Erro ao criar contexto'));

      const size = Math.min(img.width, img.height);
      const offsetX = (img.width - size) / 2;
      const offsetY = (img.height - size) / 2;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, targetSize, targetSize);

      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Erro ao processar imagem'));
        resolve(new File([blob], `avatar_${Date.now()}.jpg`, { type: 'image/jpeg' }));
      }, 'image/jpeg');
    };

    img.onerror = () => reject(new Error('Erro ao carregar imagem'));
    img.src = URL.createObjectURL(file);
  });

const onFileSelected = async (file: File | null) => {
  if (!file) return clearPreview();
  const error = validateFile(file);
  if (error) {
    fileError.value = error;
    selectedFile.value = null;
    return;
  }

  try {
    isOptimizing.value = true;
    previewUrl.value = await createImagePreview(file);
    selectedFile.value = await resizeAndOptimizeImage(file);
    previewUrl.value = await createImagePreview(selectedFile.value);
  } catch {
    fileError.value = 'Erro ao processar imagem';
    selectedFile.value = previewUrl.value = null;
  } finally {
    isOptimizing.value = false;
  }
};

const onFileRejected = () => {
  fileError.value = 'Arquivo rejeitado. Verifique formato/tamanho.';
};

const handleUploadAvatar = async () => {
  if (!selectedFile.value) return;
  isUploading.value = true;
  uploadProgress.value = 20;

  try {
    await authStore.uploadAvatar(selectedFile.value);
    uploadProgress.value = 100;
    closeDialog();
  } finally {
    isUploading.value = false;
    uploadProgress.value = 0;
  }
};

const handleRemoveAvatar = () => {
  $q.dialog({
    title: 'Confirmar',
    message: 'Tem certeza que deseja remover seu avatar?',
    ok: { push: true, color: 'negative', label: 'Remover' },
    cancel: { push: true, color: 'grey', label: 'Cancelar' },
    persistent: true,
  }).onOk(() => {
    void (async () => {
      isRemoving.value = true;
      try {
        await authStore.removeAvatar();
        closeDialog();
      } finally {
        isRemoving.value = false;
      }
    })();
  });
};
</script>

<style scoped>
.absolute-top-right {
  position: absolute;
  top: -8px;
  right: -8px;
}
</style>
