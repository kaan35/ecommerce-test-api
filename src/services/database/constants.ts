export const DATABASE_CONTEXTS = {
  DATABASE: 'database',
  MONGODB: 'mongodb',
} as const;

export const DATABASE_MESSAGES = {
  CONNECT_SUCCESS: 'Successfully connected to database',
  CONNECT_ERROR: 'Failed to connect to database',
  DISCONNECT_SUCCESS: 'Database disconnected successfully',
  DISCONNECT_ERROR: 'Error disconnecting from database',
  NOT_INITIALIZED: 'Database not initialized',
  UNCAUGHT_EXCEPTION: 'Uncaught exception',
  INIT_HANDLERS: 'Initializing database event handlers',
  CLIENT_ERROR: 'Database client error',
} as const;
