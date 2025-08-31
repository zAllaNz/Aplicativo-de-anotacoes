export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
};

export const validatePassword = (password: string): boolean => {
  // Senha deve ter pelo menos 8 caracteres, incluindo pelo menos uma letra e um número
  const minLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  return minLength && hasLetter && hasNumber;
};

export const validateName = (name: string): boolean => {
  const trimmedName = name.trim();
  return trimmedName.length >= 2 && trimmedName.length <= 50;
};

export const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword && password.length > 0;
};

export const getPasswordStrength = (password: string): { strength: 'weak' | 'medium' | 'strong'; message: string } => {
  if (password.length < 6) {
    return { strength: 'weak', message: 'Muito curta' };
  }
  
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isLongEnough = password.length >= 8;
  
  const criteriaCount = [hasLower, hasUpper, hasNumber, hasSpecial, isLongEnough].filter(Boolean).length;
  
  if (criteriaCount < 3) {
    return { strength: 'weak', message: 'Fraca - adicione mais caracteres' };
  } else if (criteriaCount < 5) {
    return { strength: 'medium', message: 'Média - pode melhorar' };
  } else {
    return { strength: 'strong', message: 'Forte' };
  }
};
