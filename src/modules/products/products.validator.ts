import { validationService } from '../../services/validation/service.ts';
import type { CreateProductDTO, UpdateProductDTO } from './types.ts';

export class ProductValidator {
  private idValidator = validationService
    .createValidator<string>()
    .required('Product ID is required')
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid product ID format');

  private nameValidator = validationService
    .createValidator<string>()
    .required('Product name is required')
    .min(3, 'Product name must be at least 3 characters long')
    .max(100, 'Product name must not exceed 100 characters');

  private priceValidator = validationService
    .createValidator<number>()
    .required('Product price is required')
    .min(0, 'Product price must be greater than or equal to 0')
    .custom(
      (value) => Number.isFinite(value) && value === Math.round(value * 100) / 100,
      'Product price must have at most 2 decimal places',
    );

  validateId(id: string) {
    return this.idValidator.validate(id);
  }

  validateCreate(data: CreateProductDTO) {
    const errors: Record<string, string[]> = {};
    let hasErrors = false;

    const nameResult = this.nameValidator.validate(data.name);
    if (!nameResult.isValid) {
      errors.name = nameResult.errors;
      hasErrors = true;
    }

    const priceResult = this.priceValidator.validate(data.price);
    if (!priceResult.isValid) {
      errors.price = priceResult.errors;
      hasErrors = true;
    }

    return {
      isValid: !hasErrors,
      errors,
      errorMessage: Object.values(errors).flat().join(', '),
    };
  }

  validateUpdate(data: UpdateProductDTO) {
    const errors: Record<string, string[]> = {};
    let hasErrors = false;

    if (data.name !== undefined) {
      const nameResult = this.nameValidator.validate(data.name);
      if (!nameResult.isValid) {
        errors.name = nameResult.errors;
        hasErrors = true;
      }
    }

    if (data.price !== undefined) {
      const priceResult = this.priceValidator.validate(data.price);
      if (!priceResult.isValid) {
        errors.price = priceResult.errors;
        hasErrors = true;
      }
    }

    return {
      isValid: !hasErrors,
      errors,
      errorMessage: Object.values(errors).flat().join(', '),
    };
  }
}

export const productsValidator = new ProductValidator();
