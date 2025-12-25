import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shouldRunGuestAuthContractTests } from '@/lib/test/gates'

const describeIf = shouldRunGuestAuthContractTests ? describe : describe.skip

describeIf('Guest auth contract: onboardingRouteGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have onboarding route guard helper available when gate is enabled', async () => {
    // Dynamic import to handle case where helper doesn't exist yet
    // Try common locations for route guard logic
    let mod: any
    let found = false

    // Try lib/auth/onboardingRouteGuard
    try {
      const importFn = new Function('specifier', 'return import(specifier)')
      // @ts-expect-error - Module may not exist yet (parallel PR)
      mod = await importFn('@/lib/auth/onboardingRouteGuard')
      found = true
    } catch (e) {
      // Try alternative location
      try {
        mod = await import('@/lib/supabase/middleware')
        // Check if it exports a function that handles onboarding routes
        if (mod.isOnboardingRoute || mod.shouldAllowOnboardingRoute) {
          found = true
        }
      } catch (e2) {
        // Module doesn't exist yet - that's okay, test will be skipped
      }
    }

    if (!found) {
      // If gate is enabled but module doesn't exist, provide helpful error
      throw new Error(
        'onboardingRouteGuard helper not found. Expected at @/lib/auth/onboardingRouteGuard or exported from @/lib/supabase/middleware. Merge the anonymous auth PR first.'
      )
    }

    expect(mod).toBeDefined()
  })

  it('should allow access to /new route without authentication', async () => {
    // Test the middleware's updateSession function behavior
    const { updateSession } = await import('@/lib/supabase/middleware')

    // Mock NextRequest
    const mockRequest = {
      nextUrl: {
        pathname: '/new',
        clone: vi.fn().mockReturnValue({
          pathname: '/new',
          search: '',
        }),
      },
      cookies: {
        getAll: vi.fn().mockReturnValue([]),
      },
    } as any

    // Mock Supabase client
    vi.mock('@supabase/ssr', () => ({
      createServerClient: vi.fn(() => ({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      })),
    }))

    // Mock environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

    // Contract: /new should be accessible without auth
    const response = await updateSession(mockRequest)

    // Should not redirect to login
    expect(response.status).not.toBe(307)
    const location = response.headers?.get('location')
    expect(location).not.toContain('/login')
  })

  it('should allow access to /new/step-1 route without authentication', async () => {
    const { updateSession } = await import('@/lib/supabase/middleware')

    const mockRequest = {
      nextUrl: {
        pathname: '/new/step-1',
        clone: vi.fn().mockReturnValue({
          pathname: '/new/step-1',
          search: '',
        }),
      },
      cookies: {
        getAll: vi.fn().mockReturnValue([]),
      },
    } as any

    vi.mock('@supabase/ssr', () => ({
      createServerClient: vi.fn(() => ({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      })),
    }))

    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

    // Contract: /new/step-1 should be accessible without auth
    const response = await updateSession(mockRequest)

    // Should not redirect to login
    expect(response.status).not.toBe(307)
    const location = response.headers?.get('location')
    expect(location).not.toContain('/login')
  })

  it('should allow access to routes starting with /new without authentication', async () => {
    const { updateSession } = await import('@/lib/supabase/middleware')

    const mockRequest = {
      nextUrl: {
        pathname: '/new/step-2',
        clone: vi.fn().mockReturnValue({
          pathname: '/new/step-2',
          search: '',
        }),
      },
      cookies: {
        getAll: vi.fn().mockReturnValue([]),
      },
    } as any

    vi.mock('@supabase/ssr', () => ({
      createServerClient: vi.fn(() => ({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      })),
    }))

    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

    // Contract: any route starting with /new should be accessible
    const response = await updateSession(mockRequest)

    // Should not redirect to login
    expect(response.status).not.toBe(307)
    const location = response.headers?.get('location')
    expect(location).not.toContain('/login')
  })
})

