import type { Collection, Db, Document } from 'mongodb';

export interface ConnectionStatus {
  isConnected: boolean;
  retryAttempts: number;
  database: {
    name: string;
    url: string;
  };
}

export interface DatabaseClient {
  db: Db | null;
  collections: Map<string, Collection<any>>;
  initPromise: Promise<void>;
}

export type CollectionType<TSchema extends Document = Document> = Collection<TSchema>;
