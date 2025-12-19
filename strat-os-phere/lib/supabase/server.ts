import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import type { TypedSupabaseClient } from './types'
import { mergeAuthCookieOptions } from './cookie-options'

export async function createClient(): Promise<TypedSupabaseClient> {
  const cookieStore = await cookies()

  // Cast to SupabaseClient<Database> to preserve type information
  // The @supabase/ssr return type is compatible but doesn't preserve the generic
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Merge with our auth cookie options to ensure 7-day maxAge
              const mergedOptions = mergeAuthCookieOptions(options)
              cookieStore.set(name, value, mergedOptions)
            })
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  ) as SupabaseClient<Database>
}

