import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { productsRouter } from './modules/products/products.router.js';
import { cacheService } from './services/cache.service.js';
import { configService } from './services/config.service.js';
import { databaseService } from './services/database.service.js';
import { dateService } from './services/date.service.js';
import { LOG_CONTEXTS, loggerService } from './services/logger.service.js';
import { responseService } from './services/response.service.js';

class Server {
  constructor() {
    this.app = express();
    this.config = configService.get('app');
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors());

    // Request parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));

    // Logging
    this.app.use(morgan('dev'));

    return this;
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', async (req, res, next) => {
      Promise.all([databaseService.ping(), cacheService.ping()])
        .then(([dbHealth, cacheHealth]) => {
          responseService.success(res, {
            date: dateService.now(),
            database: dbHealth ? 'connected' : 'disconnected',
            cache: cacheHealth ? 'connected' : 'disconnected',
          });
        })
        .catch(next);
    });

    this.app.use('/products', productsRouter);

    // 404 handler
    this.app.use((req, res) => {
      responseService.notFound(res, {
        message: 'Route not found',
        status: 'error',
      });
    });

    // Error handler
    this.app.use((err, req, res) => {
      loggerService.error({
        context: LOG_CONTEXTS.SYSTEM,
        error: err,
        message: 'Request error',
        meta: { path: req.path },
      });
      responseService.error(res, {
        message: 'Internal server error',
        status: 'error',
      });
    });

    return this;
  }

  setupErrorHandlers() {
    const shutdown = () =>
      Promise.all([databaseService.disconnect(), cacheService.disconnect()])
        .then(() => process.exit(0))
        .catch((error) => {
          loggerService.error({
            context: LOG_CONTEXTS.SYSTEM,
            error,
            message: 'Error during shutdown',
          });
          process.exit(1);
        });

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    return this;
  }

  async start() {
    // Initialize services
    await Promise.all([databaseService.connect(), cacheService.connect()]).catch((error) => {
      loggerService.error({
        context: LOG_CONTEXTS.SYSTEM,
        error,
        message: 'Failed to initialize services',
      });
      process.exit(1);
    });

    // Start HTTP server
    return new Promise((resolve, reject) => {
      this.app
        .listen(this.config.port)
        .once('listening', () => {
          loggerService.success({
            context: LOG_CONTEXTS.SYSTEM,
            message: 'Server started successfully',
            meta: {
              port: this.config.port,
              env: process.env.NODE_ENV || 'development',
            },
          });
          resolve();
        })
        .once('error', (error) => {
          loggerService.error({
            context: LOG_CONTEXTS.SYSTEM,
            error,
            message: 'Failed to start server',
          });
          reject(error);
        });
    });
  }
}

new Server()
  .setupMiddleware()
  .setupRoutes()
  .setupErrorHandlers()
  .start()
  .catch((error) => {
    loggerService.error({
      context: LOG_CONTEXTS.SYSTEM,
      error,
      message: 'Server startup failed',
    });
    process.exit(1);
  });
