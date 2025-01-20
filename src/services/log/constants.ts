import type { LogColors, LogContext } from './types.js';

/** ANSI color codes for console output */
export const CONSOLE_COLORS: LogColors = {
  debug: '\x1b[90m', // gray
  error: '\x1b[31m', // red
  info: '\x1b[37m', // white
  success: '\x1b[32m', // green
  warn: '\x1b[33m', // yellow
  reset: '\x1b[0m',
} as const;

export const DEFAULT_OPTIONS = {
  context: 'system' as LogContext,
  timestamp: true,
  colored: true,
} as const;

/** Log context categories */
export const LOG_CONTEXTS = {
  AUTH: 'auth',
  CACHE: 'cache',
  DATABASE: 'database',
  HTTP: 'http',
  SYSTEM: 'system',
} as const;

/** Available log levels */
export const LOG_LEVELS = {
  DEBUG: 'Debug',
  ERROR: 'Error',
  INFO: 'Info',
  SUCCESS: 'Success',
  WARN: 'Warn',
} as const;
