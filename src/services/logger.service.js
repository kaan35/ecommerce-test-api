import { configService } from "./config.service.js";
import { dateService } from "./date.service.js";

class LoggerService {
  #config;
  #isDev;
  #contexts = {
    AUTH: "Auth",
    CACHE: "Cache",
    DATABASE: "Database",
    HTTP: "HTTP",
    SYSTEM: "System",
  };

  constructor() {
    this.#config = configService.get("app");
    this.#isDev = this.#config.env === "development";
  }

  #formatMessage(level, message, meta = {}) {
    const { context = this.#contexts.SYSTEM, ...restMeta } = meta;

    return {
      context,
      level,
      message,
      timestamp: dateService.now(),
      ...(Object.keys(restMeta).length && { meta: restMeta }),
    };
  }

  #log(level, message, meta = {}) {
    const logData = this.#formatMessage(level, message, meta);

    if (this.#isDev) {
      console[level](
        `[${logData.timestamp}] ${level.toUpperCase()} [${logData.context}] ${message}`,
        logData.meta || "",
      );
    } else {
      console[level](JSON.stringify(logData));
    }
  }

  info(message, meta = {}) {
    this.#log("info", message, meta);
  }

  error(message, error = null, meta = {}) {
    if (error) {
      meta.error = {
        message: error.message,
        ...(this.#isDev && { stack: error.stack }),
        ...(error.code && { code: error.code }),
      };
    }
    this.#log("error", message, meta);
  }

  warn(message, meta = {}) {
    this.#log("warn", message, meta);
  }

  debug(message, meta = {}) {
    if (this.#isDev) {
      this.#log("debug", message, meta);
    }
  }
}

export const loggerService = new LoggerService(configService.get());
