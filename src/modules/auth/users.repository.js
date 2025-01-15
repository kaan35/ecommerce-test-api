import { ObjectId } from "mongodb";
import { cacheService } from "../../services/cache.service.js";
import { config } from "../../services/config.service.js";
import { databaseService } from "../../services/database.service.js";

const CACHE_TTL = config.get("cache.ttl.users") || 1800;
const COLLECTION = "users";

export class UsersRepository {
  #collection;

  constructor() {
    this.#collection = databaseService.setCollection(COLLECTION);
  }

  async create(data) {
    const result = await this.#collection.insertOne({
      ...data,
      email: data.email.toLowerCase(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (result.insertedId) {
      await cacheService.delete("users:*");
      return { ...data, id: result.insertedId };
    }
    return null;
  }

  async findOne(id) {
    const cacheKey = `user:${id}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const user = await this.#collection.findOne({ _id: new ObjectId(id) });
    if (user) {
      await cacheService.set(cacheKey, user, CACHE_TTL);
    }
    return user;
  }

  async findByEmail(email) {
    const cacheKey = `user:email:${email.toLowerCase()}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const user = await this.#collection.findOne({
      email: email.toLowerCase(),
    });

    if (user) {
      await cacheService.set(cacheKey, user, CACHE_TTL);
    }
    return user;
  }

  async update(id, data) {
    const result = await this.#collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...data,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );

    if (result.value) {
      await Promise.all(
        [
          cacheService.delete(`user:${id}`),
          cacheService.delete("users:*"),
          data.email &&
            cacheService.delete(`user:email:${data.email.toLowerCase()}`),
        ].filter(Boolean),
      );
    }

    return result.value;
  }

  async updateLastLogin(id) {
    return this.update(id, {
      lastLoginAt: new Date(),
    });
  }

  async updateVerification(id, isVerified = true) {
    return this.update(id, {
      isEmailVerified: isVerified,
      verificationToken: null,
      status: isVerified ? "active" : "pending",
    });
  }

  async findByVerificationToken(token) {
    return this.#collection.findOne({
      verificationToken: token,
      status: "pending",
    });
  }

  async findByRole(role, options = {}) {
    const cacheKey = `users:role:${role}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const users = await this.#collection
      .find(
        { role },
        {
          ...options,
          projection: { password: 0 },
        },
      )
      .toArray();

    await cacheService.set(cacheKey, users, CACHE_TTL);
    return users;
  }

  async findByStatus(status, options = {}) {
    const cacheKey = `users:status:${status}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const users = await this.#collection
      .find(
        { status },
        {
          ...options,
          projection: { password: 0 },
        },
      )
      .toArray();

    await cacheService.set(cacheKey, users, CACHE_TTL);
    return users;
  }
}

export const usersRepository = new UsersRepository();
