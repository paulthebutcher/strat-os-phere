#!/usr/bin/env node
/**
 * lint-changed.mjs
 * 
 * Lint only git-changed files (staged or unstaged).
 * 
 * Usage:
 *   node scripts/lint-changed.mjs
 * 
 * Finds changed .ts, .tsx, .js, .jsx files and runs eslint on them.
 * If no changed files, exits successfully with a message.
 */

import { execSync } from 'child_process';
import { platform } from 'os';

const isWindows = platform() === 'win32';

try {
  // Get changed files (staged + unstaged, excluding deleted)
  // git diff --name-only --diff-filter=ACMR gets staged changes
  // git diff --name-only --diff-filter=ACMR HEAD gets unstaged changes
  // Combine and deduplicate
  
  let stagedFiles = [];
  let unstagedFiles = [];
  
  try {
    const stagedOutput = execSync('git diff --cached --name-only --diff-filter=ACMR', {
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    stagedFiles = stagedOutput.trim().split('\n').filter(Boolean);
  } catch (e) {
    // No staged files or not a git repo - that's okay
  }
  
  try {
    const unstagedOutput = execSync('git diff --name-only --diff-filter=ACMR HEAD', {
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    unstagedFiles = unstagedOutput.trim().split('\n').filter(Boolean);
  } catch (e) {
    // No unstaged files or not a git repo - that's okay
  }
  
  // Combine and deduplicate
  const allChangedFiles = [...new Set([...stagedFiles, ...unstagedFiles])];
  
  // Filter to only lintable files
  const lintableExtensions = ['.ts', '.tsx', '.js', '.jsx'];
  const lintableFiles = allChangedFiles.filter(file => {
    return lintableExtensions.some(ext => file.endsWith(ext));
  });
  
  if (lintableFiles.length === 0) {
    console.log('✓ No changed lintable files found');
    process.exit(0);
  }
  
  console.log(`Linting ${lintableFiles.length} changed file(s):`);
  lintableFiles.forEach(file => console.log(`  - ${file}`));
  console.log('');
  
  // Run eslint on the changed files
  // Use pnpm exec to ensure we use the local eslint
  const eslintCommand = `pnpm exec eslint ${lintableFiles.map(f => `"${f}"`).join(' ')}`;
  
  try {
    execSync(eslintCommand, {
      stdio: 'inherit',
      shell: isWindows ? 'cmd.exe' : '/bin/sh',
    });
    console.log('\n✓ All changed files passed linting');
    process.exit(0);
  } catch (error) {
    // eslint exits with non-zero on errors, which will throw
    // Let it propagate naturally
    process.exit(error.status || 1);
  }
  
} catch (error) {
  if (error.message && error.message.includes('not a git repository')) {
    console.error('Error: Not a git repository');
    process.exit(1);
  }
  
  // Re-throw other errors
  throw error;
}

