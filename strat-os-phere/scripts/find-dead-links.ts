#!/usr/bin/env tsx
/**
 * Find dead links in the codebase
 * Scans for href="#", empty hrefs, or router.push('')
 * 
 * Usage: npm run lint:deadlinks
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

interface DeadLink {
  file: string
  line: number
  content: string
  type: 'empty-hash' | 'empty-href' | 'empty-router-push' | 'todo-link'
}

const DEAD_LINK_PATTERNS = [
  {
    pattern: /href=["']#["']/g,
    type: 'empty-hash' as const,
    description: 'href="#"',
  },
  {
    pattern: /href=["']\s*["']/g,
    type: 'empty-href' as const,
    description: 'empty href',
  },
  {
    pattern: /router\.push\(["']\s*["']\)/g,
    type: 'empty-router-push' as const,
    description: 'router.push("")',
  },
  {
    pattern: /router\.push\(["']#["']\)/g,
    type: 'empty-router-push' as const,
    description: 'router.push("#")',
  },
  {
    pattern: /href=["']#\w+["']/g,
    type: 'todo-link' as const,
    description: 'hash link (may be placeholder)',
  },
]

const IGNORE_PATTERNS = [
  /node_modules/,
  /\.next/,
  /\.git/,
  /dist/,
  /build/,
  /coverage/,
  /tests\/mocks/,
  /\.test\./,
  /\.spec\./,
]

const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx']

function shouldIgnoreFile(filePath: string): boolean {
  return IGNORE_PATTERNS.some((pattern) => pattern.test(filePath))
}

function shouldProcessFile(filePath: string): boolean {
  const ext = extname(filePath)
  return FILE_EXTENSIONS.includes(ext)
}

function findDeadLinksInFile(filePath: string): DeadLink[] {
  const content = readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const deadLinks: DeadLink[] = []

  lines.forEach((line, index) => {
    DEAD_LINK_PATTERNS.forEach(({ pattern, type }) => {
      const matches = line.matchAll(pattern)
      for (const match of matches) {
        // Skip if it's in a comment
        const beforeMatch = line.substring(0, match.index)
        if (beforeMatch.includes('//') || beforeMatch.includes('/*')) {
          return
        }

        deadLinks.push({
          file: filePath,
          line: index + 1,
          content: line.trim(),
          type,
        })
      }
    })
  })

  return deadLinks
}

function scanDirectory(dir: string): DeadLink[] {
  const deadLinks: DeadLink[] = []

  try {
    const entries = readdirSync(dir)

    for (const entry of entries) {
      const fullPath = join(dir, entry)

      if (shouldIgnoreFile(fullPath)) {
        continue
      }

      const stat = statSync(fullPath)

      if (stat.isDirectory()) {
        deadLinks.push(...scanDirectory(fullPath))
      } else if (stat.isFile() && shouldProcessFile(fullPath)) {
        deadLinks.push(...findDeadLinksInFile(fullPath))
      }
    }
  } catch (error) {
    // Ignore permission errors
  }

  return deadLinks
}

function main() {
  const projectRoot = process.cwd()
  const srcDir = join(projectRoot, 'strat-os-phere')
  const appDir = join(srcDir, 'app')
  const componentsDir = join(srcDir, 'components')

  console.log('Scanning for dead links...\n')

  const deadLinks: DeadLink[] = []

  // Scan app directory
  if (statSync(appDir).isDirectory()) {
    deadLinks.push(...scanDirectory(appDir))
  }

  // Scan components directory
  if (statSync(componentsDir).isDirectory()) {
    deadLinks.push(...scanDirectory(componentsDir))
  }

  // Group by type
  const byType = deadLinks.reduce(
    (acc, link) => {
      if (!acc[link.type]) {
        acc[link.type] = []
      }
      acc[link.type].push(link)
      return acc
    },
    {} as Record<string, DeadLink[]>
  )

  // Print report
  if (deadLinks.length === 0) {
    console.log('✓ No dead links found!')
    process.exit(0)
  }

  console.log(`Found ${deadLinks.length} potential dead link(s):\n`)

  Object.entries(byType).forEach(([type, links]) => {
    console.log(`${type.toUpperCase()} (${links.length}):`)
    links.forEach((link) => {
      const relativePath = link.file.replace(projectRoot, '').replace(/^\//, '')
      console.log(`  ${relativePath}:${link.line}`)
      console.log(`    ${link.content.substring(0, 80)}${link.content.length > 80 ? '...' : ''}`)
    })
    console.log()
  })

  console.log('\nNote: Some of these may be intentional (e.g., anchor links, placeholders).')
  console.log('Review each case to determine if it needs fixing.\n')

  process.exit(1)
}

main()

