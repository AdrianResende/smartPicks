import { VALIDATION_MESSAGES } from 'src/constants';

// Email validation
export const validateEmail = (email: string): boolean | string => {
    if (!email) return VALIDATION_MESSAGES.REQUIRED;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) || VALIDATION_MESSAGES.EMAIL_INVALID;
};

// Password validation
export const validatePassword = (password: string): boolean | string => {
    if (!password) return VALIDATION_MESSAGES.REQUIRED;
    return password.length >= 6 || VALIDATION_MESSAGES.PASSWORD_MIN;
};

// Required field validation
export const validateRequired = (value: string): boolean | string => {
    return !!value || VALIDATION_MESSAGES.REQUIRED;
};

// CPF validation
export const validateCPF = (cpf: string): boolean | string => {
    if (!cpf) return VALIDATION_MESSAGES.REQUIRED;

    // Remove formatting
    const cleanCPF = cpf.replace(/\D/g, '');

    // Check length
    if (cleanCPF.length !== 11) return VALIDATION_MESSAGES.CPF_INVALID;

    // Check for repeated digits
    if (/^(\d)\1{10}$/.test(cleanCPF)) return VALIDATION_MESSAGES.CPF_INVALID;

    // Validate CPF algorithm
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return VALIDATION_MESSAGES.CPF_INVALID;

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return VALIDATION_MESSAGES.CPF_INVALID;

    return true;
};

// Date validation (DD/MM/YYYY)
export const validateDate = (date: string): boolean | string => {
    if (!date) return VALIDATION_MESSAGES.REQUIRED;

    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = date.match(dateRegex);

    if (!match) return VALIDATION_MESSAGES.DATE_INVALID;

    const day = parseInt(match[1]!);
    const month = parseInt(match[2]!);
    const year = parseInt(match[3]!);

    const dateObj = new Date(year, month - 1, day);
    const isValid = dateObj.getDate() === day &&
        dateObj.getMonth() === month - 1 &&
        dateObj.getFullYear() === year;

    if (!isValid) return VALIDATION_MESSAGES.DATE_INVALID;

    // Check if date is not in the future (for birth dates)
    const today = new Date();
    if (dateObj > today) return 'Data não pode ser no futuro';

    // Check minimum age (18 years)
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 18);
    if (dateObj > minDate) return 'Você deve ter pelo menos 18 anos';

    return true;
};

// File validation
export const validateFile = (file: File | null): boolean | string => {
    if (!file) return VALIDATION_MESSAGES.FILE_REQUIRED;

    // Check file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) return VALIDATION_MESSAGES.FILE_SIZE_MAX;

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) return VALIDATION_MESSAGES.FILE_TYPE_INVALID;

    return true;
};

// URL validation
export const validateURL = (url: string): boolean | string => {
    if (!url) return true; // Optional field

    try {
        new URL(url);
        return true;
    } catch {
        return 'URL inválida';
    }
};

// Name validation
export const validateName = (name: string): boolean | string => {
    if (!name) return VALIDATION_MESSAGES.REQUIRED;
    if (name.length < 2) return 'Nome deve ter pelo menos 2 caracteres';
    if (name.length > 100) return 'Nome muito longo';
    return true;
};

// Generic validation rules object
export const VALIDATION_RULES = {
    required: validateRequired,
    email: validateEmail,
    password: validatePassword,
    cpf: validateCPF,
    date: validateDate,
    file: validateFile,
    url: validateURL,
    name: validateName,
} as const;
