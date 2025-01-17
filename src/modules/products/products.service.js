import { cacheService } from '../../services/cache.service.js';
import { databaseService } from '../../services/database.service.js';
import { ProductsRepository } from './products.repository.js';

export class ProductsService {
  #repository;

  constructor() {
    this.#repository = new ProductsRepository(databaseService, cacheService);
  }

  async find(params = {}) {
    return this.#repository.find(params);
  }

  async findOne(id) {
    return this.#repository.findOne({ filter: { _id: id } });
  }

  async create(data) {
    return this.#repository.insert({ data });
  }

  async update(id, data) {
    return this.#repository.update({ id, data });
  }

  async delete(id) {
    return this.#repository.delete({ id });
  }
}

export const productsService = new ProductsService();
