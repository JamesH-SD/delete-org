/**
 * Custom error types
 * @example
 * throw new CustomError("Error message");
 */
export class CustomError extends Error {
  /**
   * Custom error constructor
   * @param message {string} - Error message
   * @example
   * throw new CustomError("Error message");
   */
  constructor(message: string) {
    super(message);
    this.name = "CustomError";
  }
}

/**
 * Database error type
 * @example
 * throw new DatabaseError("Database error message");
 */
export class DatabaseError extends CustomError {
  /**
   * Database error constructor
   * @param message {string} - Error message
   * @example
   * throw new DatabaseError("Database error message");
   */
  constructor(message: string) {
    super(message);
    this.name = "DatabaseError";
  }
}

/**
 * Validation error
 * @example
 * throw new ValidationError("Validation error message");
 */
export class ValidationError extends CustomError {
  /**
   * Validation error constructor
   * @param message {string }- Error message
   * @example
   * throw new ValidationError("Validation error message");
   */
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Application error
 * @example
 * throw new Application("Application error message");
 */
export class ApplicationError extends CustomError {
  /**
   * Application error constructor
   * @param message {string} - Error message
   * @example
   * throw new Application("Application error message");
   */
  constructor(message: string) {
    super(message);
    this.name = "ApplicationError";
  }
}
