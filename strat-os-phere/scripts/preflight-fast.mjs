#!/usr/bin/env node
import { spawn } from "node:child_process";

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
    p.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(" ")} exited with ${code}`));
    });
  });
}

(async () => {
  try {
    await run("pnpm", ["-s", "fast"]);
    process.exit(0);
  } catch (e) {
    console.error("\n[preflight-fast] failed:", e?.message ?? e);
    process.exit(1);
  }
})();

