import type { ValidatorOptions } from './types.ts';
import { Validator } from './validator.ts';

class ValidationService {
  createValidator<T>(options?: ValidatorOptions): Validator<T> {
    return new Validator<T>(options);
  }
}

export const validationService = new ValidationService();
