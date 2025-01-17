import { createClient } from 'redis';
import { configService } from './config.service.js';
import { LOG_CONTEXTS, loggerService } from './logger.service.js';

class CacheService {
  #client;
  #config;
  #isConnected = false;

  constructor() {
    this.#config = configService.get('cache');
    this.#client = createClient({ url: this.#config.url });
    this.#handleProcessEvents();
  }

  /**
   * Set up event handlers for Redis client
   * @private
   */
  #handleProcessEvents() {
    loggerService.info({
      context: LOG_CONTEXTS.CACHE,
      message: 'Initializing cache event handlers',
    });

    this.#client.on('error', (error) => {
      loggerService.error({
        context: LOG_CONTEXTS.CACHE,
        error,
        message: 'Redis client error',
        meta: { data: { isConnected: this.#isConnected } },
      });
    });

    this.#client.on('connect', () => {
      loggerService.success({
        context: LOG_CONTEXTS.CACHE,
        message: 'Redis client connected',
        meta: { data: { url: this.#config.url } },
      });
      this.#isConnected = true;
    });

    this.#client.on('end', () => {
      loggerService.warn({
        context: LOG_CONTEXTS.CACHE,
        message: 'Redis client disconnected',
      });
      this.#isConnected = false;
    });

    process.on('SIGTERM', async () => {
      loggerService.warn({
        context: LOG_CONTEXTS.CACHE,
        message: 'SIGTERM received',
        meta: { data: { isConnected: this.#isConnected } },
      });
      await this.disconnect();
    });
  }

  /**
   * Check if Redis connection is active
   * @private
   */
  #checkConnection() {
    if (this.#isConnected) return true;

    loggerService.error({
      context: LOG_CONTEXTS.CACHE,
      message: 'Redis not connected. Call connect() first.',
    });
    return false;
  }

  /**
   * Serialize value for storage
   * @private
   */
  #serialize(value) {
    return typeof value === 'string' ? value : JSON.stringify(value);
  }

  /**
   * Deserialize stored value
   * @private
   */
  #deserialize(value) {
    if (!value) return null;
    return value.startsWith('{') || value.startsWith('[') ? JSON.parse(value) : value;
  }

  /**
   * Connect to Redis server
   * Must be called before using any other cache operations
   * @returns {Promise<void>} Resolves when connected
   * @throws {Error} If connection fails
   *
   * @example
   * await cacheService.connect();
   */
  async connect() {
    if (this.#isConnected) return;

    return this.#client.connect().catch((error) => {
      loggerService.error({
        context: LOG_CONTEXTS.CACHE,
        error,
        message: 'Failed to connect to Redis',
        meta: { data: { url: this.#config.url } },
      });
      throw error;
    });
  }

  /**
   * Disconnect from Redis server
   * Call this when shutting down your application
   * @returns {Promise<void>} Resolves when disconnected
   * @throws {Error} If disconnection fails
   *
   * @example
   * await cacheService.disconnect();
   */
  async disconnect() {
    if (!this.#isConnected) return;

    return this.#client.quit().catch((error) => {
      loggerService.error({
        context: LOG_CONTEXTS.CACHE,
        error,
        message: 'Error disconnecting from Redis',
      });
      throw error;
    });
  }

  /**
   * Get a value from cache
   * Returns null if key doesn't exist or on error
   * @param {string} key - Cache key to retrieve
   * @returns {Promise<any>} Cached value or null
   *
   * @example
   * const user = await cacheService.get('user:123');
   * if (user) {
   *   console.log('Found user:', user);
   * }
   */
  async get(key) {
    if (!this.#checkConnection()) return null;

    return this.#client
      .get(key)
      .then(this.#deserialize)
      .catch((error) => {
        loggerService.error({
          context: LOG_CONTEXTS.CACHE,
          error,
          message: 'Error getting value from Redis',
          meta: { data: { key } },
        });
        return null;
      });
  }

  /**
   * Store a value in cache
   * Automatically serializes objects and arrays to JSON
   * @param {string} key - Cache key
   * @param {any} value - Value to store (string, number, object, array)
   * @param {number} [expiresIn] - Time in seconds until value expires
   * @returns {Promise<boolean>} True if successful
   *
   * @example
   * // Store with 1 hour expiration
   * await cacheService.set('user:123', { name: 'John' }, 3600);
   */
  async set(key, value, expiresIn) {
    if (!this.#checkConnection()) return false;

    const options = expiresIn ? { EX: expiresIn } : undefined;
    const serializedValue = this.#serialize(value);

    return this.#client.set(key, serializedValue, options).catch((error) => {
      loggerService.error({
        context: LOG_CONTEXTS.CACHE,
        error,
        message: 'Error setting value in Redis',
        meta: { data: { key } },
      });
      return false;
    });
  }

  /**
   * Delete a value from cache
   * @param {string} key - Cache key to delete
   * @returns {Promise<boolean>} True if successful
   *
   * @example
   * await cacheService.del('user:123');
   */
  async del(key) {
    if (!this.#checkConnection()) return false;

    return this.#client.del(key).catch((error) => {
      loggerService.error({
        context: LOG_CONTEXTS.CACHE,
        error,
        message: 'Error deleting key from Redis',
        meta: { data: { key } },
      });
      return false;
    });
  }

  /**
   * Delete all values from cache
   * Use with caution!
   * @returns {Promise<boolean>} True if successful
   *
   * @example
   * await cacheService.clear();
   */
  async clear() {
    if (!this.#checkConnection()) return false;

    return this.#client.flushAll().catch((error) => {
      loggerService.error({
        context: LOG_CONTEXTS.CACHE,
        error,
        message: 'Error clearing Redis cache',
      });
      return false;
    });
  }

  /**
   * Check if cache is healthy
   * @returns {Promise<string>} "PONG" if healthy, "FAILED" if not
   *
   * @example
   * const status = await cacheService.ping();
   * console.log('Cache health:', status === 'PONG' ? 'OK' : 'Not OK');
   */
  async ping() {
    if (!this.#checkConnection()) return 'FAILED';
    return this.#client.ping();
  }

  /**
   * Get cache connection status
   * @returns {{ isConnected: boolean, url: string }} Connection info
   *
   * @example
   * const { isConnected, url } = cacheService.getConnectionStatus();
   */
  getConnectionStatus() {
    return {
      isConnected: this.#isConnected,
      url: this.#config.url,
    };
  }
}

// Export singleton instance
export const cacheService = new CacheService();
