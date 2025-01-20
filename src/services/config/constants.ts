export const CONFIG_DEFAULTS = {
  APP: {
    ENV: 'development',
    PORT: '3000',
  },
  CACHE: {
    URL: 'redis://cache_container:6379',
  },
  DATABASE: {
    MAX_RETRIES: '3',
    NAME: 'ecommerce',
    RETRY_DELAY: '5000',
    URL: 'mongodb://db_container:27017',
  },
  SECURITY: {
    SALT_ROUNDS: '12',
  },
} as const;

export const CONFIG_CONTEXTS = {
  APP: 'app',
  CACHE: 'cache',
  DATABASE: 'database',
  SECURITY: 'security',
} as const;
