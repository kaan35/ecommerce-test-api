export const DEFAULT_TTL = 300; // 5 minutes in seconds

export const CACHE_EVENTS = {
  CONNECT: 'connect',
  ERROR: 'error',
  END: 'end',
  READY: 'ready',
} as const;

export const CACHE_CONTEXTS = {
  CACHE: 'cache',
} as const;

export const CACHE_MESSAGES = {
  CONNECT_SUCCESS: 'Redis client connected',
  CONNECT_ERROR: 'Failed to connect to Redis',
  DISCONNECT_SUCCESS: 'Redis client disconnected',
  DISCONNECT_ERROR: 'Error disconnecting from Redis',
  NOT_CONNECTED: 'Redis not connected. Call connect() first.',
  GET_ERROR: 'Error getting value from Redis',
  SET_ERROR: 'Error setting value in Redis',
  DELETE_ERROR: 'Error deleting key from Redis',
  CLEAR_ERROR: 'Error clearing Redis cache',
  INIT_HANDLERS: 'Initializing cache event handlers',
  CLIENT_ERROR: 'Redis client error',
} as const;
