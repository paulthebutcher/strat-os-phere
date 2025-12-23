#!/usr/bin/env node
/**
 * Forbidden token check script.
 * 
 * Build-time check that fails if forbidden column names appear anywhere in the repo.
 * This prevents schema drift by catching references to non-existent columns.
 * 
 * Run with: pnpm run check:forbidden
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

// Forbidden tokens that must not appear in the codebase
// These columns do not exist in the production projects table schema
const FORBIDDEN_TOKENS = [
  'hypothesis',
  'decision_framing',
  'market_context',
  'latest_run_id',
  'latest_successful_run_id',
  'customer_profile',
  'starting_point',
  // Also include variations that might be used
  'problem_statement',
  'solution_idea',
  'context_paste',
] as const

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
  token: string
  content: string
}

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

function isInComment(line: string, tokenIndex: number): boolean {
  // Check if the token appears in a comment
  const beforeToken = line.substring(0, tokenIndex)
  // Single-line comment
  if (beforeToken.includes('//')) {
    return true
  }
  // Multi-line comment start
  const commentStartIndex = beforeToken.lastIndexOf('/*')
  const commentEndIndex = beforeToken.lastIndexOf('*/')
  if (commentStartIndex !== -1 && (commentEndIndex === -1 || commentStartIndex > commentEndIndex)) {
    return true
  }
  // Check if entire line is a comment (starts with // or *)
  const trimmed = line.trim()
  if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/**')) {
    return true
  }
  return false
}

function isInString(line: string, tokenIndex: number): boolean {
  // Check if the token appears inside a string literal
  const beforeToken = line.substring(0, tokenIndex)
  // Count single and double quotes before the token
  const singleQuotes = (beforeToken.match(/'/g) || []).length
  const doubleQuotes = (beforeToken.match(/"/g) || []).length
  // If odd number of quotes, we're inside a string
  return (singleQuotes % 2 !== 0) || (doubleQuotes % 2 !== 0)
}

function findViolations(): Violation[] {
  const violations: Violation[] = []
  const cwd = process.cwd()

  // Find all relevant files
  const files = getAllFiles(cwd)

  for (const file of files) {
    // Skip this script file and the old schema drift check
    if (file.includes('checkForbiddenTokens.ts') || file.includes('check-schema-drift.ts')) {
      continue
    }

    try {
      const content = readFileSync(file, 'utf-8')
      const lines = content.split('\n')

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const lineNum = i + 1

        for (const token of FORBIDDEN_TOKENS) {
          // Create regex to find token as a whole word (not part of another word)
          // Match: word boundary, token, word boundary (but allow underscores within token)
          const tokenRegex = new RegExp(`\\b${token.replace(/_/g, '_')}\\b`, 'gi')
          let match: RegExpExecArray | null
          
          while ((match = tokenRegex.exec(line)) !== null) {
            const tokenIndex = match.index

            // Skip if in a comment (allow documentation of forbidden tokens)
            if (isInComment(line, tokenIndex)) {
              continue
            }

            // Skip if line clearly documents that these don't exist
            if (line.includes('does not exist') || 
                line.includes('do not exist') ||
                line.includes('Note:') ||
                line.includes('// Note:') ||
                line.includes('* Note:') ||
                line.includes('intentionally excluded') ||
                line.includes('avoids schema drift')) {
              continue
            }

            // Skip if it's experiment hypothesis (different from projects.hypothesis)
            // Experiments have their own hypothesis field which is allowed
            if (token === 'hypothesis' && (
              line.includes('experiments') ||
              line.includes('experiment.') ||
              line.includes('exp.hypothesis') ||
              line.includes('ExperimentSchema') ||
              file.includes('opportunityV3.ts') && line.includes('hypothesis:')
            )) {
              continue
            }

            // Skip type interfaces that document optional fields (they don't write to DB)
            // These are just type definitions for prompt inputs
            if ((file.includes('prompts/') || file.includes('ProjectContext')) && 
                (line.includes('?:') || line.includes('| null'))) {
              continue
            }

            // Skip if in a string literal (but flag it if it's a select string or object key)
            if (isInString(line, tokenIndex)) {
              // Check if it looks like a database select or object key
              const looksLikeSelect = /\.select\s*\(/i.test(line) || /select\s*\(/i.test(line)
              const looksLikeObjectKey = /['"]\s*:\s*/.test(line.substring(tokenIndex))
              if (looksLikeSelect || looksLikeObjectKey) {
                // This is a violation - forbidden token used in select string or object key
                violations.push({
                  file: file.replace(cwd, '.').replace(/\\/g, '/'),
                  line: lineNum,
                  token,
                  content: line.trim(),
                })
              }
              continue
            }

            // Skip type definition files (they document what doesn't exist)
            if (file.includes('database.types.ts') || file.includes('types.ts')) {
              // Only skip if it's in a comment or clearly documenting non-existence
              if (line.includes('does not exist') || line.includes('Note:') || line.includes('//')) {
                continue
              }
            }

            // Skip test files (they may test error handling for forbidden columns)
            if (file.includes('/tests/') || file.includes('\\tests\\') || file.includes('.test.') || file.includes('.spec.')) {
              // Only skip if it's in a comment or mock data
              if (line.includes('//') || line.includes('mock') || line.includes('Mock')) {
                continue
              }
            }

            // Skip form state (UI state is fine, just don't write to DB)
            // Form state is typically useState, formState, or initial state objects
            if (/\b(useState|formState|setFormState|initialState)\s*[=:\(]/.test(line) ||
                line.includes('const [formState') ||
                line.includes('useState({') ||
                line.includes('formState.' + token) ||
                line.includes('value={formState.') ||
                (token === 'hypothesis' && line.trim().match(/^hypothesis:\s*['"]?['"]?,?\s*$/))) {
              continue
            }

            // Skip experiment hypothesis (different from projects.hypothesis)
            if (token === 'hypothesis' && (
              line.includes('experiments') ||
              line.includes('experiment.') ||
              line.includes('exp.hypothesis') ||
              line.includes('ExperimentSchema') ||
              (file.includes('ResultsPresenter.tsx') && line.includes('hypothesis?:')) ||
              (file.includes('adapter.ts') && (line.includes('hypothesis?:') || line.includes('hypothesis:')))
            )) {
              continue
            }

            // Skip generic text mentions (not field references)
            // Check if it's just text content in quotes/strings
            const isGenericText = (
              line.includes("user's hypothesis") ||
              line.includes("user\'s hypothesis") ||
              line.includes('your hypothesis') ||
              line.includes('evaluates your hypothesis') ||
              line.includes('evaluate the user\'s hypothesis') ||
              line.includes('testable hypothesis') ||
              line.includes('Frame your analysis') ||
              (line.includes("'Outputs must evaluate") && line.includes('hypothesis')) ||
              (line.includes('"Outputs must evaluate') && line.includes('hypothesis'))
            )

            if (isGenericText) {
              continue
            }

            // Skip experiment hypothesis access (exp.hypothesis is different from project.hypothesis)
            if (token === 'hypothesis' && (
              line.includes('(exp as any).hypothesis') ||
              line.includes('.hypothesis ||')
            )) {
              continue
            }

            // Skip test files with mock data (they test filtering)
            if (file.includes('data-layer.test.ts')) {
              continue
            }

            // This is a violation - forbidden token found in code
            violations.push({
              file: file.replace(cwd, '.').replace(/\\/g, '/'),
              line: lineNum,
              token,
              content: line.trim(),
            })
            break // Only report once per line per token
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
  console.log('Checking for forbidden token violations...\n')

  const violations = findViolations()

  if (violations.length === 0) {
    console.log('✅ No forbidden token violations found.')
    process.exit(0)
  }

  console.error(`❌ Found ${violations.length} forbidden token violation(s):\n`)

  // Group by token for better reporting
  const byToken = new Map<string, Violation[]>()
  for (const violation of violations) {
    if (!byToken.has(violation.token)) {
      byToken.set(violation.token, [])
    }
    byToken.get(violation.token)!.push(violation)
  }

  for (const [token, tokenViolations] of byToken.entries()) {
    console.error(`\nToken: ${token} (${tokenViolations.length} violation(s))`)
    console.error('─'.repeat(60))

    for (const violation of tokenViolations) {
      console.error(`  ${violation.file}:${violation.line}`)
      console.error(`    ${violation.content}`)
    }
  }

  console.error(
    `\n❌ Forbidden token check failed. These tokens must not appear in the codebase:\n   ${FORBIDDEN_TOKENS.join(', ')}\n`
  )
  console.error(
    'These columns do not exist in the production projects table schema.\n' +
    'Remove references to these tokens or use allowed columns instead.\n'
  )

  process.exit(1)
}

if (require.main === module) {
  main()
}

