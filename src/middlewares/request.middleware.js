import { randomUUID } from "crypto";
import { loggerService } from "../services/logger.service.js";

export class RequestMiddleware {
  monitor(req, res, next) {
    const requestId = randomUUID();
    const start = Date.now();
    const requestData = {
      id: requestId,
      method: req.method,
      path: req.originalUrl,
      query: req.query,
      params: req.params,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    };

    // Attach request context
    req.context = {
      ...requestData,
      startTime: start,
    };

    // Override response end to capture completion
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
      // Restore original end
      res.end = originalEnd;

      // Calculate duration
      const duration = Date.now() - start;
      const statusCode = res.statusCode;

      // Log request details
      loggerService.info("Request processed", {
        ...requestData,
        type: "REQUEST",
        statusCode,
        duration,
        success: statusCode < 400,
        timestamp: new Date().toISOString(),
      });

      // Call original end
      return originalEnd.call(this, chunk, encoding);
    };

    next();
  }

  notFound(req, res) {
    loggerService.warn("Route not found", {
      requestId: req.context?.id,
      type: "NOT_FOUND",
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
    });

    return res.status(404).json({
      success: false,
      message: "Route not found",
      path: req.originalUrl,
    });
  }

  errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const errorCode = err.code || "INTERNAL_SERVER_ERROR";

    loggerService.error("Request failed", {
      requestId: req.context?.id,
      type: "ERROR",
      code: errorCode,
      message: err.message,
      method: req.method,
      path: req.originalUrl,
      statusCode,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      ip: req.ip,
    });

    return res.status(statusCode).json({
      success: false,
      code: errorCode,
      message: statusCode === 500 ? "Internal server error" : err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }
}

export const requestMiddleware = new RequestMiddleware();
