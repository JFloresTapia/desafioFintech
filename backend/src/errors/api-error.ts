export class ApiError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}