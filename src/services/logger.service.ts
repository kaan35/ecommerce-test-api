import { configService } from './config.service.js';
import { dateService } from './date.service.js';

export const LOG_CONTEXTS = {
  AUTH: 'Auth',
  CACHE: 'Cache',
  DATABASE: 'Database',
  HTTP: 'Http',
  SYSTEM: 'System',
} as const;

type LogLevel = 'debug' | 'error' | 'info' | 'success' | 'warn';
type LogContext = keyof typeof LOG_CONTEXTS;

type LogColors = {
  [K in LogLevel | 'reset']: string;
};

const COLORS: LogColors = {
  debug: '\x1b[90m', // gray
  error: '\x1b[31m', // red
  info: '\x1b[37m', // white
  success: '\x1b[32m', // green
  warn: '\x1b[33m', // yellow
  reset: '\x1b[0m',
} as const;

type LogOptions = {
  context: LogContext;
  message: string;
  meta?: Object;
  error?: Error & { code?: string | number };
};

class Logger {
  private readonly config: { env: string };
  private readonly isDev: boolean;

  constructor() {
    this.config = configService.get('app');
    this.isDev = this.config.env === 'development';
  }

  /**
   * Formats a log message with timestamp and context
   * @param options - Log options containing message and metadata
   * @returns Formatted log message string
   */
  private format({ context, message, meta, error }: LogOptions): string {
    const timestamp = dateService.now('datetime');
    const details = error || meta ? `\n${JSON.stringify(error || meta, null, 2)}` : '';
    return `[${timestamp}] [${context}] ${message}${details}`;
  }

  /**
   * Writes a log message with appropriate color and level
   * @param level - Log level determining color and console method
   * @param message - Formatted message to write
   */
  private write(level: LogLevel, message: string): void {
    console.log(`${COLORS[level]}${message}${COLORS.reset}`);
  }

  /**
   * Logs debug messages (only in development environment)
   * @param options - Log options
   * @example
   * logger.debug({
   *  context: LOG_CONTEXTS.AUTH,
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
   *  context: LOG_CONTEXTS.DATABASE,
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
   *  context: LOG_CONTEXTS.CACHE,
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
   *  context: LOG_CONTEXTS.AUTH,
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
   *  context: LOG_CONTEXTS.HTTP,
   *  message: 'Rate limit reached',
   *  meta: { ip: '192.168.1.1' }
   * });
   */
  warn(options: LogOptions): void {
    this.write('warn', this.format(options));
  }
}

export const loggerService = new Logger();
