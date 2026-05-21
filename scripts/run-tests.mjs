import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = dirname(scriptDir);
const vitestPath = resolve(rootDir, "node_modules", "vitest", "vitest.mjs");
const nodeExecutable = "C:/nvm4w/nodejs/node.exe";
const args = [vitestPath, "run", "tests/lib/server/backend.test.ts"];

if (process.argv.includes("--watch")) {
  args.splice(1, 1, "tests/lib/server/backend.test.ts");
}

const env = { ...process.env };

for (const key of Object.keys(env)) {
  if (key.toLowerCase().startsWith("npm_") || key === "NODE_OPTIONS") {
    delete env[key];
  }
}

const result = spawnSync(nodeExecutable, args, {
  cwd: rootDir,
  env,
  stdio: "inherit",
});

process.exit(result.status ?? 1);