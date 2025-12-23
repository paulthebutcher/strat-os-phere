#!/usr/bin/env node
/**
 * Guard script to prevent concurrent Next.js builds.
 * 
 * - In CI: fails fast if another build is detected
 * - In local dev: attempts to kill the existing build process gracefully
 * - Cleans .next directory and optional cache before building
 */

import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

const isCI = process.env.CI === 'true';
const projectRoot = process.cwd();

/**
 * Find running Next.js build processes
 * @returns {Array<{pid: string, cmd: string}>} Array of process info
 */
function findRunningNextBuilds() {
  try {
    const platform = process.platform;
    let command;
    
    if (platform === 'darwin' || platform === 'linux') {
      // Use ps to find processes matching "next build" or "next-build"
      // Exclude this script itself and grep processes
      command = `ps aux | grep -E "(next build|next-build)" | grep -v grep | grep -v guard-next-build`;
    } else if (platform === 'win32') {
      // Windows: use tasklist and findstr
      command = `tasklist /FI "IMAGENAME eq node.exe" /FO CSV | findstr /I "next"`;
    } else {
      console.warn(`⚠️  Platform ${platform} not fully supported; skipping process check`);
      return [];
    }

    const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' }).trim();
    
    if (!output) {
      return [];
    }

    const processes = [];
    const lines = output.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      if (platform === 'darwin' || platform === 'linux') {
        // Parse ps aux output: USER PID %CPU %MEM VSZ RSS TTY STAT START TIME COMMAND
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 11) {
          const pid = parts[1];
          const cmd = parts.slice(10).join(' ');
          // Only include if it's actually a next build command
          if (cmd.includes('next build') || cmd.includes('next-build')) {
            processes.push({ pid, cmd });
          }
        }
      }
      // Windows parsing would go here if needed
    }
    
    return processes;
  } catch (error) {
    // If grep finds nothing, it exits with code 1, which is fine
    if (error.status === 1) {
      return [];
    }
    // Other errors: log but don't fail
    console.warn(`⚠️  Could not check for running builds: ${error.message}`);
    return [];
  }
}

/**
 * Synchronous sleep helper (busy-wait)
 * @param {number} ms Milliseconds to wait
 */
function sleep(ms) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    // Busy wait
  }
}

/**
 * Kill a process gracefully, then forcefully if needed (synchronous)
 * @param {string} pid Process ID
 * @returns {boolean} True if process was killed or already gone
 */
function killProcess(pid) {
  try {
    const platform = process.platform;
    
    if (platform === 'darwin' || platform === 'linux') {
      // Check if process exists
      try {
        execSync(`ps -p ${pid} > /dev/null 2>&1`, { stdio: 'ignore' });
      } catch (err) {
        // Process doesn't exist
        return true;
      }
      
      // Try SIGTERM first
      try {
        process.kill(parseInt(pid, 10), 'SIGTERM');
        console.log(`   → Sent SIGTERM to process ${pid}`);
      } catch (err) {
        // Process might already be gone
        return true;
      }
      
      // Wait up to 2 seconds, checking every 200ms
      let waited = 0;
      const maxWait = 2000;
      const checkInterval = 200;
      
      while (waited < maxWait) {
        // Use busy-wait for cross-platform compatibility
        sleep(checkInterval);
        waited += checkInterval;
        
        // Check if process still exists
        try {
          execSync(`ps -p ${pid} > /dev/null 2>&1`, { stdio: 'ignore' });
        } catch (err) {
          // Process is gone
          console.log(`   ✓ Process ${pid} terminated gracefully`);
          return true;
        }
      }
      
      // Still running after 2s, force kill
      try {
        process.kill(parseInt(pid, 10), 'SIGKILL');
        console.log(`   ✓ Force-killed process ${pid}`);
        return true;
      } catch (err) {
        console.warn(`   ⚠️  Could not force-kill process ${pid}`);
        return false;
      }
    } else if (platform === 'win32') {
      // Windows: use taskkill
      try {
        execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' });
        console.log(`   ✓ Killed process ${pid}`);
        return true;
      } catch (err) {
        // Process might already be gone
        return true;
      }
    } else {
      console.warn(`   ⚠️  Platform ${platform} not supported for process killing`);
      return false;
    }
  } catch (error) {
    console.warn(`   ⚠️  Could not kill process ${pid}: ${error.message}`);
    return false;
  }
}

/**
 * Clean build artifacts
 */
function cleanArtifacts() {
  const nextDir = join(projectRoot, '.next');
  const cacheDir = join(projectRoot, 'node_modules', '.cache');
  
  if (existsSync(nextDir)) {
    console.log('🧹 Cleaning .next directory...');
    rmSync(nextDir, { recursive: true, force: true });
    console.log('   ✓ Removed .next');
  }
  
  if (existsSync(cacheDir)) {
    console.log('🧹 Cleaning node_modules/.cache...');
    rmSync(cacheDir, { recursive: true, force: true });
    console.log('   ✓ Removed node_modules/.cache');
  }
}

/**
 * Main guard function
 */
function main() {
  console.log('🔒 Checking for concurrent Next.js builds...');
  
  const runningBuilds = findRunningNextBuilds();
  
  if (runningBuilds.length > 0) {
    console.error(`\n❌ Found ${runningBuilds.length} running Next.js build process(es):`);
    runningBuilds.forEach(({ pid, cmd }) => {
      console.error(`   PID ${pid}: ${cmd.substring(0, 80)}...`);
    });
    
    if (isCI) {
      console.error('\n🚫 CI mode: refusing to run concurrent builds.');
      console.error('   Please ensure only one build runs at a time.');
      process.exit(1);
    } else {
      console.warn('\n⚠️  Local dev mode: attempting to terminate existing build(s)...');
      
      // Kill all processes synchronously
      let allKilled = true;
      for (const { pid } of runningBuilds) {
        if (!killProcess(pid)) {
          allKilled = false;
        }
      }
      
      // Wait a bit for cleanup
      sleep(500);
      
      if (allKilled) {
        console.log('✓ Existing build processes terminated (or already finished)');
      } else {
        console.warn('⚠️  Some processes may still be running');
      }
      
      cleanArtifacts();
      console.log('✓ Ready to start new build\n');
    }
  } else {
    console.log('✓ No concurrent builds detected');
    cleanArtifacts();
    console.log('✓ Ready to build\n');
  }
}

// Run the guard
main();

