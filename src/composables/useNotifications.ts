import { useQuasar } from 'quasar';

export function useNotifications() {
    const $q = useQuasar();

    const showSuccess = (message: string) => {
        $q.notify({
            type: 'positive',
            message,
            position: 'top-right',
            timeout: 3000,
            icon: 'check_circle',
        });
    };

    const showError = (message: string) => {
        $q.notify({
            type: 'negative',
            message,
            position: 'top-right',
            timeout: 5000,
            icon: 'error',
        });
    };

    const showWarning = (message: string) => {
        $q.notify({
            type: 'warning',
            message,
            position: 'top-right',
            timeout: 4000,
            icon: 'warning',
        });
    };

    const showInfo = (message: string) => {
        $q.notify({
            type: 'info',
            message,
            position: 'top-right',
            timeout: 3000,
            icon: 'info',
        });
    };

    return {
        showSuccess,
        showError,
        showWarning,
        showInfo,
    };
}
