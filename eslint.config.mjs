import { serialize, deserialize } from "node:v8";
import { defineConfig, globalIgnores } from "eslint/config";

if (typeof globalThis.structuredClone !== "function") {
  globalThis.structuredClone = (value) => deserialize(serialize(value));
}

const [{ default: nextVitals }, { default: nextTs }] = await Promise.all([
  import("eslint-config-next/core-web-vitals"),
  import("eslint-config-next/typescript"),
]);

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
