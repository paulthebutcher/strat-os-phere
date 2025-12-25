#!/usr/bin/env node
/**
 * lint-file.mjs
 * 
 * Lint a specific file or files.
 * 
 * Usage:
 *   node scripts/lint-file.mjs <file1> [file2] [...]
 *   pnpm lint:file app/page.tsx
 *   pnpm lint:file app/page.tsx components/Button.tsx
 */

import { execSync } from 'child_process';
import { platform } from 'os';

const isWindows = platform() === 'win32';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: pnpm lint:file <file1> [file2] [...]');
  console.error('Example: pnpm lint:file app/projects/page.tsx');
  process.exit(1);
}

// Validate files exist (basic check)
const files = args.filter(arg => !arg.startsWith('-')); // Filter out eslint flags

if (files.length === 0) {
  console.error('Error: No files specified');
  process.exit(1);
}

// Run eslint on the specified files
// Use pnpm exec to ensure we use the local eslint
const eslintCommand = `pnpm exec eslint ${args.map(f => `"${f}"`).join(' ')}`;

try {
  execSync(eslintCommand, {
    stdio: 'inherit',
    shell: isWindows ? 'cmd.exe' : '/bin/sh',
  });
  process.exit(0);
} catch (error) {
  process.exit(error.status || 1);
}

