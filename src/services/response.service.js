/** @typedef {import('express').Response} Response */

import { configService } from './config.service.js';

/** @typedef {Object} ResponseData
 * @property {string} [message] Response message
 * @property {string} [status] Response status
 * @property {any} [data] Response payload
 */

/** @typedef {'success' | 'error'} ResponseStatus */

/** @type {Object<string, number>} HTTP status codes */
const STATUS_CODES = Object.freeze({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
});

/** Response formatting service */
class ResponseService {
  constructor() {
    this.config = configService.get('app');
  }
  /**
   * Send JSON response
   * @private
   * @param {Response} res Express response
   * @param {number} code HTTP status code
   * @param {ResponseStatus} status Response status
   * @param {ResponseData} [data] Response data
   */
  #send(res, code, status, data = {}) {
    return res.status(code).json({
      status,
      ...data,
    });
  }

  /**
   * Send success response (200)
   * @param {Response} res Express response
   * @param {ResponseData} [data] Response data
   * @example success(res, { message: 'Product created', data: product })
   */
  success(res, data) {
    return this.#send(res, STATUS_CODES.OK, 'success', data);
  }

  /**
   * Send created response (201)
   * @param {Response} res Express response
   * @param {ResponseData} [data] Response data
   * @example created(res, { data: newUser })
   */
  created(res, data) {
    return this.#send(res, STATUS_CODES.CREATED, 'success', data);
  }

  /**
   * Send bad request response (400)
   * @param {Response} res Express response
   * @param {ResponseData} [data] Response data
   * @example badRequest(res, { message: 'Invalid input' })
   */
  badRequest(res, data) {
    return this.#send(res, STATUS_CODES.BAD_REQUEST, 'error', data);
  }

  /**
   * Send unauthorized response (401)
   * @param {Response} res Express response
   * @param {ResponseData} [data] Response data
   * @example unauthorized(res, { message: 'Please login' })
   */
  unauthorized(res, data) {
    return this.#send(res, STATUS_CODES.UNAUTHORIZED, 'error', data);
  }

  /**
   * Send forbidden response (403)
   * @param {Response} res Express response
   * @param {ResponseData} [data] Response data
   * @example forbidden(res, { message: 'Access denied' })
   */
  forbidden(res, data) {
    return this.#send(res, STATUS_CODES.FORBIDDEN, 'error', data);
  }

  /**
   * Send not found response (404)
   * @param {Response} res Express response
   * @param {ResponseData} [data] Response data
   * @example notFound(res, { message: 'Product not found' })
   */
  notFound(res, data) {
    return this.#send(res, STATUS_CODES.NOT_FOUND, 'error', data);
  }

  /**
   * Send server error response (500)
   * @param {Response} res Express response
   * @param {ResponseData} [data] Response data
   * @example error(res, { message: 'Database error' })
   */
  error(res, data) {
    return this.#send(res, STATUS_CODES.SERVER_ERROR, 'error', data);
  }
}

/** @type {ResponseService} Response formatting service instance */
export const responseService = new ResponseService();
