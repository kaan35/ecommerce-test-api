/**
 * Health check service for monitoring system components
 * Implements health checks for all critical services
 */
import { diskusage } from "diskusage";
import os from "os";
import { cache } from "./cache.service.js";
import { database } from "./database.service.js";
import { logger } from "./logger.service.js";

export class HealthService {
  static #instance;
  #config;
  #checks = {
    mongodb: this.#checkMongoDB.bind(this),
    redis: this.#checkRedis.bind(this),
    system: this.#checkSystem.bind(this),
    disk: this.#checkDisk.bind(this),
  };

  constructor(config) {
    if (HealthService.#instance) {
      return HealthService.#instance;
    }
    this.#config = config;
    HealthService.#instance = this;
  }

  /**
   * Run all health checks
   */
  async checkHealth() {
    const startTime = Date.now();
    const results = {};

    try {
      // Run all checks in parallel
      const checks = await Promise.allSettled(
        Object.entries(this.#checks).map(async ([name, check]) => {
          const checkStart = Date.now();
          const result = await check();
          const duration = Date.now() - checkStart;

          return {
            name,
            ...result,
            duration,
          };
        }),
      );

      // Process results
      checks.forEach((check) => {
        if (check.status === "fulfilled") {
          results[check.value.name] = {
            status: check.value.status,
            duration: check.value.duration,
            ...check.value.details,
          };
        } else {
          results[check.reason.name] = {
            status: "error",
            error: check.reason.message,
          };
        }
      });

      // Calculate overall status
      const isHealthy = Object.values(results).every(
        (result) => result.status === "ok",
      );

      const response = {
        status: isHealthy ? "ok" : "error",
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        checks: results,
      };

      // Log health check results
      if (!isHealthy) {
        logger.warn("Health check failed", response);
      } else {
        logger.debug("Health check completed", response);
      }

      return response;
    } catch (error) {
      logger.error("Health check error", error);
      throw error;
    }
  }

  /**
   * Check MongoDB connection
   */
  async #checkMongoDB() {
    try {
      const adminDb = database.admin();
      const result = await adminDb.ping();

      if (result?.ok !== 1) {
        throw new Error("MongoDB ping failed");
      }

      const status = await adminDb.serverStatus();

      return {
        status: "ok",
        details: {
          version: status.version,
          connections: status.connections,
          uptime: status.uptime,
        },
      };
    } catch (error) {
      return {
        status: "error",
        details: {
          error: error.message,
        },
      };
    }
  }

  /**
   * Check Redis connection
   */
  async #checkRedis() {
    try {
      const result = await cache.ping();

      if (result !== "PONG") {
        throw new Error("Redis ping failed");
      }

      const info = await cache.info();

      return {
        status: "ok",
        details: {
          version: info.redis_version,
          memory: info.used_memory_human,
          clients: info.connected_clients,
        },
      };
    } catch (error) {
      return {
        status: "error",
        details: {
          error: error.message,
        },
      };
    }
  }

  /**
   * Check system resources
   */
  async #checkSystem() {
    try {
      const loadAvg = os.loadavg();
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const memoryUsage = (usedMem / totalMem) * 100;

      const status =
        memoryUsage < 90 && loadAvg[0] < os.cpus().length ? "ok" : "warning";

      return {
        status,
        details: {
          cpu: {
            loadAvg: loadAvg[0].toFixed(2),
            cores: os.cpus().length,
          },
          memory: {
            total: this.#formatBytes(totalMem),
            free: this.#formatBytes(freeMem),
            usage: `${memoryUsage.toFixed(1)}%`,
          },
          uptime: this.#formatUptime(os.uptime()),
        },
      };
    } catch (error) {
      return {
        status: "error",
        details: {
          error: error.message,
        },
      };
    }
  }

  /**
   * Check disk usage
   */
  async #checkDisk() {
    try {
      const path = "/";
      const info = await diskusage.check(path);
      const usagePercent = ((info.total - info.free) / info.total) * 100;

      return {
        status: usagePercent < 90 ? "ok" : "warning",
        details: {
          total: this.#formatBytes(info.total),
          free: this.#formatBytes(info.free),
          usage: `${usagePercent.toFixed(1)}%`,
        },
      };
    } catch (error) {
      return {
        status: "error",
        details: {
          error: error.message,
        },
      };
    }
  }

  /**
   * Format bytes to human readable format
   */
  #formatBytes(bytes) {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = bytes;
    let unit = 0;

    while (size >= 1024 && unit < units.length - 1) {
      size /= 1024;
      unit++;
    }

    return `${size.toFixed(2)} ${units[unit]}`;
  }

  /**
   * Format uptime to human readable format
   */
  #formatUptime(uptime) {
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    return parts.join(" ");
  }
}
