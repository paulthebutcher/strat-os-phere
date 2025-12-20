import { NextResponse } from 'next/server'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

/**
 * Debug endpoint to check installed Supabase package versions at runtime.
 * Returns the versions of @supabase/supabase-js and @supabase/ssr.
 */
export async function GET() {
  try {
    // Use createRequire to safely read package.json in Node runtime
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const require = createRequire(import.meta.url)
    
    // Resolve package.json files from node_modules
    // Start from the project root (go up from app/api/supabase-version)
    const projectRoot = join(__dirname, '../../..')
    const supabaseJsPath = require.resolve('@supabase/supabase-js/package.json', { paths: [projectRoot] })
    const supabaseSsrPath = require.resolve('@supabase/ssr/package.json', { paths: [projectRoot] })
    
    // Read package.json files
    const supabaseJsPkg = require(supabaseJsPath)
    const supabaseSsrPkg = require(supabaseSsrPath)
    
    return NextResponse.json({
      '@supabase/supabase-js': supabaseJsPkg.version,
      '@supabase/ssr': supabaseSsrPkg.version,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to read package versions',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

