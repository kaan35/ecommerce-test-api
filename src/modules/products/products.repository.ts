import type { Collection, WithId } from 'mongodb';
// eslint-disable-next-line no-duplicate-imports
import { ObjectId } from 'mongodb';
import { cacheService } from '../../services/cache/service.ts';
import { databaseService } from '../../services/database/service.ts';
import { dateService } from '../../services/date/service.ts';
import { logService } from '../../services/log/service.ts';
import type { CreateProductDTO, FindOptions, Product } from './types.ts';

const CACHE_KEYS = {
  ALL: 'products:all',
  BY_CATEGORY: (category: string) => `products:category:${category}`,
  BY_ID: (id: string) => `products:${id}`,
} as const;

export class ProductsRepository {
  #collection: Promise<Collection<Product>>;

  constructor() {
    this.#collection = databaseService.collection<Product>('products');
  }

  async #invalidateCache(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => cacheService.del(key))).catch((error: Error) => {
      logService.error({
        context: 'cache',
        error,
        message: 'Failed to invalidate cache',
        meta: { keys },
      });
    });
  }

  async find(options: FindOptions = {}): Promise<WithId<Product>[]> {
    const cacheKey = CACHE_KEYS.ALL;
    const cached = await cacheService.get<WithId<Product>[]>(cacheKey);
    if (cached) return cached;

    const collection = await this.#collection;
    const products = await collection
      .find(options.filter ?? {})
      .sort(options.sort ?? { createdAt: -1 })
      .skip(options.skip ?? 0)
      .limit(options.limit ?? 50)
      .toArray();

    await cacheService.set(cacheKey, products, 60 * 5); // Cache for 5 minutes
    return products;
  }

  async findOne(id: string): Promise<WithId<Product> | null> {
    const cacheKey = CACHE_KEYS.BY_ID(id);
    const cached = await cacheService.get<WithId<Product>>(cacheKey);
    if (cached) return cached;

    const collection = await this.#collection;
    const product = await collection.findOne({ _id: new ObjectId(id) });

    if (product) {
      await cacheService.set(cacheKey, product, 60 * 5); // Cache for 5 minutes
    }

    return product;
  }

  async findByCategory(category: string): Promise<WithId<Product>[]> {
    const cacheKey = CACHE_KEYS.BY_CATEGORY(category);
    const cached = await cacheService.get<WithId<Product>[]>(cacheKey);
    if (cached) return cached;

    const collection = await this.#collection;
    const products = await collection
      .find({ category })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    await cacheService.set(cacheKey, products, 60 * 5); // Cache for 5 minutes
    return products;
  }

  async insert(data: CreateProductDTO): Promise<WithId<Product>> {
    const collection = await this.#collection;

    const result = await collection.insertOne({
      ...data,
      createdAt: dateService.now(),
      createdAtTimestamp: dateService.now('timestamp'),
    } as Product);

    const product = {
      _id: result.insertedId,
      ...data,
    } as WithId<Product>;

    await this.#invalidateCache([CACHE_KEYS.ALL, CACHE_KEYS.BY_CATEGORY(data.category)]);
    return product;
  }

  async update(id: string, data: Partial<Product>): Promise<WithId<Product> | null> {
    const collection = await this.#collection;
    const product = await collection.findOne({ _id: new ObjectId(id) });
    if (!product) return null;

    const updatedProduct = {
      ...product,
      ...data,
      updatedAt: dateService.now(),
      updatedAtTimestamp: dateService.now('timestamp'),
    };

    await collection.updateOne({ _id: new ObjectId(id) }, { $set: updatedProduct });

    await this.#invalidateCache([
      CACHE_KEYS.ALL,
      CACHE_KEYS.BY_ID(id),
      CACHE_KEYS.BY_CATEGORY(product.category),
      ...(data.category && data.category !== product.category
        ? [CACHE_KEYS.BY_CATEGORY(data.category)]
        : []),
    ]);

    return updatedProduct;
  }

  async delete(id: string): Promise<boolean> {
    const collection = await this.#collection;
    const product = await collection.findOne({ _id: new ObjectId(id) });
    if (!product) return false;

    await collection.deleteOne({ _id: new ObjectId(id) });

    await this.#invalidateCache([
      CACHE_KEYS.ALL,
      CACHE_KEYS.BY_ID(id),
      CACHE_KEYS.BY_CATEGORY(product.category),
    ]);

    return true;
  }
}

export const productsRepository = new ProductsRepository();
