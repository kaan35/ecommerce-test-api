import type { WithId } from 'mongodb';
import { ProductsRepository } from './products.repository.ts';
import type { FindOptions, Product } from './types.ts';

export class ProductsService {
  #repository: ProductsRepository;

  constructor() {
    this.#repository = new ProductsRepository();
  }

  async find(params: FindOptions = {}): Promise<WithId<Product>[]> {
    return this.#repository.find(params);
  }

  async findOne(id: string): Promise<WithId<Product> | null> {
    return this.#repository.findOne(id);
  }

  async create(data: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>): Promise<WithId<Product>> {
    return this.#repository.insert(data);
  }

  async update(id: string, data: Partial<Product>): Promise<WithId<Product> | null> {
    return this.#repository.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.#repository.delete(id);
  }
}

export const productsService = new ProductsService();
