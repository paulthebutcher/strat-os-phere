#!/usr/bin/env tsx
/**
 * PR3: CLI script to harvest evidence using Tavily
 * 
 * Usage:
 *   pnpm harvest:evidence --company "Monday" --url "https://monday.com" --context "..." --out ./tmp/evidence.json
 */

import { writeFile, mkdir } from 'fs/promises'
import { dirname } from 'path'
import { harvestEvidence } from '../lib/evidence/harvestEvidence'
import type { HarvestEvidenceType } from '../lib/evidence/types'

interface Args {
  company?: string
  url?: string
  context?: string
  limit?: string
  types?: string
  out?: string
}

function parseArgs(): Args {
  const args: Args = {}
  const argv = process.argv.slice(2)

  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i]
    const value = argv[i + 1]

    if (key === '--company') {
      args.company = value
    } else if (key === '--url') {
      args.url = value
    } else if (key === '--context') {
      args.context = value
    } else if (key === '--limit') {
      args.limit = value
    } else if (key === '--types') {
      args.types = value
    } else if (key === '--out') {
      args.out = value
    }
  }

  return args
}

function parseTypes(typesStr?: string): HarvestEvidenceType[] | undefined {
  if (!typesStr) return undefined
  const validTypes: HarvestEvidenceType[] = [
    'official_site',
    'pricing',
    'docs',
    'changelog',
    'status',
    'reviews',
    'jobs',
    'integrations',
    'security_trust',
    'community',
  ]
  const requested = typesStr.split(',').map((t) => t.trim())
  const filtered = requested.filter((t) =>
    validTypes.includes(t as HarvestEvidenceType)
  ) as HarvestEvidenceType[]
  return filtered.length > 0 ? filtered : undefined
}

async function main() {
  const args = parseArgs()

  if (!args.company) {
    console.error('Error: --company is required')
    console.error(
      'Usage: pnpm harvest:evidence --company "CompanyName" [--url URL] [--context "..."] [--limit N] [--types type1,type2] [--out path]'
    )
    process.exit(1)
  }

  const limitPerType = args.limit ? parseInt(args.limit, 10) : 5
  if (isNaN(limitPerType) || limitPerType < 1) {
    console.error('Error: --limit must be a positive number')
    process.exit(1)
  }

  const includeTypes = parseTypes(args.types)

  console.log('Harvesting evidence...')
  console.log(`  Company: ${args.company}`)
  if (args.url) console.log(`  URL: ${args.url}`)
  if (args.context) console.log(`  Context: ${args.context.substring(0, 60)}...`)
  console.log(`  Limit per type: ${limitPerType}`)
  if (includeTypes) {
    console.log(`  Types: ${includeTypes.join(', ')}`)
  }
  console.log()

  try {
    const bundle = await harvestEvidence({
      company: args.company,
      url: args.url,
      context: args.context,
      limitPerType,
      includeTypes,
    })

    // Print summary
    console.log('Harvest complete!')
    console.log()
    console.log('Summary:')
    console.log(`  Total sources: ${bundle.totals.sources}`)
    console.log(`  Unique URLs: ${bundle.totals.uniqueUrls}`)
    console.log(`  Unique domains: ${bundle.totals.uniqueDomains}`)
    console.log()
    console.log('By type:')
    for (const group of bundle.groups) {
      if (group.sources.length > 0) {
        console.log(
          `  ${group.type}: ${group.sources.length} sources (${group.stats.uniqueDomains} domains)`
        )
      }
    }
    console.log()

    // Top domains
    const domainCounts = new Map<string, number>()
    for (const group of bundle.groups) {
      for (const source of group.sources) {
        const domain = source.domain.toLowerCase()
        domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1)
      }
    }
    const topDomains = Array.from(domainCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
    if (topDomains.length > 0) {
      console.log('Top domains:')
      for (const [domain, count] of topDomains) {
        console.log(`  ${domain}: ${count} sources`)
      }
      console.log()
    }

    // Write JSON
    const outputPath = args.out || './tmp/evidence-bundle.json'
    const outputDir = dirname(outputPath)

    try {
      await mkdir(outputDir, { recursive: true })
    } catch (error) {
      // Directory might already exist, ignore
    }

    await writeFile(outputPath, JSON.stringify(bundle, null, 2), 'utf-8')
    console.log(`✓ Evidence bundle written to: ${outputPath}`)
  } catch (error) {
    console.error('Error harvesting evidence:', error)
    if (error instanceof Error) {
      console.error(error.message)
      if (error.stack) {
        console.error(error.stack)
      }
    }
    process.exit(1)
  }
}

main()

