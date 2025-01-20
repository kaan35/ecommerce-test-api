import { configService } from '../config/service.ts';
import { dateService } from '../date/service.ts';
import { CONSOLE_COLORS } from './constants.ts';
import type { LogLevel, LogOptions } from './types.ts';

class LogService {
  private config: { env: string };
  private isDev: boolean;

  constructor() {
    this.config = configService.get('app');
    this.isDev = this.config.env === 'development';
  }

  /**
   * Formats a log message with timestamp and context
   * @param options - Log options containing message and metadata
   * @returns Formatted log message string
   */
  format({ context, message, meta, error }: LogOptions): string {
    const timestamp = dateService.now('datetime');
    const details = error || meta ? `\n${JSON.stringify(error || meta, null, 2)}` : '';
    return `[${timestamp}] [${context}] ${message}${details}`;
  }

  /**
   * Writes a log message with appropriate color and level
   * @param level - Log level determining color and console method
   * @param message - Formatted message to write
   */
  write(level: LogLevel, message: string): void {
    console.log(`${CONSOLE_COLORS[level]}${message}${CONSOLE_COLORS.reset}`);
  }

  /**
   * Logs debug messages (only in development environment)
   * @param options - Log options
   * @example
   * logger.debug({
   *  context: 'auth',
   *  message: 'User login attempt',
   *  meta: { userId: '123' },
   * });
   */
  debug(options: LogOptions): void {
    if (this.isDev) {
      this.write('debug', this.format(options));
    }
  }

  /**
   * Logs error messages with error details
   * @param options - Log options with required error object
   * @example
   * logger.error({
   *  context: 'database',
   *  message: 'Connection failed',
   *  error: new Error('timeout'),
   * });
   */
  error(options: LogOptions & { error: Error }): void {
    this.write('error', this.format(options));
  }

  /**
   * Logs informational messages
   * @param options - Log options
   * @example
   * logger.info({
   *  context: 'cache',
   *  message: 'Cache cleared',
   *  meta: { keys: 5 },
   * });
   */
  info(options: LogOptions): void {
    this.write('info', this.format(options));
  }

  /**
   * Logs success messages
   * @param options - Log options
   * @example
   * logger.success({
   *  context: 'auth',
   *  message: 'User registered successfully',
   *  meta: { userId: '123' }
   * });
   */
  success(options: LogOptions): void {
    this.write('success', this.format(options));
  }

  /**
   * Logs warning messages
   * @param options - Log options
   * @example
   * logger.warn({
   *  context: 'http',
   *  message: 'Rate limit reached',
   *  meta: { ip: '192.168.1.1' }
   * });
   */
  warn(options: LogOptions): void {
    this.write('warn', this.format(options));
  }
}

export const logService = new LogService();
