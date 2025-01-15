import { ObjectId } from 'mongodb';
import { cacheService } from '../../services/cache.service.js';
import { config } from '../../services/config.service.js';
import { database } from '../../services/database.service.js';

const CACHE_TTL = config.get('cache.ttl.categories') || 3600;
const COLLECTION = 'productsCategories';

export class ProductsCategoriesRepository {
    #collection;

    constructor() {
        this.#collection = database.setCollection(COLLECTION);
    }

    async create(data) {
        const result = await this.#collection.insertOne({
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        if (result.insertedId) {
            await cacheService.delete('categories:*');
            return { ...data, id: result.insertedId };
        }
        return null;
    }

    async findById(id) {
        const cacheKey = `category:${id}`;
        const cached = await cacheService.get(cacheKey);
        if (cached) return cached;

        const category = await this.#collection.findOne({ _id: new ObjectId(id) });
        if (category) {
            await cacheService.set(cacheKey, category, CACHE_TTL);
        }
        return category;
    }

    async findWithProducts(categoryId) {
        const cacheKey = `category:withProducts:${categoryId}`;
        const cached = await cacheService.get(cacheKey);
        if (cached) return cached;

        const result = await this.#collection.aggregate([
            { $match: { _id: new ObjectId(categoryId) } },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: 'categoryId',
                    as: 'products'
                }
            }
        ]).toArray();

        if (result.length > 0) {
            await cacheService.set(cacheKey, result[0], CACHE_TTL);
            return result[0];
        }
        return null;
    }
}

export const ProductsCategoriesRepository = new ProductsCategoriesRepository(); 