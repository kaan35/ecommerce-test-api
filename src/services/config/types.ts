export interface AppConfig {
  env: string;
  port: number;
}

export interface CacheConfig {
  url: string;
}

export interface DatabaseConfig {
  name: string;
  url: string;
}

export interface SecurityConfig {
  saltRounds: number;
}

export interface Config {
  app: AppConfig;
  cache: CacheConfig;
  database: DatabaseConfig;
  security: SecurityConfig;
}
