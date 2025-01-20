import type { RedisClientType, RedisDefaultModules, RedisFunctions, RedisScripts } from 'redis';

export interface ConnectionStatus {
  isConnected: boolean;
  url: string;
}

export type RedisClient = RedisClientType<RedisDefaultModules & RedisFunctions & RedisScripts>;
