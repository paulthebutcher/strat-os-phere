#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const lockPath = path.join(process.cwd(), ".next", "lock");

try {
  const stat = fs.statSync(lockPath);
  const ageMs = Date.now() - stat.mtimeMs;
  const maxAgeMs = 2 * 60 * 1000;

  if (ageMs > maxAgeMs) {
    fs.rmSync(lockPath, { force: true });
    console.log(`[guard-next-build] Removed stale .next/lock (age ${(ageMs / 1000).toFixed(0)}s)`);
  } else {
    console.log(`[guard-next-build] .next/lock exists but is recent (${(ageMs / 1000).toFixed(0)}s).`);
    process.exitCode = 1;
  }
} catch {
  // no lock, all good
}
