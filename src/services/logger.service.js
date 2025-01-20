import { configService } from './config.service.js';
import { dateService } from './date.service.js';

/**
 * @typedef {'debug' | 'error' | 'info' | 'success' | 'warn'} LogLevel
 */

export const LOG_CONTEXTS = {
  AUTH: 'Auth',
  CACHE: 'Cache',
  DATABASE: 'Database',
  HTTP: 'Http',
  PRODUCTS: 'Products',
  SYSTEM: 'System',
};

/**
 * @typedef {Object} LogOptions
 * @property {keyof typeof LOG_CONTEXTS} context - Log context
 * @property {string} message - Log message
 * @property {Object} [meta] - Additional metadata
 * @property {Error & { code?: string | number }} [error] - Error object
 */

/**
 * @typedef {Object} LogColors
 * @property {string} debug - Gray color code
 * @property {string} error - Red color code
 * @property {string} info - White color code
 * @property {string} success - Green color code
 * @property {string} warn - Yellow color code
 * @property {string} reset - Reset color code
 */

class Logger {
  /** @type {LogColors} */
  #colors = {
    debug: '\x1b[90m', // gray
    error: '\x1b[31m', // red
    info: '\x1b[37m', // white
    success: '\x1b[32m', // green
    warn: '\x1b[33m', // yellow
    reset: '\x1b[0m',
  };

  /** @type {{ env: string }} */
  #config;

  /** @type {boolean} */
  #isDev;

  constructor() {
    this.#config = configService.get('app');
    this.#isDev = this.#config.env === 'development';
  }

  /**
   * Format log message
   * @private
   * @param {LogLevel} level - Log level
   * @param {LogOptions} options - Log options
   * @returns {string} Formatted log message
   */
  #format(level, { context = LOG_CONTEXTS.SYSTEM, message, meta, error }) {
    const timestamp = dateService.now();
    const details = error || meta ? '\n' + JSON.stringify(error || meta, null, 2) : '';

    return `[${timestamp}] ${level.toUpperCase()} [${context}] ${message}${details}`;
  }

  /**
   * Log message with specified level
   * @private
   * @param {LogLevel} level - Log level
   * @param {LogOptions} options - Log options
   */
  #log(level, options) {
    const formatted = this.#format(level, options);

    if (this.#isDev) {
      const color = this.#colors[level];
      console.log(`${color}${formatted}${this.#colors.reset}`);
      return;
    }

    switch (level) {
      case 'error':
        console.error(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      default:
        console.log(formatted);
    }
  }

  /**
   * Logs debug messages (only in development environment)
   * @example
   * logger.debug({ context: LOG_CONTEXTS.AUTH, message: 'User login attempt', meta: { userId: '123' } });
   * @param {LogOptions} options - Log options
   */
  debug(options) {
    if (this.#isDev) {
      this.#log('debug', options);
    }
  }

  /**
   * Logs error messages with stack trace
   * @example
   * logger.error({ context: LOG_CONTEXTS.DATABASE, message: 'Connection failed', error: new Error('timeout') });
   * @param {LogOptions & { error: Error }} options - Log options with error
   */
  error(options) {
    this.#log('error', options);
  }

  /**
   * Logs informational messages
   * @example
   * logger.info({ context: LOG_CONTEXTS.CACHE, message: 'Cache cleared', meta: { keys: 5 } });
   * @param {LogOptions} options - Log options
   */
  info(options) {
    this.#log('info', options);
  }

  /**
   * Logs success messages
   * @example
   * logger.success({ context: LOG_CONTEXTS.AUTH, message: 'User registered successfully', meta: { userId: '123' } });
   * @param {LogOptions} options - Log options
   */
  success(options) {
    this.#log('success', options);
  }

  /**
   * Logs warning messages
   * @example
   * logger.warn({ context: LOG_CONTEXTS.HTTP, message: 'Rate limit reached', meta: { ip: '192.168.1.1' } });
   * @param {LogOptions} options - Log options
   */
  warn(options) {
    this.#log('warn', options);
  }
}

export const loggerService = new Logger();
