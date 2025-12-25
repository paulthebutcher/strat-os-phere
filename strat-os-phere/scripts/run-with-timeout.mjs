#!/usr/bin/env node
/**
 * run-with-timeout.mjs
 * 
 * Cross-platform timeout wrapper that kills a command after N seconds.
 * 
 * Usage:
 *   node scripts/run-with-timeout.mjs <seconds> "<command>"
 * 
 * Example:
 *   node scripts/run-with-timeout.mjs 30 "pnpm lint"
 * 
 * Exits with:
 *   - 0 if command completes within timeout
 *   - 124 if timeout is reached (standard timeout exit code)
 *   - Command's exit code if it fails before timeout
 */

import { spawn } from 'child_process';
import { platform } from 'os';

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: node run-with-timeout.mjs <seconds> "<command>"');
  process.exit(1);
}

const timeoutSeconds = parseInt(args[0], 10);
const command = args[1];

if (isNaN(timeoutSeconds) || timeoutSeconds <= 0) {
  console.error('Error: timeout must be a positive number');
  process.exit(1);
}

if (!command) {
  console.error('Error: command is required');
  process.exit(1);
}

// Parse command and args
const isWindows = platform() === 'win32';
const shell = isWindows ? 'cmd.exe' : '/bin/sh';
const shellFlag = isWindows ? '/c' : '-c';

let childProcess;
let timeoutId;

const cleanup = () => {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
};

const killProcess = () => {
  if (childProcess && !childProcess.killed) {
    // Try graceful kill first (SIGTERM)
    childProcess.kill('SIGTERM');
    
    // Force kill after 2 seconds if still running
    setTimeout(() => {
      if (childProcess && !childProcess.killed) {
        childProcess.kill('SIGKILL');
      }
    }, 2000);
  }
};

// Set up timeout
timeoutId = setTimeout(() => {
  cleanup();
  console.error(`\n⏱️  Command timed out after ${timeoutSeconds} seconds`);
  console.error(`Command: ${command}`);
  killProcess();
  process.exit(124); // Standard timeout exit code
}, timeoutSeconds * 1000);

// Spawn the command
childProcess = spawn(shell, [shellFlag, command], {
  stdio: 'inherit',
  shell: false,
});

childProcess.on('exit', (code, signal) => {
  cleanup();
  
  if (signal === 'SIGTERM' || signal === 'SIGKILL') {
    // Process was killed by timeout
    process.exit(124);
  } else {
    // Process exited normally or with error
    process.exit(code ?? 0);
  }
});

childProcess.on('error', (error) => {
  cleanup();
  console.error(`Error spawning command: ${error.message}`);
  process.exit(1);
});

// Handle process termination signals
process.on('SIGINT', () => {
  cleanup();
  killProcess();
  process.exit(130); // Standard SIGINT exit code
});

process.on('SIGTERM', () => {
  cleanup();
  killProcess();
  process.exit(143); // Standard SIGTERM exit code
});

