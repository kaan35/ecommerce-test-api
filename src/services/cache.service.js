import { createClient } from "redis";
import { configService } from "./config.service.js";
import { loggerService } from "./logger.service.js";

const CONTEXT = "Cache";

class CacheService {
  #config;
  #client;
  #isConnected = false;

  constructor() {
    this.#config = configService.get("cache");
    this.#client = createClient({ url: this.#config.url });

    this.#setupEventHandlers();
    this.#setupProcessHandlers();
  }

  #setupEventHandlers() {
    this.#client.on("connect", () => {
      this.#isConnected = true;
      loggerService.info("Redis connected", { context: CONTEXT });
    });

    this.#client.on("error", (error) => {
      this.#isConnected = false;
      loggerService.error("Redis error", error, { context: CONTEXT });
    });
  }

  #setupProcessHandlers() {
    process.on("SIGTERM", async () => {
      loggerService.warn("SIGTERM received", { context: CONTEXT });
      await this.disconnect();
    });

    process.on("unhandledRejection", (error) => {
      loggerService.error("Unhandled promise rejection", error, {
        context: CONTEXT,
      });
    });

    process.on("uncaughtException", async (error) => {
      loggerService.error("Uncaught exception", error, { context: CONTEXT });
      await this.disconnect();
      process.exit(1);
    });
  }

  async connect() {
    if (!this.#isConnected) {
      await this.#client.connect();
    }
  }

  async disconnect() {
    if (this.#isConnected) {
      await this.#client.disconnect();
      this.#isConnected = false;
    }
  }

  async get(key) {
    try {
      const data = await this.#client.get(key);
      if (!data) return null;
      return JSON.parse(data);
    } catch (error) {
      loggerService.error("Cache get error", error, {
        context: CONTEXT,
        key,
      });
      await this.delete(key);

      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      const serialized = JSON.stringify(value);
      await this.#client.set(key, serialized, { EX: ttl });
      return true;
    } catch (error) {
      loggerService.error("Cache set error", error, {
        context: CONTEXT,
        key,
      });
      return false;
    }
  }

  async delete(pattern) {
    try {
      if (pattern.includes("*")) {
        const keys = await this.#client.keys(pattern);
        if (keys.length > 0) {
          await this.#client.del(keys);
        }
      } else {
        await this.#client.del(pattern);
      }
      return true;
    } catch (error) {
      loggerService.error("Cache delete error", error, {
        context: CONTEXT,
        pattern,
      });
      return false;
    }
  }

  async clear() {
    try {
      await this.#client.flushDb();
      return true;
    } catch (error) {
      loggerService.error("Cache clear error", error, {
        context: CONTEXT,
      });
      return false;
    }
  }
}

export const cacheService = new CacheService();
