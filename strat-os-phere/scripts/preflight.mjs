#!/usr/bin/env node
import { spawn } from "node:child_process";

const DEFAULT_TIMEOUT_MS = Number(process.env.PREFLIGHT_TIMEOUT_MS || 120000);

function run(cmd, args, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, {
      stdio: "inherit",
      shell: false,
      env: process.env,
    });

    const t = setTimeout(() => {
      console.error(`\n[preflight] ⏱️ Timeout after ${timeoutMs / 1000}s: ${cmd} ${args.join(" ")}`);
      child.kill("SIGKILL");
      resolve(124);
    }, timeoutMs);

    child.on("exit", (code) => {
      clearTimeout(t);
      resolve(code ?? 1);
    });
  });
}

(async () => {
  console.log(`[preflight] Starting (timeout=${DEFAULT_TIMEOUT_MS / 1000}s per step)`);

  // Step 1: Typecheck (fastest correctness signal)
  const typecheck = await run("pnpm", ["-s", "typecheck"]);
  if (typecheck !== 0) process.exit(typecheck);

  // Step 2: Lint (fast)
  const lint = await run("pnpm", ["-s", "lint"]);
  if (lint !== 0) process.exit(lint);

  // Step 3: Targeted unit tests (optional, fast)
  // Only run if you have tests configured; otherwise skip by default.
  if (process.env.PREFLIGHT_TESTS === "1") {
    const tests = await run("pnpm", ["-s", "test:unit"], { timeoutMs: 180000 });
    if (tests !== 0) process.exit(tests);
  }

  console.log("[preflight] ✅ OK");
  process.exit(0);
})();

