#!/usr/bin/env node
/**
 * Schema drift check script.
 * 
 * Prevents reintroducing columns that don't exist in production.
 * Fails if it finds references to forbidden columns in the codebase.
 * Also checks for:
 * - Forbidden imports of analysis_runs in runtime paths
 * - Required MVP tables present in database.types.ts
 * - docs/sql "REFERENCE ONLY" files being imported by runtime code
 * 
 * Run with: pnpm run check:schema
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join, extname } from 'path'

// Columns that are known to not exist in production
const FORBIDDEN_COLUMNS = [
  'hypothesis',
  'decision_framing',
  'starting_point',
  'customer_profile',
  'market_context',
  'problem_statement',
  'solution_idea',
  'context_paste',
  'latest_run_id', // Use lib/data/latestRun.ts to derive from artifacts table
  'latest_successful_run_id', // Use lib/data/latestRun.ts to derive from artifacts table
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
          
          // Skip form state assignments, experiment schemas, and prompt examples
          const isFormState = /\b(useState|formState|setFormState|initialState)\s*[=:\(]/.test(line) ||
                             line.includes('const [formState') ||
                             line.includes('useState({') ||
                             (file.includes('NewAnalysisForm.tsx') && line.includes('hypothesis:') && line.includes("''"))
          const isExperimentSchema = file.includes('schemas/opportunityV3.ts') ||
                                    file.includes('samples/adapter.ts') ||
                                    /\bExperimentSchema/.test(line) ||
                                    /experiments\s*:\s*\[/.test(line)
          const isPromptExample = file.includes('prompts/opportunityV3.ts') && 
                                 (line.includes("hypothesis: 'string'") || line.includes('hypothesis: "string"'))
          
          // Only flag if it's an assignment and not just reading, and not in excluded contexts
          if (isAssignment && !isReading && !isFormState && !isExperimentSchema && !isPromptExample) {
            // Check if it's in a context that looks like an INSERT/UPDATE payload
            const looksLikeInsertUpdate = /\b(createProject|insert|update|buildProjectUpdate)\s*\(/i.test(line) || 
                                          (/^\s*[a-z_]+\s*:\s*[^,}]+/i.test(line.trim()) && 
                                           !/^\s*(const|let|var|function|export|import)/.test(line.trim()))
            
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

// Required MVP tables that must exist in database.types.ts
const REQUIRED_TABLES = [
  'projects',
  'competitors',
  'artifacts',
  'project_runs',
  'project_inputs',
  'project_shares',
  'evidence_sources',
  'evidence_cache',
]

interface ImportViolation {
  file: string
  line: number
  importPath: string
  content: string
}

function checkAnalysisRunsImports(): ImportViolation[] {
  const violations: ImportViolation[] = []
  const cwd = process.cwd()
  // Find the strat-os-phere directory (could be cwd or a subdirectory)
  let basePath = cwd
  if (!existsSync(join(cwd, 'app')) && existsSync(join(cwd, 'strat-os-phere', 'app'))) {
    basePath = join(cwd, 'strat-os-phere')
  }
  
  // Check all runtime code directories (app, lib, components, hooks, etc.)
  // Exclude test files and type definition files
  const allFiles = getAllFiles(basePath)
  
  // Patterns to check for analysis_runs imports
  const forbiddenPatterns = [
    /from\s+['"]@\/lib\/data\/runs['"]/,
    /import.*from.*['"]@\/lib\/data\/runs['"]/,
    /import.*analysis_runs/i,
    /from.*['"]@\/lib\/data\/analysisRuns['"]/i,
    /AnalysisRunRow/i,
  ]
  
  // Exclude test files, type definitions, and migration scripts
  const excludedPaths = [
    '/tests/',
    '\\tests\\',
    'database.types.ts',
    'types.ts',
    '/docs/',
    '\\docs\\',
    '/migrations/',
    '\\migrations\\',
    'check-schema-drift.ts',
  ]
  
  for (const file of allFiles) {
    // Skip excluded files
    if (excludedPaths.some(path => file.includes(path))) {
      continue
    }
    
    // Only check runtime paths (app, lib, components, hooks, etc.)
    const relativePath = file.replace(basePath, '').replace(/\\/g, '/')
    if (!relativePath.match(/^\/(app|lib|components|hooks|middleware)/)) {
      continue
    }
    
    try {
      const content = readFileSync(file, 'utf-8')
      const lines = content.split('\n')
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const lineNum = i + 1
        
        // Skip type-only imports in type definition contexts
        if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
          continue
        }
        
        for (const pattern of forbiddenPatterns) {
          if (pattern.test(line)) {
            violations.push({
              file: file.replace(cwd, '.').replace(/\\/g, '/'),
              line: lineNum,
              importPath: line.trim(),
              content: line.trim(),
            })
            break // Only report once per line
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read file ${file}:`, error)
    }
  }
  
  return violations
}

function checkRequiredTablesInTypes(): string[] {
  const missing: string[] = []
  const cwd = process.cwd()
  // Find the strat-os-phere directory (could be cwd or a subdirectory)
  let basePath = cwd
  if (!existsSync(join(cwd, 'lib', 'supabase', 'database.types.ts')) && existsSync(join(cwd, 'strat-os-phere', 'lib', 'supabase', 'database.types.ts'))) {
    basePath = join(cwd, 'strat-os-phere')
  }
  const typesPath = join(basePath, 'lib', 'supabase', 'database.types.ts')
  
  if (!existsSync(typesPath)) {
    console.warn('Warning: database.types.ts not found')
    return REQUIRED_TABLES // Report all as missing if file doesn't exist
  }
  
  try {
    const content = readFileSync(typesPath, 'utf-8')
    
    for (const table of REQUIRED_TABLES) {
      // Check if table exists in the Database type definition
      // Look for: tableName: { Row: ... } in the Tables section
      // Pattern: table name, colon, opening brace, then Row
      const tablePattern = new RegExp(`\\b${table}\\s*:\\s*\\{[^}]*Row:`, 's')
      if (!tablePattern.test(content)) {
        missing.push(table)
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read database.types.ts:`, error)
    return REQUIRED_TABLES
  }
  
  return missing
}

function checkReferenceOnlySqlImports(): ImportViolation[] {
  const violations: ImportViolation[] = []
  const cwd = process.cwd()
  // Find the strat-os-phere directory (could be cwd or a subdirectory)
  let basePath = cwd
  if (!existsSync(join(cwd, 'app')) && existsSync(join(cwd, 'strat-os-phere', 'app'))) {
    basePath = join(cwd, 'strat-os-phere')
  }
  const runtimeDirs = ['app', 'lib']
  
  // Check for imports from docs/sql (which are reference-only)
  const sqlImportPattern = /from\s+['"]@\/docs\/sql|from\s+['"]\.\.\/docs\/sql|from\s+['"]\.\.\/\.\.\/docs\/sql/i
  
  for (const dir of runtimeDirs) {
    const dirPath = join(basePath, dir)
    if (!existsSync(dirPath)) continue
    
    const files = getAllFiles(dirPath)
    
    for (const file of files) {
      // Skip test files
      if (file.includes('/tests/') || file.includes('\\tests\\')) {
        continue
      }
      
      try {
        const content = readFileSync(file, 'utf-8')
        const lines = content.split('\n')
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]
          const lineNum = i + 1
          
          if (sqlImportPattern.test(line)) {
            violations.push({
              file: file.replace(cwd, '.').replace(/\\/g, '/'),
              line: lineNum,
              importPath: line.trim(),
              content: line.trim(),
            })
          }
        }
      } catch (error) {
        console.warn(`Warning: Could not read file ${file}:`, error)
      }
    }
  }
  
  return violations
}

function main() {
  console.log('Checking for schema drift violations...\n')
  
  let hasErrors = false

  // Check forbidden columns
  const violations = findViolations()
  if (violations.length > 0) {
    hasErrors = true
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
  }

  // Check for analysis_runs imports in runtime paths
  const analysisRunsViolations = checkAnalysisRunsImports()
  if (analysisRunsViolations.length > 0) {
    hasErrors = true
    console.error(`\n❌ Found ${analysisRunsViolations.length} forbidden analysis_runs import(s) in runtime paths:\n`)
    for (const violation of analysisRunsViolations) {
      console.error(`  ${violation.file}:${violation.line}`)
      console.error(`    ${violation.content}`)
    }
    console.error('\n  Error: analysis_runs imports are forbidden in app/, lib/results/, lib/runs/')
    console.error('  Use project_runs instead (lib/data/projectRuns.ts)\n')
  }

  // Check for required tables in database.types.ts
  const missingTables = checkRequiredTablesInTypes()
  if (missingTables.length > 0) {
    hasErrors = true
    console.error(`\n❌ Missing required tables in database.types.ts:\n`)
    for (const table of missingTables) {
      console.error(`  - ${table}`)
    }
    console.error('\n  Error: All MVP tables must be present in database.types.ts')
    console.error('  Run: supabase gen types typescript --project-id <project-id> > lib/supabase/database.types.ts\n')
  }

  // Check for docs/sql imports in runtime code
  const sqlImportViolations = checkReferenceOnlySqlImports()
  if (sqlImportViolations.length > 0) {
    hasErrors = true
    console.error(`\n❌ Found ${sqlImportViolations.length} forbidden docs/sql import(s) in runtime code:\n`)
    for (const violation of sqlImportViolations) {
      console.error(`  ${violation.file}:${violation.line}`)
      console.error(`    ${violation.content}`)
    }
    console.error('\n  Error: docs/sql files are REFERENCE ONLY and cannot be imported by runtime code\n')
  }

  if (hasErrors) {
    if (violations.length > 0) {
      console.error(
        `\n❌ Schema drift check failed. These columns do not exist in production:\n   ${FORBIDDEN_COLUMNS.join(', ')}\n`
      )
      console.error(
        'Please remove references to these columns or use fallback values instead.\n'
      )
    }
    process.exit(1)
  }

  console.log('✅ No schema drift violations found.')
  console.log('✅ No forbidden analysis_runs imports found.')
  console.log(`✅ All required tables present in database.types.ts: ${REQUIRED_TABLES.join(', ')}`)
  console.log('✅ No docs/sql imports in runtime code.')
  process.exit(0)
}

if (require.main === module) {
  main()
}

