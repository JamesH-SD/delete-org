/**
 * Result type for error handling
 * @property type - Type of the result
 * @property value - Value of the result
 * @property error - Error of the result
 * @example
 * const ok: Ok<number> = { type: "ok", value: 1 };
 */
export type Ok<T> = {
  type: "ok";
  value: T;
};

/**
 * Error type for error handling
 * @property type - Type of the result
 * @property error - Error of the result
 * @example
 * const err: Err<string> = { type: "err", error: "Error" };
 */
export type Err<E> = {
  type: "err";
  error: E;
};

/**
 * Result type for error handling
 * @property type - Type of the result
 * @property value - Value of the result
 * @property error - Error of the result
 * @example
 * const ok: Ok<number> = { type: "ok", value: 1 };
 * @example
 * const ok: Ok<number> = { type: "ok", value: 1 };
 * const err: Err<string> = { type: "err", error: "Error" };
 * const result: Result<number, string> = ok;
 */
export type Result<T, E> = Ok<T> | Err<E>;

/**
 * Create an ok result
 * @param value - Value to return
 * @returns Ok result
 * @example
 * const result = ok(1);
 */
export const ok = <T>(value: T): Result<T, never> => ({
  type: "ok",
  value,
});

/**
 * Create an error result
 * @param error - Error to return
 * @returns Error result
 * @example
 * const result = err("Error");
 */
export const err = <E>(error: E): Result<never, E> => ({
  type: "err",
  error,
});
