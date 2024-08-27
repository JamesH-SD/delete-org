import { join } from "node:path";

/**
 * Generate a path to a source code file based on the provided path.
 * @param path to the source code file.
 * @param file to generate the path for.
 * @returns the path to the source code file.
 * @example
 * generateSourceCodePath("lib/task-count/lambdas")("get-cm-rules");
 * // lib/task-count/lambdas/get-cm-rules
 */
export const generateSourceCodePath =
  (path: string) =>
  (file: string): string =>
    join(path, file);
