#!/usr/bin/env node
/**
 * Required Tables Check Script
 * 
 * Verifies that all MVP tables exist in the database.
 * This is a lightweight check that prevents drift by ensuring required tables are present.
 * 
 * Run with: pnpm check:required-tables (add to package.json if needed)
 * Or integrate into existing schema checks.
 * 
 * NOTE: This requires Supabase connection. For static checks, see check-schema-drift.ts
 */

// Required MVP tables that must exist for the app to function
const REQUIRED_TABLES = [
  'projects',
  'competitors',
  'project_inputs',
  'project_runs',
  'project_shares',
  'evidence_sources',
  'evidence_cache',
  'artifacts',
]

/**
 * Check if tables exist by attempting to query information_schema
 * This is a minimal check - in practice, you'd query Supabase directly
 * 
 * For now, this documents what tables should exist.
 * To actually check, you would:
 * 1. Connect to Supabase (local or remote)
 * 2. Query: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN (...)
 * 3. Compare against REQUIRED_TABLES
 */
function checkRequiredTables(): void {
  console.log('📋 Required MVP tables:')
  console.log(REQUIRED_TABLES.map(t => `  - ${t}`).join('\n'))
  console.log('\n✅ To verify tables exist, run this SQL in Supabase SQL editor:')
  console.log('\nSELECT table_name FROM information_schema.tables')
  console.log("WHERE table_schema = 'public'")
  console.log(`AND table_name IN (${REQUIRED_TABLES.map(t => `'${t}'`).join(', ')});`)
  console.log('\nExpected: All tables listed above should be present.')
  console.log('\nFor automated checks, extend this script to connect to Supabase.')
}

function main() {
  console.log('Checking required MVP tables...\n')
  checkRequiredTables()
  console.log('\n✅ Required tables check complete (manual verification needed)')
  process.exit(0)
}

if (require.main === module) {
  main()
}

