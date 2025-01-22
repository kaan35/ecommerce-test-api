export class AppError extends Error {
  override readonly name: string;
  readonly statusCode: number;

  constructor(message: string, name = 'AppError', statusCode = 500) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'ValidationError', 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NotFoundError', 404);
  }
}
