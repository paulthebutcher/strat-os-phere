#!/usr/bin/env tsx
/**
 * Project Navigation Drift Guard
 * 
 * This script checks for violations of the canonical nav structure:
 * 1. Old nav component names being used in project pages
 * 2. Duplicate hard-coded nav labels outside projectNavSchema.ts
 * 
 * Run: pnpm nav:check
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const PROJECTS_DIR = join(process.cwd(), 'strat-os-phere', 'app', 'projects')
const SCHEMA_FILE = join(process.cwd(), 'strat-os-phere', 'lib', 'navigation', 'projectNavSchema.ts')

// Old nav component names that should not be used
const FORBIDDEN_NAV_COMPONENTS = [
  'LeftNav',
  'SidebarNav',
  'ProjectSidebar', // Deprecated, use ProjectNav
  'ProjectShell', // Deprecated, use ProjectAppShell
  'ProjectNavigator', // Deprecated, use ProjectNav
  'ProjectLayoutShell', // Deprecated, use ProjectAppShell
]

// Canonical nav labels (must match projectNavSchema.ts exactly)
const CANONICAL_LABELS = [
  'Decision',
  'Competitors',
  'Evidence',
  'Scorecard',
  'Appendix',
  'Settings',
]

// Patterns that indicate hard-coded nav lists
const NAV_LABEL_PATTERNS = [
  /['"](Decision|Competitors|Evidence|Scorecard|Appendix|Settings)['"]/g,
  /label:\s*['"](Decision|Competitors|Evidence|Scorecard|Appendix|Settings)['"]/g,
]

interface Violation {
  file: string
  line: number
  message: string
}

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  const files = readdirSync(dir)
  
  for (const file of files) {
    const filePath = join(dir, file)
    const stat = statSync(filePath)
    
    if (stat.isDirectory()) {
      // Skip node_modules and other build artifacts
      if (!file.startsWith('.') && file !== 'node_modules') {
        getAllFiles(filePath, fileList)
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath)
    }
  }
  
  return fileList
}

function checkForForbiddenComponents(filePath: string, content: string): Violation[] {
  const violations: Violation[] = []
  const lines = content.split('\n')
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    for (const component of FORBIDDEN_NAV_COMPONENTS) {
      // Check for imports
      if (line.includes(`from`) && line.includes(component)) {
        violations.push({
          file: filePath,
          line: i + 1,
          message: `Forbidden nav component "${component}" found. Use ProjectNav + ProjectAppShell instead.`,
        })
      }
      
      // Check for JSX usage
      if (line.includes(`<${component}`) || line.includes(`<${component} `)) {
        violations.push({
          file: filePath,
          line: i + 1,
          message: `Forbidden nav component "${component}" used in JSX. Use ProjectNav + ProjectAppShell instead.`,
        })
      }
    }
  }
  
  return violations
}

function checkForHardcodedLabels(filePath: string, content: string): Violation[] {
  // Skip the schema file itself
  if (filePath === SCHEMA_FILE) {
    return []
  }
  
  const violations: Violation[] = []
  const lines = content.split('\n')
  
  // Check for patterns that suggest hard-coded nav lists
  let foundLabels: string[] = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Check if this line contains canonical nav labels
    for (const label of CANONICAL_LABELS) {
      if (line.includes(`'${label}'`) || line.includes(`"${label}"`)) {
        foundLabels.push(label)
      }
    }
  }
  
  // If we found 3+ canonical labels in the same file, it's likely a hard-coded nav list
  if (foundLabels.length >= 3) {
    violations.push({
      file: filePath,
      line: 1,
      message: `Hard-coded nav labels found: ${foundLabels.join(', ')}. Use projectNavSchema.ts instead.`,
    })
  }
  
  return violations
}

function main() {
  console.log('🔍 Checking for project nav drift...\n')
  
  if (!require('fs').existsSync(PROJECTS_DIR)) {
    console.error(`❌ Projects directory not found: ${PROJECTS_DIR}`)
    process.exit(1)
  }
  
  const allFiles = getAllFiles(PROJECTS_DIR)
  const violations: Violation[] = []
  
  for (const file of allFiles) {
    try {
      const content = readFileSync(file, 'utf-8')
      const relativePath = file.replace(process.cwd(), '').replace(/^\//, '')
      
      // Check for forbidden components
      violations.push(...checkForForbiddenComponents(relativePath, content))
      
      // Check for hard-coded labels
      violations.push(...checkForHardcodedLabels(relativePath, content))
    } catch (error) {
      console.warn(`⚠️  Could not read file ${file}:`, error)
    }
  }
  
  if (violations.length === 0) {
    console.log('✅ No nav drift violations found!\n')
    process.exit(0)
  }
  
  console.error(`❌ Found ${violations.length} violation(s):\n`)
  
  for (const violation of violations) {
    console.error(`  ${violation.file}:${violation.line}`)
    console.error(`    ${violation.message}\n`)
  }
  
  console.error('💡 Fix: Use ProjectNav + ProjectAppShell from canonical components.')
  console.error('💡 Nav schema: lib/navigation/projectNavSchema.ts\n')
  
  process.exit(1)
}

if (require.main === module) {
  main()
}

