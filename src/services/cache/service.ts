import { createClient } from 'redis';
import { configService } from '../config/service.ts';
import { logService } from '../log/service.ts';
import { CACHE_CONTEXTS, CACHE_EVENTS, CACHE_MESSAGES, DEFAULT_TTL } from './constants.ts';
import type { ConnectionStatus, RedisClient } from './types.ts';

class CacheService {
  private config: { url: string };
  private client: RedisClient;
  private isConnected: boolean;

  constructor() {
    this.config = configService.get('cache');
    this.client = createClient({ url: this.config.url });
    this.isConnected = false;
    this.#handleProcessEvents();
  }

  #handleProcessEvents(): void {
    logService.info({
      context: CACHE_CONTEXTS.CACHE,
      message: CACHE_MESSAGES.INIT_HANDLERS,
    });

    this.client.on(CACHE_EVENTS.ERROR, (error: Error) => this.#handleError(error));
    this.client.on(CACHE_EVENTS.CONNECT, () => this.#handleConnect());
    this.client.on(CACHE_EVENTS.END, () => this.#handleDisconnect());
    process.on('SIGTERM', () => this.#handleSigterm());
  }

  #handleError(error: Error, meta?: Record<string, unknown>): void {
    logService.error({
      error,
      context: CACHE_CONTEXTS.CACHE,
      message: CACHE_MESSAGES.CLIENT_ERROR,
      meta: { isConnected: this.isConnected, ...meta },
    });
  }

  #handleConnect(): void {
    logService.success({
      context: CACHE_CONTEXTS.CACHE,
      message: CACHE_MESSAGES.CONNECT_SUCCESS,
      meta: { url: this.config.url },
    });
    this.isConnected = true;
  }

  #handleDisconnect(): void {
    logService.warn({
      context: CACHE_CONTEXTS.CACHE,
      message: CACHE_MESSAGES.DISCONNECT_SUCCESS,
    });
    this.isConnected = false;
  }

  async #handleSigterm(): Promise<void> {
    logService.warn({
      context: CACHE_CONTEXTS.CACHE,
      message: 'SIGTERM received',
      meta: { isConnected: this.isConnected },
    });
    await this.disconnect();
  }

  #checkConnection(): boolean {
    if (this.isConnected) return true;

    logService.warn({
      context: CACHE_CONTEXTS.CACHE,
      message: CACHE_MESSAGES.NOT_CONNECTED,
    });
    return false;
  }

  #serialize(value: unknown): string {
    return typeof value === 'string' ? value : JSON.stringify(value);
  }

  #deserialize<T>(value: string | null): T | null {
    if (!value) return null;
    return value.startsWith('{') || value.startsWith('[')
      ? JSON.parse(value)
      : (value as unknown as T);
  }

  async #executeCommand<T>(
    operation: () => Promise<T>,
    errorMessage: string,
    meta?: Record<string, unknown>,
    defaultValue?: T,
  ): Promise<T> {
    if (!this.#checkConnection()) return defaultValue as T;

    return operation().catch((error: Error) => {
      this.#handleError(error, { ...meta, message: errorMessage });
      return defaultValue as T;
    });
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;

    await this.client.connect().catch((error: Error) => {
      this.#handleError(error, { url: this.config.url });
      throw error;
    });
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) return;

    await this.client.quit().catch((error: Error) => {
      this.#handleError(error);
      throw error;
    });
  }

  async get<T>(key: string): Promise<T | null> {
    return this.#executeCommand(
      async () => {
        const value = await this.client.get(key);
        return this.#deserialize<T>(value);
      },
      CACHE_MESSAGES.GET_ERROR,
      { key },
      null,
    );
  }

  async set(key: string, value: unknown, expiresIn = DEFAULT_TTL): Promise<boolean> {
    return this.#executeCommand(
      async () => {
        const options = expiresIn ? { EX: expiresIn } : undefined;
        const result = await this.client.set(key, this.#serialize(value), options);
        return result === 'OK';
      },
      CACHE_MESSAGES.SET_ERROR,
      { key },
      false,
    );
  }

  async del(key: string): Promise<boolean> {
    return this.#executeCommand(
      async () => {
        const result = await this.client.del(key);
        return result > 0;
      },
      CACHE_MESSAGES.DELETE_ERROR,
      { key },
      false,
    );
  }

  async clear(): Promise<boolean> {
    return this.#executeCommand(
      async () => {
        const result = await this.client.flushAll();
        return result === 'OK';
      },
      CACHE_MESSAGES.CLEAR_ERROR,
      undefined,
      false,
    );
  }

  async ping(): Promise<'PONG' | 'FAILED'> {
    return this.#executeCommand(
      async () => {
        const result = await this.client.ping();
        return result === 'PONG' ? 'PONG' : 'FAILED';
      },
      'Ping failed',
      undefined,
      'FAILED',
    );
  }

  getConnectionStatus(): ConnectionStatus {
    return {
      isConnected: this.isConnected,
      url: this.config.url,
    };
  }
}

export const cacheService = new CacheService();
