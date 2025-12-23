#!/usr/bin/env node
/**
 * Schema drift check script.
 * 
 * Prevents reintroducing columns that don't exist in production.
 * Fails if it finds references to forbidden columns in the codebase.
 * 
 * Run with: pnpm run check:schema
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

// Columns that are known to not exist in production
const FORBIDDEN_COLUMNS = [
  'starting_point',
  'customer_profile',
]

// File extensions to check
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx']

// Directories to exclude
const EXCLUDE_DIRS = [
  'node_modules',
  '.next',
  'dist',
  'build',
  'coverage',
  'node_modules_old_1766341649',
]

interface Violation {
  file: string
  line: number
  column: string
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

function findViolations(): Violation[] {
  const violations: Violation[] = []
  const cwd = process.cwd()

  // Find all relevant files
  const files = getAllFiles(cwd)

  for (const file of files) {
    // Skip this script file
    if (file.includes('check-schema-drift.ts')) {
      continue
    }

    try {
      const content = readFileSync(file, 'utf-8')
      const lines = content.split('\n')

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const lineNum = i + 1

        for (const column of FORBIDDEN_COLUMNS) {
          // Skip type definitions, test files, and this script
          const isTypeDefinition = file.includes('database.types.ts') || 
                                  file.includes('types.ts') ||
                                  (/\.ts['"]?\s*$/.test(file) && /^(export\s+)?(type|interface|type\s+\w+\s*=)/.test(line))
          const isTestFile = file.includes('/tests/') || file.includes('\\tests\\')
          
          if (isTypeDefinition || isTestFile) {
            continue
          }
          
          // Check for column in SELECT strings (most critical - causes DB errors)
          const selectPattern = new RegExp(`\\.select\\s*\\([^)]*['"]${column}['"]`, 'i')
          if (selectPattern.test(line)) {
            violations.push({
              file: file.replace(cwd, '.').replace(/\\/g, '/'),
              line: lineNum,
              column,
              content: line.trim(),
            })
            continue // Only report once per line
          }
          
          // Check for column in INSERT/UPDATE object properties (will fail silently or error)
          // Match: starting_point: value (but not project.starting_point which is just reading)
          // Only flag if it's assigning a value, not reading from an object
          const isAssignment = new RegExp(`\\b${column}\\s*:\\s*[^,}]+`, 'g').test(line)
          const isReading = new RegExp(`\\.${column}\\b`, 'g').test(line) || 
                           new RegExp(`\\b${column}\\s*\\|\\|`, 'g').test(line) ||
                           new RegExp(`\\b${column}\\s*\\?`, 'g').test(line)
          
          // Only flag if it's an assignment and not just reading
          if (isAssignment && !isReading) {
            // Check if it's in a context that looks like an INSERT/UPDATE payload
            const looksLikeInsertUpdate = /\b(createProject|insert|update)\s*\(/i.test(line) || 
                                          /^\s*[a-z_]+\s*:\s*[^,}]+/i.test(line.trim())
            
            if (looksLikeInsertUpdate) {
              violations.push({
                file: file.replace(cwd, '.').replace(/\\/g, '/'),
                line: lineNum,
                column,
                content: line.trim(),
              })
            }
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
  console.log('Checking for schema drift violations...\n')

  const violations = findViolations()

  if (violations.length === 0) {
    console.log('✅ No schema drift violations found.')
    process.exit(0)
  }

  console.error(`❌ Found ${violations.length} schema drift violation(s):\n`)

  // Group by column for better reporting
  const byColumn = new Map<string, Violation[]>()
  for (const violation of violations) {
    if (!byColumn.has(violation.column)) {
      byColumn.set(violation.column, [])
    }
    byColumn.get(violation.column)!.push(violation)
  }

  for (const [column, columnViolations] of byColumn.entries()) {
    console.error(`\nColumn: ${column} (${columnViolations.length} violation(s))`)
    console.error('─'.repeat(60))

    for (const violation of columnViolations) {
      console.error(`  ${violation.file}:${violation.line}`)
      console.error(`    ${violation.content}`)
    }
  }

  console.error(
    `\n❌ Schema drift check failed. These columns do not exist in production:\n   ${FORBIDDEN_COLUMNS.join(', ')}\n`
  )
  console.error(
    'Please remove references to these columns or use fallback values instead.\n'
  )

  process.exit(1)
}

if (require.main === module) {
  main()
}

