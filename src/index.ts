import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { productsRouter } from './modules/products/products.router.ts';
import { cacheService } from './services/cache/service.ts';
import { configService } from './services/config/service.ts';
import type { Config } from './services/config/types.ts';
import { databaseService } from './services/database/service.ts';
import { dateService } from './services/date/service.ts';
import { logService } from './services/log/service.ts';
import { responseService } from './services/response/service.ts';

class Server {
  private app: express.Application;
  private config: Config['app'];

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
    this.app.get('/health', (_req, res) => {
      responseService.success(res, {
        data: {
          date: dateService.now(),
          database: databaseService.getConnectionStatus().isConnected
            ? 'connected'
            : 'disconnected',
          cache: cacheService.getConnectionStatus().isConnected ? 'connected' : 'disconnected',
        },
      });
    });

    this.app.use('/products', productsRouter);

    // 404 handler
    this.app.use((_req, res) => {
      responseService.notFound(res, {
        message: 'Route not found',
        status: 'error',
      });
    });

    // Error handler
    this.app.use((err: Error, req: express.Request, res: express.Response) => {
      logService.error({
        context: 'system',
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
    const cleanup = async () => {
      await Promise.all([databaseService.disconnect(), cacheService.disconnect()]);
      process.exit(0);
    };

    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);

    return this;
  }

  async initialize() {
    await Promise.all([databaseService.connect(), cacheService.connect()]);
    return this;
  }

  async start() {
    // Start HTTP server
    return new Promise<void>((resolve, reject) => {
      this.app
        .listen(this.config.port)
        .once('listening', () => {
          logService.success({
            context: 'system',
            message: 'Server started successfully',
            meta: {
              port: this.config.port,
              env: process.env.NODE_ENV || 'development',
            },
          });
          resolve();
        })
        .once('error', (error) => {
          logService.error({
            context: 'system',
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
  .initialize()
  .then((server) => server.start())
  .catch((error) => {
    logService.error({
      context: 'system',
      error,
      message: 'Server startup failed',
    });
    process.exit(1);
  });
