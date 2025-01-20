import { MongoClient } from 'mongodb';
import { configService } from './config.service.js';
import { LOG_CONTEXTS, loggerService } from './logger.service.js';

/**
 * @typedef {Object} DatabaseConfig
 * @property {string} url - MongoDB connection URL
 * @property {string} name - Database name
 * @property {number} maxRetries - Maximum connection retry attempts
 * @property {number} retryDelay - Delay between retries in milliseconds
 */

/**
 * @typedef {Object} ConnectionStatus
 * @property {boolean} isConnected - Whether database is connected
 * @property {number} retryAttempts - Number of connection retry attempts
 * @property {Object} database - Database information
 * @property {string} database.name - Database name
 * @property {string} database.url - Database URL
 */

class DatabaseService {
  /** @type {MongoClient} */
  #client;
  /** @type {import('mongodb').Db} */
  #db;
  /** @type {DatabaseConfig} */
  #config;
  /** @type {Map<string, import('mongodb').Collection>} */
  #collections = new Map();
  /** @type {Promise<void>} */
  #initPromise;

  constructor() {
    this.#config = configService.get('db');
    this.#client = new MongoClient(this.#config.url);
    this.#setupProcessHandlers();
    this.#initPromise = this.#initialize();
  }

  /**
   * Initialize database connection
   * @private
   */
  async #initialize() {
    await this.#client.connect();
    this.#db = this.#client.db(this.#config.name);

    loggerService.success({
      context: LOG_CONTEXTS.DATABASE,
      message: 'Successfully connected to database',
      meta: { database: this.#config.name },
    });
  }

  /**
   * Set up process event handlers
   * @private
   */
  #setupProcessHandlers() {
    const cleanup = async () => {
      await this.disconnect();
      process.exit(0);
    };

    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);

    process.on('uncaughtException', async (error) => {
      console.log('error', error);

      loggerService.error({
        context: LOG_CONTEXTS.DATABASE,
        error,
        message: 'Uncaught exception',
      });
      await cleanup();
      process.exit(1);
    });
  }

  /**
   * Get a MongoDB collection
   * @template T
   * @param {string} name - Collection name
   * @returns {Promise<import('mongodb').Collection<T>>} MongoDB collection
   */
  async collection(name) {
    await this.#initPromise;

    if (this.#collections.has(name)) {
      return this.#collections.get(name);
    }

    const collection = this.#db.collection(name);
    this.#collections.set(name, collection);
    return collection;
  }

  /**
   * Disconnect from database
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (!this.#client) return;

    await this.#client.close();
    this.#collections.clear();
    this.#db = null;

    loggerService.info({
      context: LOG_CONTEXTS.DATABASE,
      message: 'Database disconnected successfully',
      meta: { database: this.#config.name },
    });
  }

  /**
   * Check database connection health
   * @returns {Promise<boolean>}
   */
  async ping() {
    await this.#initPromise;
    const result = await this.#db.command({ ping: 1 }).catch(() => false);
    return Boolean(result);
  }

  /**
   * Get current connection status
   * @returns {ConnectionStatus}
   */
  getConnectionStatus() {
    return {
      isConnected: this.#client?.topology?.isConnected() ?? false,
      retryAttempts: 0,
      database: {
        name: this.#config.name,
        url: this.#config.url,
      },
    };
  }

  /**
   * Connect to database
   * @returns {Promise<void>}
   */
  connect() {
    return this.#initPromise;
  }
}

export const databaseService = new DatabaseService();
