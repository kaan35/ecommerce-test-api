import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { authRouter } from "./modules/auth/auth.router.js";
import { productsRouter } from "./modules/products/products.router.js";
import { cacheService } from "./services/cache.service.js";
import { configService } from "./services/config.service.js";
import { databaseService } from "./services/database.service.js";
import { dateService } from "./services/date.service.js";
import { loggerService } from "./services/logger.service.js";
import { responseService } from "./services/response.service.js";

class Server {
  constructor() {
    this.app = express();
    this.config = configService.get("app");
    console.log("%o", configService.get());
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors());

    // Request parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));

    // Logging
    this.app.use(morgan("dev"));

    return this;
  }

  setupRoutes() {
    // Health check
    this.app.get("/health", (req, res) => {
      responseService.success(
        res,
        { date: dateService.now() },
        "Service working",
      );
    });

    this.app.use(`/auth`, authRouter);
    this.app.use(`/products`, productsRouter);

    // 404 handler
    this.app.use((req, res) => {
      responseService.notFound(res, {
        message: "Route not found",
        status: "error",
      });
    });

    // Error handler
    this.app.use((err, req, res) => {
      loggerService.error("Request error:", err);
      responseService.error(res, {
        message: "Internal server error",
        status: "error",
      });
    });

    return this;
  }

  setupErrorHandlers() {
    const shutdown = () => {
      Promise.all([databaseService.disconnect(), cacheService.disconnect()])
        .then(() => process.exit(0))
        .catch((error) => {
          loggerService.warn("Shutdown", error, { context: "System" });
          process.exit(1);
        });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);

    return this;
  }

  start() {
    return Promise.all([
      databaseService.connect(),
      cacheService.connect(),
    ]).then(() =>
      this.app.listen(this.config.port, () => {
        loggerService.info(`Server running on port ${this.config.port}`);
        loggerService.info(
          `Environment: ${process.env.NODE_ENV || "development"}`,
        );
      }),
    );
  }
}

const bootstrap = () => {
  const server = new Server();

  return server
    .setupMiddleware()
    .setupRoutes()
    .setupErrorHandlers()
    .start()
    .catch((error) => {
      loggerService.error("Server startup failed:", error);
      process.exit(1);
    });
};

bootstrap();
