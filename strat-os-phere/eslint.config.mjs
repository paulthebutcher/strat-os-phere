import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

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
  {
    rules: {
      // Prevent variable redeclaration (catches duplicate imports, etc.)
      "no-redeclare": "error",
      // TypeScript-aware shadowing detection (prevents name collisions)
      "@typescript-eslint/no-shadow": "error",
      // Disable base no-shadow rule in favor of TypeScript version
      "no-shadow": "off",
    },
  },
]);

export default eslintConfig;
