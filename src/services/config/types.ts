export interface AppConfig {
  env: string;
  port: number;
}

export interface CacheConfig {
  url: string;
}

export interface DatabaseConfig {
  maxRetries: number;
  name: string;
  retryDelay: number;
  url: string;
}

export interface SecurityConfig {
  saltRounds: number;
}

export interface Config {
  app: AppConfig;
  cache: CacheConfig;
  db: DatabaseConfig;
  security: SecurityConfig;
}
