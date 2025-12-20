import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/supabase/database.types'
import { cookies } from 'next/headers'

/**
 * E2E test helper route to create a fake session for testing.
 * ONLY available when E2E_TEST_MODE=true AND NODE_ENV !== 'production'
 * 
 * Usage in Playwright:
 * await page.request.post('/api/e2e/login', { data: { userId: 'test-user-123' } })
 */
export async function POST(request: Request) {
  // Security: Only allow in non-production when E2E_TEST_MODE is enabled
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  if (process.env.E2E_TEST_MODE !== 'true') {
    return NextResponse.json({ error: 'E2E test mode not enabled' }, { status: 403 })
  }

  try {
    const { userId } = await request.json()
    
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const cookieStore = await cookies()

    // Create a Supabase client that will set session cookies
    // In E2E tests, we'll bypass actual auth and just set mock cookies
    // This is safe because it only works in test mode
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                httpOnly: true,
                secure: false, // Allow http in test
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 7 days
              })
            })
          },
        },
      }
    )

    // In a real implementation, you might want to create an actual test user session
    // For now, we'll set a mock session cookie that the middleware will recognize
    // This is a simplified version - you may need to adjust based on your auth setup
    
    // Set a mock access token cookie that identifies the user
    cookieStore.set('sb-mock-access-token', userId, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return NextResponse.json({ 
      success: true, 
      userId,
      message: 'Mock session created (E2E test mode only)' 
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

