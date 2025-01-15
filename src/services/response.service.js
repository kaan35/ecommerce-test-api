export class ResponseService {
  #statusCodes = {
    BAD_REQUEST: 400,
    CONFLICT: 409,
    CREATED: 201,
    FORBIDDEN: 403,
    INTERNAL_ERROR: 500,
    NOT_FOUND: 404,
    SUCCESS: 200,
    UNAUTHORIZED: 401,
  };

  #statusMessages = {
    BAD_REQUEST: "Bad Request",
    CONFLICT: "Conflict",
    CREATED: "Created",
    FORBIDDEN: "Forbidden",
    INTERNAL_ERROR: "Internal Server Error",
    NOT_FOUND: "Not Found",
    SUCCESS: "Success",
    UNAUTHORIZED: "Unauthorized",
  };

  /**
   * Send response with status code
   */
  send(res, { code, body }) {
    return res.status(code).json(body);
  }

  success(res, data = null, message = this.#statusMessages.SUCCESS) {
    return res.status(this.#statusCodes.SUCCESS).json({
      data,
      isSuccessful: true,
      message,
    });
  }

  created(res, data = null, message = this.#statusMessages.CREATED) {
    return res.status(this.#statusCodes.CREATED).json({
      data,
      isSuccessful: true,
      message,
    });
  }

  badRequest(res, message = this.#statusMessages.BAD_REQUEST) {
    return res.status(this.#statusCodes.BAD_REQUEST).json({
      isSuccessful: false,
      message,
    });
  }

  unauthorized(res, message = this.#statusMessages.UNAUTHORIZED) {
    return res.status(this.#statusCodes.UNAUTHORIZED).json({
      isSuccessful: false,
      message,
    });
  }

  forbidden(res, message = this.#statusMessages.FORBIDDEN) {
    return res.status(this.#statusCodes.FORBIDDEN).json({
      isSuccessful: false,
      message,
    });
  }

  notFound(res, message = this.#statusMessages.NOT_FOUND) {
    return res.status(this.#statusCodes.NOT_FOUND).json({
      isSuccessful: false,
      message,
    });
  }

  conflict(res, message = this.#statusMessages.CONFLICT) {
    return res.status(this.#statusCodes.CONFLICT).json({
      isSuccessful: false,
      message,
    });
  }

  error(res, message = this.#statusMessages.INTERNAL_ERROR) {
    return res.status(this.#statusCodes.INTERNAL_ERROR).json({
      isSuccessful: false,
      message,
    });
  }

  custom(res, statusCode, message, data = null) {
    return res.status(statusCode).json({
      isSuccessful: statusCode < 400,
      message,
      ...(data && { data }),
    });
  }

  getStatusCode(status) {
    return this.#statusCodes[status] || this.#statusCodes.INTERNAL_ERROR;
  }

  getStatusMessage(status) {
    return this.#statusMessages[status] || this.#statusMessages.INTERNAL_ERROR;
  }
}

export const responseService = new ResponseService();
