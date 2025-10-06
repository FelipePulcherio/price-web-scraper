export class CustomError extends Error {
  public cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.cause = cause;

    // Maintains proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class AuthError extends CustomError {}
export class FetchFailedError extends CustomError {}
export class ParsingError extends CustomError {}
export class CookieExtractionError extends CustomError {}
