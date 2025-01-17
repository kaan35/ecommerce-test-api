import { configService } from './config.service.js';
import { dateService } from './date.service.js';

type LogLevel = 'debug' | 'error' | 'info' | 'success' | 'warn';

export const LOG_CONTEXTS = {
  AUTH: 'Auth',
  CACHE: 'Cache',
  DATABASE: 'Database',
  HTTP: 'Http',
  PRODUCTS: 'Products',
  SYSTEM: 'System',
} as const;

type LogContext = (typeof LOG_CONTEXTS)[keyof typeof LOG_CONTEXTS];

type LogOptions = {
  context: LogContext;
  message: string;
  meta?: Object;
  error?: Error & { code?: string | number };
};

type LogColors = Record<LogLevel | 'reset', string>;

class Logger {
  private readonly config: { env: string };
  private readonly colors: LogColors = {
    debug: '\x1b[90m', // gray
    error: '\x1b[31m', // red
    info: '\x1b[37m', // white
    success: '\x1b[32m', // green
    warn: '\x1b[33m', // yellow
    reset: '\x1b[0m',
  };
  private readonly isDev: boolean;

  constructor() {
    this.config = configService.get('app');
    this.isDev = this.config.env === 'development';
  }

  private format(
    level: LogLevel,
    { context = LOG_CONTEXTS.SYSTEM, message, meta, error }: LogOptions,
  ): string {
    const timestamp = dateService.current();
    const details = error || meta ? '\n' + JSON.stringify(error || meta, null, 2) : '';

    return `[${timestamp}] ${level.toUpperCase()} [${context}] ${message}${details}`;
  }

  private log(level: LogLevel, options: LogOptions): void {
    const formatted = this.format(level, options);

    if (this.isDev) {
      const color = this.colors[level];
      console.log(`${color}${formatted}${this.colors.reset}`);
    } else {
      // In production, use appropriate console methods for error and warn
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
  }

  /**
   * Logs debug messages (only in development environment)
   * @example
   * logger.debug({ context: LOG_CONTEXTS.AUTH, message: 'User login attempt', meta: { userId: '123' } });
   */
  debug(options: LogOptions): void {
    if (this.isDev) {
      this.log('debug', options);
    }
  }

  /**
   * Logs error messages with stack trace
   * @example
   * logger.error({ context: LOG_CONTEXTS.DATABASE, message: 'Connection failed', error: new Error('timeout') });
   */
  error(options: LogOptions & { error: Error }): void {
    this.log('error', options);
  }

  /**
   * Logs informational messages
   * @example
   * logger.info({ context: LOG_CONTEXTS.CACHE, message: 'Cache cleared', meta: { keys: 5 } });
   */
  info(options: LogOptions): void {
    this.log('info', options);
  }

  /**
   * Logs success messages
   * @example
   * logger.success({ context: LOG_CONTEXTS.AUTH, message: 'User registered successfully', meta: { userId: '123' } });
   */
  success(options: LogOptions): void {
    this.log('success', options);
  }

  /**
   * Logs warning messages
   * @example
   * logger.warn({ context: LOG_CONTEXTS.HTTP, message: 'Rate limit reached', meta: { ip: '192.168.1.1' } });
   */
  warn(options: LogOptions): void {
    this.log('warn', options);
  }
}

export const loggerService = new Logger();
