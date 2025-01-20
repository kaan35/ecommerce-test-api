import { CONFIG_DEFAULTS } from './constants.ts';
import type { Config } from './types.ts';

class ConfigService {
  readonly #config: Config = {
    app: {
      env: process.env.NODE_ENV || CONFIG_DEFAULTS.APP.ENV,
      port: parseInt(process.env.PORT || CONFIG_DEFAULTS.APP.PORT, 10),
    },
    cache: {
      url: process.env.REDIS_URL || CONFIG_DEFAULTS.CACHE.URL,
    },
    db: {
      maxRetries: parseInt(
        process.env.MONGODB_MAX_RETRIES || CONFIG_DEFAULTS.DATABASE.MAX_RETRIES,
        10,
      ),
      name: process.env.MONGODB_NAME || CONFIG_DEFAULTS.DATABASE.NAME,
      retryDelay: parseInt(
        process.env.MONGODB_RETRY_DELAY || CONFIG_DEFAULTS.DATABASE.RETRY_DELAY,
        10,
      ),
      url: process.env.MONGODB_URL || CONFIG_DEFAULTS.DATABASE.URL,
    },
    security: {
      saltRounds: parseInt(process.env.SALT_ROUNDS || CONFIG_DEFAULTS.SECURITY.SALT_ROUNDS, 10),
    },
  };

  get<K extends keyof Config>(key: K): Config[K] {
    return this.#config[key];
  }

  set<K extends keyof Config>(key: K, value: Config[K]): void {
    this.#config[key] = value;
  }
}

export const configService = new ConfigService();
