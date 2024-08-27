/** The type of the stage */
export type Stage = "dev" | "prod" | "train" | "demo";

/**
 * Get the stage from the environment variables its default to "dev"
 * @returns The stage
 * @example
 * const stage = getStageFromEnv();
 * // stage: "dev"
 */
export const getStageFromEnv = (): Stage =>
  (process.env.STAGE as Stage) || "dev";
