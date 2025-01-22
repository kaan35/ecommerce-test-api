import type { Config } from './types.ts';

class ConfigService {
  readonly #config: Config;

  constructor() {
    this.#config = {
      app: {
        env: 'development',
        port: 3000,
      },
      cache: {
        url: 'redis://cache:6379',
      },
      database: {
        name: 'ecommerce',
        url: 'mongodb://database:27017',
      },
      security: {
        saltRounds: 12,
      },
    };
  }

  get<K extends keyof Config>(key: K): Config[K] {
    return this.#config[key];
  }

  set<K extends keyof Config>(key: K, value: Config[K]): void {
    this.#config[key] = value;
  }
}

export const configService = new ConfigService();
