class ConfigService {
  #config = {
    app: {
      env: process.env.NODE_ENV || 'development',
      port: parseInt(process.env.PORT || '3000', 10),
    },
    cache: {
      url: process.env.REDIS_URL || 'redis://cache_container:6379',
    },
    db: {
      maxRetries: parseInt(process.env.MONGODB_MAX_RETRIES || '3', 10),
      name: process.env.MONGODB_NAME || 'ecommerce',
      retryDelay: parseInt(process.env.MONGODB_RETRY_DELAY || '5000', 10),
      url: process.env.MONGODB_URL || 'mongodb://db_container:27017',
    },
    security: {
      saltRounds: parseInt(process.env.SALT_ROUNDS || '12', 10),
    },
  };

  /**
   * Get configuration value
   * @param {string} key - Configuration key
   * @returns {any} Configuration value
   * @example get('app') // returns app config
   */
  get(key) {
    return this.#config[key];
  }

  /**
   * Set configuration value
   * @param {string} key - Configuration key
   * @param {any} value - Configuration value
   * @example set('app.port', 3000)
   */
  set(key, value) {
    this.#config[key] = value;
  }
}

export const configService = new ConfigService();
