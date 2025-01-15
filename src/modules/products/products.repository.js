/**
 * @typedef {Object} Product
 * @property {string} _id
 * @property {string} name
 * @property {number} price
 * @property {string} category
 * @property {string} status
 */

import { loggerService } from "../../services/logger.service.js";

/**
 * @template T
 * @typedef {import('mongodb').Collection<T>} MongoCollection
 */

/**
 * @typedef {import('mongodb').Db} MongoDb
 */

export class ProductsRepository {
  #db;
  #cache;
  collectionName = "products";
  #cacheConfig = {
    ttl: 3600, // 1 hour
    prefix: "products",
    keys: {
      list: (params) => `products:list:${JSON.stringify(params)}`,
      item: (id) => `products:item:${id}`,
    },
  };

  constructor(databaseService, cacheService) {
    this.#db = databaseService;
    this.#cache = cacheService;
  }

  get collection() {
    return this.#db.collection(this.collectionName);
  }

  async find({
    filter = {},
    sort = { createdAt: -1 },
    page = 1,
    limit = 10,
    fields = {},
  } = {}) {
    // Generate cache key
    const cacheKey = this.#cacheConfig.keys.list({
      filter,
      sort,
      page,
      limit,
      fields,
    });
    loggerService.info(`Cache key: ${cacheKey}`);

    // Try to get from cache
    if (this.#cache) {
      const cached = await this.#cache.get(cacheKey);
      if (cached) {
        loggerService.info(`Cache hit for ${cacheKey}`);
        return cached;
      }
      loggerService.info(`Cache miss for ${cacheKey}`);
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [data, total] = await Promise.all([
      this.collection
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .project(fields)
        .toArray(),
      this.collection.countDocuments(filter),
    ]);

    // Prepare result
    const result = {
      data,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };

    // Cache the result
    if (this.#cache) {
      await this.#cache.set(cacheKey, result, this.#cacheConfig.ttl);
    }

    return result;
  }

  async findOne({ filter = {}, fields = {} } = {}) {
    const cacheKey = this.#cache.keys.item(filter._id);
    const cached = await this.#cache.get(cacheKey);
    if (cached) return cached;

    const data = await this.collection.findOne(filter, { projection: fields });
    const result = { data };

    if (data) {
      await this.#cache.set(cacheKey, result, this.#cache.ttl);
    }
    return result;
  }

  async insert({ data = {} } = {}) {
    const result = await this.collection.insertOne(data);
    await this.#invalidateListCache();
    return this.findOne({ filter: { _id: result.insertedId } });
  }

  async update({ id, data = {}, options = { returnDocument: "after" } } = {}) {
    const result = await this.collection.findOneAndUpdate(
      { _id: id },
      { $set: data },
      options,
    );

    if (result) {
      const cacheKey = this.#cache.keys.item(id);
      await this.#cache.set(cacheKey, { data: result }, this.#cache.ttl);
      await this.#invalidateListCache();
    }

    return { data: result };
  }

  async delete({ id } = {}) {
    const result = await this.collection.deleteOne({ _id: id });

    if (result.deletedCount > 0) {
      await this.#cache.del(this.#cache.keys.item(id));
      await this.#invalidateListCache();
    }

    return { success: result.deletedCount > 0 };
  }

  async #invalidateListCache() {
    const keys = await this.#cache.keys("products:list:*");
    if (keys.length) {
      await Promise.all(keys.map((key) => this.#cache.del(key)));
    }
  }
}
