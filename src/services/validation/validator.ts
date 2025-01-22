import type { ValidationResult, ValidationRule, ValidatorOptions } from './types';

export class Validator<T> {
  private rules: ValidationRule<T>[] = [];
  private options: ValidatorOptions = {
    stopOnFirstError: false,
  };

  constructor(options?: ValidatorOptions) {
    this.options = { ...this.options, ...options };
  }

  addRule(rule: ValidationRule<T>): this {
    this.rules.push(rule);
    return this;
  }

  required(message = 'Value is required'): this {
    return this.addRule({
      validate: (value) => value !== undefined && value !== null && value !== '',
      message,
    });
  }

  min(min: number, message = `Value must be at least ${min}`): this {
    return this.addRule({
      validate: (value) => {
        if (typeof value === 'number') {
          return value >= min;
        }
        if (typeof value === 'string' || Array.isArray(value)) {
          return value.length >= min;
        }
        return false;
      },
      message,
    });
  }

  max(max: number, message = `Value must be at most ${max}`): this {
    return this.addRule({
      validate: (value) => {
        if (typeof value === 'number') {
          return value <= max;
        }
        if (typeof value === 'string' || Array.isArray(value)) {
          return value.length <= max;
        }
        return false;
      },
      message,
    });
  }

  matches(pattern: RegExp, message = 'Value does not match pattern'): this {
    return this.addRule({
      validate: (value) => pattern.test(String(value)),
      message,
    });
  }

  email(message = 'Invalid email address'): this {
    return this.matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message);
  }

  custom(validateFn: (value: T) => boolean, message: string): this {
    return this.addRule({ validate: validateFn, message });
  }

  validate(value: T): ValidationResult {
    const errors: string[] = [];

    for (const rule of this.rules) {
      if (!rule.validate(value)) {
        errors.push(rule.message);
        if (this.options.stopOnFirstError) {
          break;
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      errorMessage: errors.join(', '),
    };
  }
}
