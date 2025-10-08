import { ref, computed, readonly } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth';

export interface AvatarValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
  minDimensions?: { width: number; height: number };
  maxDimensions?: { width: number; height: number };
}

export function useAvatar(options: AvatarValidationOptions = {}) {
  const $q = useQuasar();
  const authStore = useAuthStore();

  // Configurações padrão
  const defaultOptions: Required<AvatarValidationOptions> = {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    minDimensions: { width: 100, height: 100 },
    maxDimensions: { width: 2048, height: 2048 },
  };

  const config = { ...defaultOptions, ...options };

  // Estado reativo
  const isUploading = ref(false);
  const isRemoving = ref(false);
  const uploadProgress = ref(0);

  // Computed properties
  const user = computed(() => authStore.user);
  const hasAvatar = computed(() => !!user.value?.avatar);
  const isProcessing = computed(() => isUploading.value || isRemoving.value);

  // Validação de arquivo
  const validateFile = async (file: File): Promise<string | null> => {
    // Validar tipo
    if (!config.allowedTypes.includes(file.type)) {
      return `Formato não suportado. Use: ${config.allowedTypes.map(type => type.split('/')[1]?.toUpperCase() || 'UNKNOWN').join(', ')}`;
    }

    // Validar tamanho
    if (file.size > config.maxSize) {
      const maxSizeMB = config.maxSize / (1024 * 1024);
      return `Arquivo muito grande. Máximo permitido: ${maxSizeMB}MB`;
    }

    // Validar dimensões da imagem
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const { width, height } = img;

        if (width < config.minDimensions.width || height < config.minDimensions.height) {
          resolve(`Imagem muito pequena. Mínimo: ${config.minDimensions.width}x${config.minDimensions.height}px`);
        } else if (width > config.maxDimensions.width || height > config.maxDimensions.height) {
          resolve(`Imagem muito grande. Máximo: ${config.maxDimensions.width}x${config.maxDimensions.height}px`);
        } else {
          resolve(null);
        }

        URL.revokeObjectURL(img.src);
      };

      img.onerror = () => {
        resolve('Arquivo de imagem inválido');
        URL.revokeObjectURL(img.src);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Criar preview da imagem
  const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const result = e.target?.result as string;
        resolve(result);
      };

      reader.onerror = () => {
        reject(new Error('Erro ao ler o arquivo'));
      };

      reader.readAsDataURL(file);
    });
  };

  // Upload do avatar
  const uploadAvatar = async (file: File): Promise<boolean> => {
    if (isProcessing.value) return false;

    try {
      // Validar arquivo
      const validationError = await validateFile(file);
      if (validationError) {
        $q.notify({
          type: 'negative',
          message: validationError,
          position: 'top',
          timeout: 4000,
          icon: 'error',
        });
        return false;
      }

      isUploading.value = true;
      uploadProgress.value = 0;

      // Simular progresso (opcional - pode ser removido se a API não suportar)
      const progressInterval = setInterval(() => {
        if (uploadProgress.value < 90) {
          uploadProgress.value += Math.random() * 20;
        }
      }, 200);

      const success = await authStore.uploadAvatar(file);

      clearInterval(progressInterval);
      uploadProgress.value = 100;

      if (success) {
        $q.notify({
          type: 'positive',
          message: hasAvatar.value ? 'Avatar atualizado com sucesso!' : 'Avatar adicionado com sucesso!',
          position: 'top',
          timeout: 3000,
          icon: 'check_circle',
        });
        return true;
      } else {
        throw new Error('Falha no upload');
      }

    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      $q.notify({
        type: 'negative',
        message: 'Erro ao salvar avatar. Tente novamente.',
        position: 'top',
        timeout: 4000,
        icon: 'error',
      });
      return false;
    } finally {
      isUploading.value = false;
      uploadProgress.value = 0;
    }
  };

  // Remover avatar
  const removeAvatar = async (): Promise<boolean> => {
    if (isProcessing.value || !hasAvatar.value) return false;

    try {
      isRemoving.value = true;

      const success = await authStore.removeAvatar();

      if (success) {
        $q.notify({
          type: 'positive',
          message: 'Avatar removido com sucesso!',
          position: 'top',
          timeout: 3000,
          icon: 'check_circle',
        });
        return true;
      } else {
        throw new Error('Falha na remoção');
      }

    } catch (error) {
      console.error('Erro ao remover avatar:', error);
      $q.notify({
        type: 'negative',
        message: 'Erro ao remover avatar. Tente novamente.',
        position: 'top',
        timeout: 4000,
        icon: 'error',
      });
      return false;
    } finally {
      isRemoving.value = false;
    }
  };

  // Confirmar remoção do avatar
  const confirmRemoveAvatar = (): Promise<boolean> => {
    return new Promise((resolve) => {
      $q.dialog({
        title: 'Remover Avatar',
        message: 'Tem certeza que deseja remover seu avatar?',
        cancel: {
          label: 'Cancelar',
          flat: true,
        },
        ok: {
          label: 'Remover',
          color: 'negative',
          unelevated: true,
        },
        persistent: false,
      }).onOk(() => {
        void removeAvatar().then(resolve);
      }).onCancel(() => {
        resolve(false);
      });
    });
  };

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return {
    // Estado
    isUploading: readonly(isUploading),
    isRemoving: readonly(isRemoving),
    isProcessing,
    uploadProgress: readonly(uploadProgress),

    // Computed
    user,
    hasAvatar,

    // Métodos
    validateFile,
    createImagePreview,
    uploadAvatar,
    removeAvatar,
    confirmRemoveAvatar,
    formatFileSize,

    // Configuração
    config: readonly(config),
  };
}