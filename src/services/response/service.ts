import type { Response } from 'express';
import { STATUS_CODES } from './constants.ts';
import type { ResponseData, ResponseStatus, StatusCode } from './types.ts';

/** Response formatting service */
class ResponseService {
  /**
   * Send formatted JSON response
   * @param res Express response object
   * @param code HTTP status code
   * @param status Response status
   * @param data Optional response data
   */
  #send(
    res: Response,
    code: StatusCode,
    status: ResponseStatus,
    data: ResponseData = {},
  ): Response {
    return res.status(code).json({
      status,
      ...data,
    });
  }

  /**
   * Send success response (200)
   * @param res Express response object
   * @param data Optional response data
   * @example
   * responseService.success(res, { message: 'Product created', data: product })
   */
  success(res: Response, data?: ResponseData): Response {
    return this.#send(res, STATUS_CODES.OK, 'success', data);
  }

  /**
   * Send created response (201)
   * @param res Express response object
   * @param data Optional response data
   * @example
   * responseService.created(res, { data: newUser })
   */
  created(res: Response, data?: ResponseData): Response {
    return this.#send(res, STATUS_CODES.CREATED, 'success', data);
  }

  /**
   * Send bad request response (400)
   * @param res Express response object
   * @param data Optional response data
   * @example
   * responseService.badRequest(res, { message: 'Invalid input' })
   */
  badRequest(res: Response, data?: ResponseData): Response {
    return this.#send(res, STATUS_CODES.BAD_REQUEST, 'error', data);
  }

  /**
   * Send unauthorized response (401)
   * @param res Express response object
   * @param data Optional response data
   * @example
   * responseService.unauthorized(res, { message: 'Please login' })
   */
  unauthorized(res: Response, data?: ResponseData): Response {
    return this.#send(res, STATUS_CODES.UNAUTHORIZED, 'error', data);
  }

  /**
   * Send forbidden response (403)
   * @param res Express response object
   * @param data Optional response data
   * @example
   * responseService.forbidden(res, { message: 'Access denied' })
   */
  forbidden(res: Response, data?: ResponseData): Response {
    return this.#send(res, STATUS_CODES.FORBIDDEN, 'error', data);
  }

  /**
   * Send not found response (404)
   * @param res Express response object
   * @param data Optional response data
   * @example
   * responseService.notFound(res, { message: 'Product not found' })
   */
  notFound(res: Response, data?: ResponseData): Response {
    return this.#send(res, STATUS_CODES.NOT_FOUND, 'error', data);
  }

  /**
   * Send server error response (500)
   * @param res Express response object
   * @param data Optional response data
   * @example
   * responseService.error(res, { message: 'Database error' })
   */
  error(res: Response, data?: ResponseData): Response {
    return this.#send(res, STATUS_CODES.SERVER_ERROR, 'error', data);
  }
}

export const responseService = new ResponseService();
