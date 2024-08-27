import esbuild from "esbuild";
import { cache } from "esbuild-plugin-cache";
import time from "esbuild-plugin-time";
import {
  copyFileSync,
  existsSync,
  readdirSync,
  mkdirSync,
  lstatSync,
} from "node:fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { execSync } from "node:child_process";

function copyDirectorySync(source, destination) {
  // Ensure the destination directory exists
  if (!existsSync(destination)) {
    mkdirSync(destination, { recursive: true });
  }

  // Read the contents of the source directory
  const items = readdirSync(source);

  items.forEach((item) => {
    const sourcePath = path.join(source, item);
    const destinationPath = path.join(destination, item);

    // Check if the item is a directory or a file
    if (lstatSync(sourcePath).isDirectory()) {
      // Recursively copy the directory
      copyDirectorySync(sourcePath, destinationPath);
    } else {
      // Copy the file
      copyFileSync(sourcePath, destinationPath);
    }
  });
}
// Access the command-line arguments
const args = process.argv.slice(2); // Remove the first two elements
// args[0] = domain name;
// args[1] = lambda name

// Print the argumentkkjs
console.log("Command-line arguments:", args);

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
const outputDir = path.join(__dirname, "dist", args[0], args[1]);
const lambdaDir = path.join(__dirname, "lib", args[0], "lambdas", args[1]);

const externalDeps = [
  "@aws-sdk/*",
  "aws-sdk",
  "sqlite3",
  "mysql",
  "oracledb",
  "mysql2",
  "pg",
  "pg-query-stream",
  "better-sqlite3",
  "tedious",
];

const installDependencies = () => {
  // Run npm install in the output directory to create the node_modules folder
  copyFileSync(
    path.join(lambdaDir, "package.json"),
    path.join(outputDir, "package.json"),
  );
  console.log("inside install", outputDir);
  // execSync(
  //   `npm install -g pnpm && pnpm install --filter @acivilate/${args[1]} --prod --force`,
  //   {
  //     cwd: outputDir,
  //     stdio: "inherit",
  //   },
  // );
  // copyDirectorySync(
  //   path.join(__dirname, "node_modules"),
  //   path.join(outputDir, "node_modules"),
  // );
  execSync("npm install -g pnpm && pnpm install", {
    cwd: outputDir,
    stdio: "inherit",
  });
};

console.log("path", path.join(outputDir, "index.js"));
await esbuild
  .build({
    entryPoints: [path.join(lambdaDir, "index.ts")],
    outfile: path.join(outputDir, "index.js"),
    external: externalDeps,
    format: "cjs",
    platform: "node",
    target: "esnext",
    bundle: true,
    minify: true,
    plugins: [time(), cache({ directory: ".cache" })],
  })
  .then(() => {
    console.log("beforeInstall====>");
    installDependencies();
    console.log("aferInstall====>");
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
