#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const nextDir = path.join(cwd, ".next");

// Next sometimes leaves lock files / traces that block subsequent builds.
// We keep this conservative: remove only known lock-ish files if present.
const candidates = [
  path.join(nextDir, "lock"),
  path.join(nextDir, "trace"),
];

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function removeFile(p) {
  try {
    fs.rmSync(p, { force: true });
    console.log(`[guard-next-build] removed: ${path.relative(cwd, p)}`);
  } catch (e) {
    console.warn(`[guard-next-build] failed to remove ${p}:`, e?.message ?? e);
  }
}

function ensureNextDir() {
  if (!fs.existsSync(nextDir)) return false;
  return true;
}

const hasNext = ensureNextDir();
if (!hasNext) process.exit(0);

let removedAny = false;
for (const p of candidates) {
  if (exists(p)) {
    removeFile(p);
    removedAny = true;
  }
}

// Optional: detect obviously concurrent builds by presence of lock file repeatedly.
// We can't reliably detect running processes cross-platform without deps.
// If it keeps failing, the user will see the error and rerun.

if (removedAny) {
  console.log("[guard-next-build] cleanup complete.");
}
process.exit(0);
