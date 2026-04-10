/**
 * Système de validation centralisé pour les formulaires ERP
 * Système ERP La Plume Artisanale
 */

export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  custom?: (value: any) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Valide une valeur selon une règle
 */
export function validateField(value: any, rule: ValidationRule, fieldName: string): string | null {
  // Required
  if (rule.required && (value === null || value === undefined || value === '')) {
    return `${fieldName} est requis`;
  }

  // Si la valeur est vide et non requise, pas de validation
  if (!value && !rule.required) {
    return null;
  }

  // Min/Max pour les nombres
  if (typeof value === 'number') {
    if (rule.min !== undefined && value < rule.min) {
      return `${fieldName} doit être supérieur ou égal à ${rule.min}`;
    }
    if (rule.max !== undefined && value > rule.max) {
      return `${fieldName} doit être inférieur ou égal à ${rule.max}`;
    }
  }

  // MinLength/MaxLength pour les strings
  if (typeof value === 'string') {
    if (rule.minLength !== undefined && value.length < rule.minLength) {
      return `${fieldName} doit contenir au moins ${rule.minLength} caractères`;
    }
    if (rule.maxLength !== undefined && value.length > rule.maxLength) {
      return `${fieldName} doit contenir au maximum ${rule.maxLength} caractères`;
    }
  }

  // Pattern
  if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
    return `${fieldName} n'est pas au bon format`;
  }

  // Email
  if (rule.email && typeof value === 'string') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return `${fieldName} doit être une adresse email valide`;
    }
  }

  // Phone
  if (rule.phone && typeof value === 'string') {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(value)) {
      return `${fieldName} doit être un numéro de téléphone valide`;
    }
  }

  // Custom validation
  if (rule.custom) {
    return rule.custom(value);
  }

  return null;
}

/**
 * Valide un objet complet selon des règles
 */
export function validateForm(data: Record<string, any>, rules: Record<string, ValidationRule>): ValidationResult {
  const errors: Record<string, string> = {};

  Object.keys(rules).forEach(fieldName => {
    const rule = rules[fieldName];
    const value = data[fieldName];
    const error = validateField(value, rule, fieldName);
    
    if (error) {
      errors[fieldName] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Règles de validation communes
 */
export const commonRules = {
  required: { required: true },
  email: { email: true },
  phone: { phone: true },
  positiveNumber: { 
    required: true,
    min: 0,
    custom: (value: any) => {
      if (typeof value !== 'number' || isNaN(value)) {
        return 'Doit être un nombre valide';
      }
      return null;
    }
  },
  percentage: {
    min: 0,
    max: 100,
    custom: (value: any) => {
      if (typeof value !== 'number' || isNaN(value)) {
        return 'Doit être un nombre valide';
      }
      return null;
    }
  },
  date: {
    required: true,
    custom: (value: any) => {
      if (!value) return null;
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return 'Doit être une date valide';
      }
      return null;
    }
  }
};

export default {
  validateField,
  validateForm,
  commonRules
};
