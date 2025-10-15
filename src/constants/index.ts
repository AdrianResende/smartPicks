// API Endpoints
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        PROFILE: '/auth/profile',
    },
    USERS: {
        BASE: '/users',
        AVATAR: '/users/avatar',
        PROFILE: '/users/profile',
    },
    PALPITES: {
        BASE: '/palpites',
        UPLOAD: '/palpites/upload',
    },
} as const;

// Route Names
export const ROUTE_NAMES = {
    LOGIN: 'login',
    REGISTER: 'cadastro',
    DASHBOARD: 'dashboard',
    ADMIN: 'admin',
    ACCESS_DENIED: 'acesso-negado',
    NOT_FOUND: 'not-found',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'smartpicks_auth_token',
    USER_DATA: 'smartpicks_user_data',
    THEME: 'smartpicks_theme',
} as const;

// Form Validation Messages
export const VALIDATION_MESSAGES = {
    REQUIRED: 'Campo obrigatório',
    EMAIL_INVALID: 'E-mail inválido',
    PASSWORD_MIN: 'Senha deve ter pelo menos 6 caracteres',
    CPF_INVALID: 'CPF inválido',
    DATE_INVALID: 'Data inválida',
    FILE_REQUIRED: 'Selecione um arquivo',
    FILE_SIZE_MAX: 'Arquivo muito grande (máx: 5MB)',
    FILE_TYPE_INVALID: 'Tipo de arquivo inválido',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
} as const;

// User Roles
export const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin',
} as const;

// File Upload Limits
export const FILE_LIMITS = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
} as const;

// App Config
export const APP_CONFIG = {
    NAME: 'SmartPicks',
    VERSION: '1.0.0',
    DESCRIPTION: 'Plataforma de apostas inteligentes',
    SUPPORT_EMAIL: 'support@smartpicks.com',
} as const;

// Breakpoints (matching Quasar)
export const BREAKPOINTS = {
    XS: 0,
    SM: 600,
    MD: 1024,
    LG: 1440,
    XL: 1920,
} as const;

// Animation Durations
export const ANIMATION = {
    FAST: 150,
    BASE: 300,
    SLOW: 500,
} as const;

// Notification Timeouts
export const NOTIFICATION_TIMEOUT = {
    SUCCESS: 3000,
    ERROR: 5000,
    WARNING: 4000,
    INFO: 3000,
} as const;
