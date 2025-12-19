'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import type { TypedSupabaseClient } from './types'

export function createClient(): TypedSupabaseClient {
  // Cast to SupabaseClient<Database> to preserve type information
  // The @supabase/ssr return type is compatible but doesn't preserve the generic
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ) as SupabaseClient<Database>
}

