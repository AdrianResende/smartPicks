export const sanitizeHtml = (input: string): string => {
  if (!input) return '';

  return input
    .replace(/[<>'"&]/g, (char) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;',
      };
      return entities[char] || char;
    })
    .trim();
};

export const sanitizeForDisplay = (input: string): string => {
  if (!input) return '';

  return sanitizeHtml(input).replace(/\s+/g, ' ').slice(0, 1000);
};

export const sanitizeEmail = (email: string): string => {
  if (!email) return '';

  return email
    .toLowerCase()
    .trim()
    .replace(/[^\w\-@.]/g, '');
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePasswordStrength = (
  password: string,
): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('Senha deve ter pelo menos 8 caracteres');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Senha deve conter pelo menos uma letra minúscula');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Senha deve conter pelo menos uma letra maiúscula');
  } else {
    score += 1;
  }

  if (!/\d/.test(password)) {
    feedback.push('Senha deve conter pelo menos um número');
  } else {
    score += 1;
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Senha deve conter pelo menos um caractere especial');
  } else {
    score += 1;
  }

  const isValid = score >= 3; // Pelo menos 3 critérios atendidos

  return {
    isValid,
    score,
    feedback,
  };
};

/**
 * Limita tamanho de input para prevenir ataques de negação de serviço
 */
export const limitInputSize = (input: string, maxLength: number = 1000): string => {
  if (!input) return '';
  return input.slice(0, maxLength);
};

/**
 * Remove caracteres de controle que podem ser perigosos
 */
export const removeControlCharacters = (input: string): string => {
  if (!input) return '';
  // Remove caracteres de controle exceto \n, \r, \t
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
};

/**
 * Sanitização completa para inputs de usuário
 */
export const sanitizeUserInput = (input: string, maxLength: number = 1000): string => {
  if (!input) return '';

  return limitInputSize(removeControlCharacters(sanitizeHtml(input)), maxLength);
};
