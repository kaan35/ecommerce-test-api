import { MongoClient } from "mongodb";
import { configService } from "./config.service.js";
import { loggerService } from "./logger.service.js";

const CONTEXT = "Database";

class DatabaseService {
  #client;
  #db;
  #isConnected = false;
  #config;
  #connectionRetries = 0;
  #maxRetries = 3;
  #retryDelay = 5000;

  constructor() {
    this.#config = configService.get("db");
    this.#client = new MongoClient(this.#config.url);

    this.#setupProcessHandlers();
  }

  #setupProcessHandlers() {
    process.on("SIGTERM", async () => {
      loggerService.warn("SIGTERM received", { context: CONTEXT });
      await this.disconnect();
    });

    process.on("unhandledRejection", (error) => {
      loggerService.error("Unhandled promise rejection", error, {
        context: CONTEXT,
      });
    });

    process.on("uncaughtException", async (error) => {
      loggerService.error("Uncaught exception", error, { context: CONTEXT });
      await this.disconnect();
      process.exit(1);
    });
  }
  connect() {
    if (this.#isConnected) {
      return this.#db;
    }

    return this.#retryConnection()
      .then(() => {
        loggerService.info("Successfully connected to database");
        return this.#db;
      })
      .catch((error) => {
        loggerService.error(
          "Failed to connect to database after retries:",
          error,
        );
        throw error;
      });
  }

  #retryConnection() {
    return this.#attemptConnection().catch((error) => {
      this.#connectionRetries++;

      if (this.#connectionRetries < this.#maxRetries) {
        loggerService.warn(
          `Database connection attempt ${this.#connectionRetries} failed, retrying in ${this.#retryDelay}ms`,
        );
        return new Promise((resolve) =>
          setTimeout(resolve, this.#retryDelay),
        ).then(() => this.#retryConnection());
      }

      throw error;
    });
  }

  async #attemptConnection() {
    await this.#client.connect();
    this.#db = this.#client.db(this.#config.name);
    this.#isConnected = true;
    this.#connectionRetries = 0;
    return this.#db;
  }

  collection(name) {
    if (!this.#isConnected) {
      loggerService.error("Database not connected. Call connect() first.");
    }
    return this.#db.collection(name);
  }

  disconnect() {
    if (!this.#isConnected) {
      return;
    }

    return this.#client
      .close()
      .then(() => {
        this.#isConnected = false;
        this.#db = null;
        loggerService.info("Database disconnected successfully");
      })
      .catch((error) => {
        loggerService.error("Error disconnecting from database:", error);
      });
  }

  ping() {
    if (!this.#isConnected) {
      return false;
    }

    return this.#db
      .command({ ping: 1 })
      .then(() => true)
      .catch(() => false);
  }

  isConnected() {
    return this.#isConnected && this.#client.topology?.isConnected();
  }

  getStats() {
    return {
      connection: {
        isConnected: this.isConnected(),
        retryAttempts: this.#connectionRetries,
      },
      database: {
        name: this.#config.name,
        url: this.#config.url,
      },
    };
  }
}

export const databaseService = new DatabaseService();
