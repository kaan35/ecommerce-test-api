import type { WithId } from 'mongodb';
import { NotFoundError, ValidationError } from '../../services/error/types.ts';
import { ProductsRepository } from './products.repository.ts';
import { productsValidator } from './products.validator.ts';
import type { CreateProductDTO, FindOptions, Product, UpdateProductDTO } from './types.ts';

export class ProductsService {
  #repository: ProductsRepository;

  constructor() {
    this.#repository = new ProductsRepository();
  }

  private validateId(id: string): void {
    const validation = productsValidator.validateId(id);
    if (!validation.isValid) {
      throw new ValidationError(validation.errorMessage);
    }
  }

  private async ensureExists(id: string): Promise<WithId<Product>> {
    const product = await this.#repository.findOne(id);
    if (!product) {
      throw new NotFoundError('Product');
    }
    return product;
  }

  async find(params: FindOptions = {}): Promise<WithId<Product>[]> {
    return await this.#repository.find(params);
  }

  async findOne(id: string): Promise<WithId<Product>> {
    this.validateId(id);
    return await this.ensureExists(id);
  }

  async create(data: CreateProductDTO): Promise<WithId<Product>> {
    const validation = productsValidator.validateCreate(data);
    if (!validation.isValid) {
      throw new ValidationError(validation.errorMessage);
    }
    return await this.#repository.insert(data);
  }

  async update(id: string, data: UpdateProductDTO): Promise<WithId<Product> | null> {
    this.validateId(id);
    const validation = productsValidator.validateUpdate(data);
    if (!validation.isValid) {
      throw new ValidationError(validation.errorMessage);
    }
    return await this.#repository.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    this.validateId(id);
    return await this.#repository.delete(id);
  }
}

export const productsService = new ProductsService();
