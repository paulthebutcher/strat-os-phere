#!/usr/bin/env node
/**
 * Schema Health Check Script
 * 
 * Static analysis to detect architectural drift:
 * - Forbidden references to derived run state on projects (latest*run*, latest_*)
 * - Projects insert/update with keys not in allowedColumns
 * - Direct writes of onboarding fields into projects
 * 
 * Run with: pnpm schema:health
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'
import { PROJECT_ALLOWED_COLUMNS } from '../lib/db/projectsSchema'

// File extensions to check
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx']

// Directories to exclude
const EXCLUDE_DIRS = [
  'node_modules',
  '.next',
  'dist',
  'build',
  'coverage',
  '.git',
  'node_modules_old_1766341649',
]

interface Violation {
  file: string
  line: number
  pattern: string
  content: string
  severity: 'error' | 'warning'
}

// Patterns that indicate architectural drift
const DRIFT_PATTERNS = [
  {
    name: 'Derived run state on projects',
    pattern: /projects\.(latest.*run|latest_run|latest_successful_run|latest_)/i,
    severity: 'error' as const,
    description: 'References to latest run fields on projects table (should derive from project_runs)',
  },
  {
    name: 'Projects insert with forbidden fields',
    pattern: /\.from\(['"]projects['"]\)[^}]*\.insert\([^)]*\{[^}]*\b(hypothesis|decision_framing|market_context|starting_point|customer_profile|latest_run_id|latest_successful_run_id)\b/i,
    severity: 'error' as const,
    description: 'Direct insert of forbidden fields into projects table',
  },
  {
    name: 'Projects update with forbidden fields',
    pattern: /\.from\(['"]projects['"]\)[^}]*\.update\([^)]*\{[^}]*\b(hypothesis|decision_framing|market_context|starting_point|customer_profile|latest_run_id|latest_successful_run_id)\b/i,
    severity: 'error' as const,
    description: 'Direct update of forbidden fields on projects table',
  },
  {
    name: 'Projects insert without pickAllowedProjectFields',
    pattern: /\.from\(['"]projects['"]\)[^}]*\.insert\([^)]*\{[^}]*\b(market|target_customer|your_product|business_goal|geography|ambition_level|primary_constraint|risk_posture|organizational_capabilities|input_confidence|decision_level|explicit_non_goals)\b[^}]*\}(?!\s*pickAllowedProjectFields)/i,
    severity: 'warning' as const,
    description: 'Projects insert with evolving fields - should use pickAllowedProjectFields or project_inputs',
  },
]

function shouldExcludeFile(filePath: string): boolean {
  return EXCLUDE_DIRS.some((dir) => filePath.includes(`/${dir}/`) || filePath.includes(`\\${dir}\\`))
}

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  try {
    const files = readdirSync(dir)
    
    for (const file of files) {
      const filePath = join(dir, file)
      
      if (shouldExcludeFile(filePath)) {
        continue
      }
      
      try {
        const stat = statSync(filePath)
        
        if (stat.isDirectory()) {
          getAllFiles(filePath, fileList)
        } else if (stat.isFile() && FILE_EXTENSIONS.includes(extname(file))) {
          fileList.push(filePath)
        }
      } catch {
        // Skip files we can't read
        continue
      }
    }
  } catch {
    // Skip directories we can't read
  }
  
  return fileList
}

function isInComment(line: string, index: number): boolean {
  const beforeToken = line.substring(0, index)
  // Single-line comment
  if (beforeToken.includes('//')) {
    return true
  }
  // Multi-line comment
  const commentStartIndex = beforeToken.lastIndexOf('/*')
  const commentEndIndex = beforeToken.lastIndexOf('*/')
  if (commentStartIndex !== -1 && (commentEndIndex === -1 || commentStartIndex > commentEndIndex)) {
    return true
  }
  // Check if entire line is a comment
  const trimmed = line.trim()
  if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/**')) {
    return true
  }
  return false
}

function isInString(line: string, index: number): boolean {
  const beforeToken = line.substring(0, index)
  const singleQuotes = (beforeToken.match(/'/g) || []).length
  const doubleQuotes = (beforeToken.match(/"/g) || []).length
  return (singleQuotes % 2 !== 0) || (doubleQuotes % 2 !== 0)
}

function findViolations(): Violation[] {
  const violations: Violation[] = []
  const cwd = process.cwd()

  // Find all relevant files
  const files = getAllFiles(cwd)

  for (const file of files) {
    // Skip this script file and other check scripts
    if (file.includes('schemaHealthCheck.ts') || 
        file.includes('checkForbiddenTokens.ts') || 
        file.includes('check-schema-drift.ts')) {
      continue
    }

    try {
      const content = readFileSync(file, 'utf-8')
      const lines = content.split('\n')

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const lineNum = i + 1

        for (const driftPattern of DRIFT_PATTERNS) {
          const matches = Array.from(line.matchAll(new RegExp(driftPattern.pattern.source, 'gi')))
          
          for (const match of matches) {
            const matchIndex = match.index!
            
            // Skip if in a comment
            if (isInComment(line, matchIndex)) {
              continue
            }
            
            // Skip if line documents that these don't exist
            if (line.includes('does not exist') || 
                line.includes('do not exist') ||
                line.includes('Note:') ||
                line.includes('// Note:') ||
                line.includes('* Note:')) {
              continue
            }
            
            // Skip if in a string (unless it's a select string or object key)
            if (isInString(line, matchIndex)) {
              // Check if it looks like a database select or object key
              const looksLikeSelect = /\.select\s*\(/i.test(line) || /select\s*\(/i.test(line)
              const looksLikeObjectKey = /['"]\s*:\s*/.test(line.substring(matchIndex))
              if (!looksLikeSelect && !looksLikeObjectKey) {
                continue
              }
            }
            
            // Skip test files (they may test error handling)
            if (file.includes('/tests/') || file.includes('\\tests\\') || file.includes('.test.') || file.includes('.spec.')) {
              if (line.includes('//') || line.includes('mock') || line.includes('Mock')) {
                continue
              }
            }
            
            // This is a violation
            violations.push({
              file: file.replace(cwd, '.').replace(/\\/g, '/'),
              line: lineNum,
              pattern: driftPattern.name,
              content: line.trim(),
              severity: driftPattern.severity,
            })
            break // Only report once per line per pattern
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read file ${file}:`, error)
    }
  }

  return violations
}

function main() {
  console.log('🔍 Running schema health check...\n')

  const violations = findViolations()

  if (violations.length === 0) {
    console.log('✅ No architectural drift violations found.')
    console.log('✅ Schema health check passed.\n')
    process.exit(0)
  }

  // Separate errors and warnings
  const errors = violations.filter(v => v.severity === 'error')
  const warnings = violations.filter(v => v.severity === 'warning')

  console.error(`❌ Found ${violations.length} violation(s): ${errors.length} error(s), ${warnings.length} warning(s)\n`)

  // Group by pattern for better reporting
  const byPattern = new Map<string, Violation[]>()
  for (const violation of violations) {
    if (!byPattern.has(violation.pattern)) {
      byPattern.set(violation.pattern, [])
    }
    byPattern.get(violation.pattern)!.push(violation)
  }

  // Report errors first
  if (errors.length > 0) {
    console.error('🚨 ERRORS (must fix):')
    console.error('─'.repeat(60))
    for (const [pattern, patternViolations] of byPattern.entries()) {
      const patternErrors = patternViolations.filter(v => v.severity === 'error')
      if (patternErrors.length > 0) {
        console.error(`\nPattern: ${pattern} (${patternErrors.length} violation(s))`)
        for (const violation of patternErrors) {
          console.error(`  ${violation.file}:${violation.line}`)
          console.error(`    ${violation.content}`)
        }
      }
    }
  }

  // Report warnings
  if (warnings.length > 0) {
    console.error('\n⚠️  WARNINGS (should review):')
    console.error('─'.repeat(60))
    for (const [pattern, patternViolations] of byPattern.entries()) {
      const patternWarnings = patternViolations.filter(v => v.severity === 'warning')
      if (patternWarnings.length > 0) {
        console.error(`\nPattern: ${pattern} (${patternWarnings.length} violation(s))`)
        for (const violation of patternWarnings) {
          console.error(`  ${violation.file}:${violation.line}`)
          console.error(`    ${violation.content}`)
        }
      }
    }
  }

  console.error(
    `\n❌ Schema health check failed.\n` +
    `These violations indicate architectural drift from the refactored schema.\n` +
    `Please review and fix:\n` +
    `  - Use project_inputs for evolving fields\n` +
    `  - Use project_runs for run state (derive latest, don't store)\n` +
    `  - Use pickAllowedProjectFields() for project inserts/updates\n`
  )

  // Exit with error code if there are any errors (warnings don't fail the build)
  process.exit(errors.length > 0 ? 1 : 0)
}

if (require.main === module) {
  main()
}

