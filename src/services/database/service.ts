import type { Collection, Db, Document } from 'mongodb';
import { MongoClient } from 'mongodb';
import { configService } from '../config/service.ts';
import { logService } from '../log/service.ts';
import { DATABASE_CONTEXTS, DATABASE_MESSAGES } from './constants.ts';
import type { ConnectionStatus } from './types.ts';

class DatabaseService {
  private client: MongoClient;
  private db: Db | null = null;
  private initPromise: Promise<void>;

  constructor() {
    const config = configService.get('db');
    this.client = new MongoClient(config.url);
    this.initPromise = this.connect();

    process.on('SIGTERM', () => this.disconnect());
    process.on('SIGINT', () => this.disconnect());
  }

  async connect(): Promise<void> {
    if (this.db) return;

    return this.client
      .connect()
      .then(() => {
        this.db = this.client.db(configService.get('db').name);
        logService.success({
          context: DATABASE_CONTEXTS.DATABASE,
          message: DATABASE_MESSAGES.CONNECT_SUCCESS,
          meta: { database: configService.get('db').name },
        });
      })
      .catch((error: Error) => {
        logService.error({
          context: DATABASE_CONTEXTS.DATABASE,
          error,
          message: DATABASE_MESSAGES.CONNECT_ERROR,
        });
        throw error;
      });
  }

  async disconnect(): Promise<void> {
    if (!this.db) return;

    return this.client
      .close()
      .then(() => {
        this.db = null;
        logService.info({
          context: DATABASE_CONTEXTS.DATABASE,
          message: DATABASE_MESSAGES.DISCONNECT_SUCCESS,
        });
      })
      .catch((error: Error) => {
        logService.error({
          context: DATABASE_CONTEXTS.DATABASE,
          error,
          message: DATABASE_MESSAGES.DISCONNECT_ERROR,
        });
        throw error;
      });
  }

  async collection<TSchema extends Document = Document>(
    name: string,
  ): Promise<Collection<TSchema>> {
    await this.initPromise;
    return this.db!.collection<TSchema>(name);
  }

  async ping(): Promise<boolean> {
    if (!this.db) return false;
    return this.db
      .command({ ping: 1 })
      .then(() => true)
      .catch(() => false);
  }

  getConnectionStatus(): ConnectionStatus {
    return {
      isConnected: this.db !== null,
      retryAttempts: 0,
      database: {
        name: configService.get('db').name,
        url: configService.get('db').url,
      },
    };
  }
}

export const databaseService = new DatabaseService();
