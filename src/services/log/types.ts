export type LogLevel = 'debug' | 'error' | 'info' | 'success' | 'warn';

export type LogContext = 'auth' | 'cache' | 'database' | 'http' | 'system';
export type LogColors = Record<LogLevel | 'reset', string>;

export interface LogEntry {
  level: LogLevel;
  message: string;
  context: LogContext;
  timestamp: string;
  meta?: Record<string, unknown>;
  error?: Error & { code?: string | number };
}

export type LogOptions = {
  context: LogContext;
  message: string;
  meta?: Object;
  error?: Error & { code?: string | number };
};
