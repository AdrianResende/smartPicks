import { api } from 'src/boot/axios';

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface ApiError {
    response?: {
        status: number;
        data?: {
            message?: string;
        };
    };
    message?: string;
}

export function useApi() {
    const handleApiError = (error: ApiError): string => {
        let errorMessage = 'Erro inesperado. Tente novamente.';

        if (error?.response) {
            const status = error.response.status;
            const data = error.response.data;

            switch (status) {
                case 400:
                    errorMessage = data?.message || 'Dados inválidos';
                    break;
                case 401:
                    errorMessage = 'Você precisa estar logado';
                    break;
                case 403:
                    errorMessage = 'Acesso negado';
                    break;
                case 404:
                    errorMessage = 'Recurso não encontrado';
                    break;
                case 422:
                    errorMessage = data?.message || 'Dados inválidos';
                    break;
                case 500:
                    errorMessage = 'Erro interno do servidor';
                    break;
                default:
                    errorMessage = data?.message || `Erro ${status}`;
            }
        } else if (error?.message) {
            errorMessage = error.message;
        }

        return errorMessage;
    };

    const get = async <T = unknown>(url: string): Promise<ApiResponse<T>> => {
        try {
            const response = await api.get(url);
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            const errorMessage = handleApiError(error as ApiError);
            return {
                success: false,
                error: errorMessage,
            };
        }
    };

    const post = async <T = unknown>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
        try {
            const response = await api.post(url, data);
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            const errorMessage = handleApiError(error as ApiError);
            return {
                success: false,
                error: errorMessage,
            };
        }
    };

    const put = async <T = unknown>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
        try {
            const response = await api.put(url, data);
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            const errorMessage = handleApiError(error as ApiError);
            return {
                success: false,
                error: errorMessage,
            };
        }
    };

    const del = async <T = unknown>(url: string): Promise<ApiResponse<T>> => {
        try {
            const response = await api.delete(url);
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            const errorMessage = handleApiError(error as ApiError);
            return {
                success: false,
                error: errorMessage,
            };
        }
    };

    return {
        get,
        post,
        put,
        delete: del,
        handleApiError,
    };
}
