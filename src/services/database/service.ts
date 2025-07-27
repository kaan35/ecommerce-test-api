import type { Collection, Db, Document } from 'mongodb';
// eslint-disable-next-line no-duplicate-imports
import { MongoClient } from 'mongodb';
import { configService } from '../config/service.ts';
import type { DatabaseConfig } from '../config/types.ts';
import { logService } from '../log/service.ts';
import { DATABASE_CONTEXTS, DATABASE_MESSAGES } from './constants.ts';
import type { ConnectionStatus } from './types.ts';

class DatabaseService {
  private client: MongoClient;
  private db: Db | null = null;
  private initPromise: Promise<void>;
  private config: DatabaseConfig;

  constructor() {
    this.config = configService.get('database');
    this.client = new MongoClient(this.config.url);
    this.initPromise = this.connect();

    process.on('SIGTERM', () => this.disconnect());
    process.on('SIGINT', () => this.disconnect());
  }

  async connect(): Promise<void> {
    if (this.db) return;

    return this.client
      .connect()
      .then(() => {
        this.db = this.client.db(this.config.name);
        logService.success({
          context: DATABASE_CONTEXTS.DATABASE,
          message: DATABASE_MESSAGES.CONNECT_SUCCESS,
          meta: { database: this.config.name },
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

  getConnectionStatus(): ConnectionStatus {
    return {
      database: {
        name: this.config.name,
        url: this.config.url,
      },
      isConnected: this.db !== null,
      retryAttempts: 0,
    };
  }
}

export const databaseService = new DatabaseService();
