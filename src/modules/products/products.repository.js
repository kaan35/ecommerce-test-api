import { cacheService } from '../../services/cache.service.js';
import { databaseService } from '../../services/database.service.js';
import { dateService } from '../../services/date.service.js';
import { LOG_CONTEXTS, loggerService } from '../../services/logger.service.ts';

/**
 * @typedef {Object} Product
 * @property {string} id - Product unique identifier
 * @property {string} name - Product name
 * @property {string} description - Product description
 * @property {number} price - Product price
 * @property {string} category - Product category
 * @property {string[]} images - Array of image URLs
 * @property {boolean} isActive - Product status
 * @property {number} createdAt - Creation timestamp
 * @property {number} updatedAt - Last update timestamp
 */

/**
 * Cache key patterns for products
 * @readonly
 * @enum {string}
 */
const CACHE_KEYS = {
  /** @type {'products:all'} */
  ALL: 'products:all',
  /** @type {'products:category'} */
  BY_CATEGORY: 'products:category',
  /** @type {'products:id'} */
  BY_ID: 'products:id',
};

/**
 * Repository for managing product data in MongoDB
 */
export class ProductsRepository {
  /** @type {import('mongodb').Collection} */
  #collection;

  constructor() {
    // Collection will be initialized on first use
  }

  /**
   * Get the products collection, initializing it if needed
   * @private
   * @returns {Promise<import('mongodb').Collection>}
   */
  async #getCollection() {
    if (!this.#collection) {
      this.#collection = await databaseService.collection('products');
    }
    return this.#collection;
  }

  /**
   * Get cache key for a specific product
   * @param {string} id - Product ID
   * @returns {`products:id:${string}`}
   */
  #getProductCacheKey(id) {
    return `${CACHE_KEYS.BY_ID}:${id}`;
  }

  /**
   * Get cache key for products by category
   * @param {string} category - Product category
   * @returns {`products:category:${string}`}
   */
  #getCategoryCacheKey(category) {
    return `${CACHE_KEYS.BY_CATEGORY}:${category}`;
  }

  /**
   * Invalidate product caches
   * @param {string} id - Product ID
   * @param {string} [category] - Product category
   * @returns {Promise<void>}
   */
  async #invalidateCache(id, category) {
    const promises = [
      cacheService.del(CACHE_KEYS.ALL),
      cacheService.del(this.#getProductCacheKey(id)),
    ];

    if (category) {
      promises.push(cacheService.del(this.#getCategoryCacheKey(category)));
    }

    return Promise.all(promises);
  }

  /**
   * Find all products with optional filtering
   * @param {Object} [options] - Query options
   * @param {Object} [options.filter] - MongoDB filter
   * @param {Object} [options.sort] - Sort options
   * @param {number} [options.limit] - Maximum number of products
   * @param {number} [options.skip] - Number of products to skip
   * @returns {Promise<Product[]>}
   */
  async find(options = {}) {
    const cacheKey = CACHE_KEYS.ALL;
    const cached = await cacheService.get(cacheKey);

    if (cached) {
      loggerService.debug({
        context: LOG_CONTEXTS.CACHE,
        message: 'Products retrieved from cache',
        meta: { count: cached.length },
      });
      return cached;
    }

    const collection = await this.#getCollection();
    const products = await collection
      .find(options.filter || {})
      .sort(options.sort || { createdAt: -1 })
      .skip(options.skip || 0)
      .limit(options.limit || 50)
      .toArray()
      .catch((error) => {
        loggerService.error({
          context: LOG_CONTEXTS.DATABASE,
          error,
          message: 'Error finding products',
          meta: { options },
        });
        throw error;
      });

    await cacheService.set(cacheKey, products, 3600);
    return products;
  }

  /**
   * Find a single product by ID
   * @param {string} id - Product ID
   * @returns {Promise<Product | null>}
   */
  async findOne(id) {
    const cacheKey = this.#getProductCacheKey(id);
    const cached = await cacheService.get(cacheKey);

    if (cached) {
      loggerService.info({
        context: LOG_CONTEXTS.CACHE,
        message: 'Product retrieved from cache',
        meta: { id },
      });
      return cached;
    }

    const collection = await this.#getCollection();
    const product = await collection.findOne({ _id: id }).catch((error) => {
      loggerService.error({
        context: LOG_CONTEXTS.DATABASE,
        error,
        message: 'Error finding product',
        meta: { id },
      });
      throw error;
    });

    if (product) {
      await cacheService.set(cacheKey, product, 3600);
    }
    return product;
  }

  /**
   * Find products by category
   * @param {string} category - Product category
   * @param {Object} [options] - Query options
   * @param {Object} [options.sort] - Sort options
   * @param {number} [options.limit] - Maximum number of products
   * @param {number} [options.skip] - Number of products to skip
   * @returns {Promise<Product[]>}
   */
  async findByCategory(category, options = {}) {
    const cacheKey = this.#getCategoryCacheKey(category);
    const cached = await cacheService.get(cacheKey);

    if (cached) {
      loggerService.info({
        context: LOG_CONTEXTS.CACHE,
        message: 'Products by category retrieved from cache',
        meta: { category, count: cached.length },
      });
      return cached;
    }

    const collection = await this.#getCollection();
    const products = await collection
      .find({ category })
      .sort(options.sort || { createdAt: -1 })
      .skip(options.skip || 0)
      .limit(options.limit || 50)
      .toArray()
      .catch((error) => {
        loggerService.error({
          context: LOG_CONTEXTS.DATABASE,
          error,
          message: 'Error finding products by category',
          meta: { category, options },
        });
        throw error;
      });

    await cacheService.set(cacheKey, products, 3600);
    return products;
  }

  /**
   * Insert a new product
   * @param {Omit<Product, 'id' | 'createdAt' | 'updatedAt'>} product - Product data
   * @returns {Promise<Product>}
   */
  async insert(product) {
    const timestamp = dateService.now();
    const newProduct = {
      ...product,
      createdAt: timestamp,
      updatedAt: timestamp,
      isActive: true,
    };

    const collection = await this.#getCollection();
    const result = await collection.insertOne(newProduct).catch((error) => {
      loggerService.error({
        context: LOG_CONTEXTS.DATABASE,
        error,
        message: 'Error inserting product',
        meta: { product },
      });
      throw error;
    });

    const inserted = { ...newProduct, id: result.insertedId };
    await this.#invalidateCache(inserted.id, inserted.category);
    return inserted;
  }

  /**
   * Update an existing product
   * @param {string} id - Product ID
   * @param {Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>} update - Update data
   * @returns {Promise<Product | null>}
   */
  async update(id, update) {
    const collection = await this.#getCollection();
    const product = await collection.findOne({ _id: id }).catch((error) => {
      loggerService.error({
        context: LOG_CONTEXTS.DATABASE,
        error,
        message: 'Error finding product for update',
        meta: { id, update },
      });
      throw error;
    });

    if (!product) return null;

    const updatedProduct = {
      ...product,
      ...update,
      updatedAt: dateService.now(),
    };

    await collection.updateOne({ _id: id }, { $set: updatedProduct }).catch((error) => {
      loggerService.error({
        context: LOG_CONTEXTS.DATABASE,
        error,
        message: 'Error updating product',
        meta: { id, update },
      });
      throw error;
    });

    await this.#invalidateCache(id, updatedProduct.category);
    return updatedProduct;
  }

  /**
   * Delete a product
   * @param {string} id - Product ID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const collection = await this.#getCollection();
    const product = await collection.findOne({ _id: id }).catch((error) => {
      loggerService.error({
        context: LOG_CONTEXTS.DATABASE,
        error,
        message: 'Error finding product for deletion',
        meta: { id },
      });
      throw error;
    });

    if (!product) return false;

    await collection.deleteOne({ _id: id }).catch((error) => {
      loggerService.error({
        context: LOG_CONTEXTS.DATABASE,
        error,
        message: 'Error deleting product',
        meta: { id },
      });
      throw error;
    });

    await this.#invalidateCache(id, product.category);
    return true;
  }
}
