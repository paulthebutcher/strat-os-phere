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
      // Help catch half-removed components and unused variables
      "@typescript-eslint/no-unused-vars": ["warn", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_" 
      }],
      // JSX validation rules to catch malformed JSX early
      // Note: These rules are provided by eslint-config-next's React plugin
      // If they cause issues, they can be removed as Next.js config already includes React linting
    },
  },
  // Override for test files: allow `any` and relax unused vars to avoid blocking builds
  // Production code (app/, components/, lib/) still enforces strict rules
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/__tests__/**", "tests/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        // Allow unused vars in tests for better readability and future use
        caughtErrorsIgnorePattern: "^_",
      }],
    },
  },
]);

export default eslintConfig;
