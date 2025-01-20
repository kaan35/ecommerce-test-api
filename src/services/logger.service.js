import { configService } from './config.service.js';
import { dateService } from './date.service.js';

/** @typedef {'debug' | 'error' | 'info' | 'success' | 'warn'} LogLevel */
/** @typedef {'auth' | 'cache' | 'database' | 'http' | 'system'} LogContext */

/** @type {Record<LogLevel | 'reset', string>} */
const colors = {
  debug: '\x1b[90m', // gray
  error: '\x1b[31m', // red
  info: '\x1b[37m', // white
  success: '\x1b[32m', // green
  warn: '\x1b[33m', // yellow
  reset: '\x1b[0m',
};

/** @typedef {Object} LogOptions
 * @property {LogContext} context - The logging context
 * @property {string} message - The log message
 * @property {Object} [meta] - Additional metadata
 * @property {Error & { code?: string | number }} [error] - Error object
 */

class Logger {
  constructor() {
    this.isDev = configService.get('app.env') === 'development';
  }

  /**
   * @param {LogOptions} options
   * @returns {string}
   */
  format({ context, message, meta, error }) {
    const timestamp = dateService.now('datetime');
    const details = error || meta ? `\n${JSON.stringify(error || meta, null, 2)}` : '';
    return `[${timestamp}] [${context}] ${message}${details}`;
  }

  /**
   * @param {LogLevel} level
   * @param {string} message
   */
  write(level, message) {
    if (this.isDev) {
      console.log(`${colors[level]}${message}${colors.reset}`);
      return;
    }

    switch (level) {
      case 'error':
        console.error(message);
        break;
      case 'warn':
        console.warn(message);
        break;
      default:
        console.log(message);
    }
  }

  /**
   * @param {LogOptions} options
   * @example
   * logger.debug({
   *   context: 'auth',
   *   message: 'User login attempt',
   *   meta: { userId: '123' }
   * });
   */
  debug(options) {
    if (this.isDev) {
      this.write('debug', this.format(options));
    }
  }

  /**
   * @param {LogOptions & { error: Error }} options
   * @example
   * logger.error({
   *   context: 'database',
   *   message: 'Connection failed',
   *   error: new Error('timeout')
   * });
   */
  error(options) {
    this.write('error', this.format(options));
  }

  /**
   * @param {LogOptions} options
   * @example
   * logger.info({
   *   context: 'http',
   *   message: 'Request received',
   *   meta: { path: '/api/products' }
   * });
   */
  info(options) {
    this.write('info', this.format(options));
  }

  /**
   * @param {LogOptions} options
   * @example
   * logger.success({
   *   context: 'auth',
   *   message: 'User registered',
   *   meta: { email: 'user@example.com' }
   * });
   */
  success(options) {
    this.write('success', this.format(options));
  }

  /**
   * @param {LogOptions} options
   * @example
   * logger.warn({
   *   context: 'cache',
   *   message: 'Cache miss',
   *   meta: { key: 'user:123' }
   * });
   */
  warn(options) {
    this.write('warn', this.format(options));
  }
}

export const loggerService = new Logger();
