import type { WithId } from 'mongodb';
import { NotFoundError, ValidationError } from '../../services/error/types.ts';
import { ProductsRepository } from './products.repository.ts';
import { productsValidator } from './products.validator.ts';
import type { CreateProductDTO, UpdateProductDTO } from './types';
import type { FindOptions, Product } from './types.ts';

export class ProductsService {
  #repository: ProductsRepository;

  constructor() {
    this.#repository = new ProductsRepository();
  }

  async find(params: FindOptions = {}): Promise<WithId<Product>[]> {
    return this.#repository.find(params);
  }

  async findOne(id: string | undefined): Promise<WithId<Product>> {
    const validation = productsValidator.validateId(id as string);
    if (!validation.isValid) {
      throw new ValidationError(validation.errorMessage);
    }

    const product = await this.#repository.findOne(id as string);
    if (!product) {
      throw new NotFoundError('Product');
    }
    return product;
  }

  async create(data: CreateProductDTO): Promise<WithId<Product>> {
    const validation = productsValidator.validateCreate(data);
    if (!validation.isValid) {
      throw new ValidationError(validation.errorMessage);
    }
    return this.#repository.insert(data);
  }

  async update(id: string | undefined, data: UpdateProductDTO): Promise<WithId<Product>> {
    const idValidation = productsValidator.validateId(id as string);
    if (!idValidation.isValid) {
      throw new ValidationError(idValidation.errorMessage);
    }

    const validation = productsValidator.validateUpdate(data);
    if (!validation.isValid) {
      throw new ValidationError(validation.errorMessage);
    }

    const product = await this.#repository.update(id as string, data);
    if (!product) {
      throw new NotFoundError('Product');
    }
    return product;
  }

  async delete(id: string | undefined): Promise<boolean> {
    const validationResult = productsValidator.validateId(id as string);
    if (!validationResult.isValid) {
      throw new ValidationError(validationResult.errors.join(', '));
    }

    const deleted = await this.#repository.delete(id as string);
    if (!deleted) {
      throw new NotFoundError('Product');
    }

    return true;
  }

  async createProduct(data: CreateProductDTO): Promise<Product> {
    const validationResult = productsValidator.validateCreate(data);
    if (!validationResult.isValid) {
      throw new ValidationError('Invalid product data: ' + JSON.stringify(validationResult.errors));
    }
    return this.#repository.insert(data);
  }

  async updateProduct(id: string, data: UpdateProductDTO): Promise<Product> {
    const idValidation = productsValidator.validateId(id);
    if (!idValidation.isValid) {
      throw new ValidationError('Invalid product ID: ' + idValidation.errors.join(', '));
    }

    const validationResult = productsValidator.validateUpdate(data);
    if (!validationResult.isValid) {
      throw new ValidationError('Invalid product data: ' + JSON.stringify(validationResult.errors));
    }

    const product = await this.#repository.update(id, data);
    if (!product) {
      throw new NotFoundError('Product');
    }
    return product;
  }

  async getProduct(id: string): Promise<Product> {
    const validationResult = productsValidator.validateId(id);
    if (!validationResult.isValid) {
      throw new ValidationError('Invalid product ID: ' + validationResult.errors.join(', '));
    }

    const product = await this.#repository.findOne(id);
    if (!product) {
      throw new NotFoundError('Product');
    }
    return product;
  }
}

export const productsService = new ProductsService();
