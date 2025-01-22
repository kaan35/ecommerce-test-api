import type { Response } from 'express';
import { logService } from '../log/service.ts';
import type { LogContext } from '../log/types.ts';
import { responseService } from '../response/service.ts';
import { AppError, NotFoundError, ValidationError } from './types.ts';

class ErrorService {
  handleError(error: Error, res: Response, context: LogContext = 'system'): void {
    const meta = {
      errorType: error.constructor.name,
      ...(error instanceof ValidationError && { validationErrors: error.message }),
    };

    logService.error({
      context,
      error,
      message: `${error instanceof ValidationError ? ': ' + error.message : ''}`,
      meta,
    });

    if (error instanceof NotFoundError) {
      responseService.notFound(res, { message: error.message });
    } else if (error instanceof ValidationError) {
      responseService.badRequest(res, { message: error.message });
    } else if (error instanceof AppError) {
      res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    } else {
      responseService.error(res, { message: 'Internal server error' });
    }
  }
}

export const errorService = new ErrorService();
