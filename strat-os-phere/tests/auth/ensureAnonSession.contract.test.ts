import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shouldRunGuestAuthContractTests } from '@/lib/test/gates'

const describeIf = shouldRunGuestAuthContractTests ? describe : describe.skip

describeIf('Guest auth contract: ensureAnonSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have ensureAnonSession module available when gate is enabled', async () => {
    // Dynamic import to handle case where implementation doesn't exist yet
    let mod: any
    try {
      // Use Function constructor to avoid Vite static analysis
      const importFn = new Function('specifier', 'return import(specifier)')
      // @ts-expect-error - Module may not exist yet (parallel PR)
      mod = await importFn('@/lib/auth/ensureAnonSession')
    } catch (e) {
      throw new Error(
        'ensureAnonSession module not found. Merge the anonymous auth PR first.'
      )
    }

    expect(mod).toBeDefined()
    expect(typeof mod.ensureAnonSession).toBe('function')
  })

  it('should not call signInAnonymously if session already exists', async () => {
    // Dynamic import
    let mod: any
    try {
      const importFn = new Function('specifier', 'return import(specifier)')
      // @ts-expect-error - Module may not exist yet (parallel PR)
      mod = await importFn('@/lib/auth/ensureAnonSession')
    } catch (e) {
      throw new Error(
        'ensureAnonSession module not found. Merge the anonymous auth PR first.'
      )
    }

    // Mock Supabase client
    const mockSignInAnonymously = vi.fn().mockResolvedValue({
      data: {
        user: { id: 'anon-user-123' },
        session: { access_token: 'anon-token' },
      },
      error: null,
    })

    const mockGetSession = vi.fn().mockResolvedValue({
      data: {
        session: {
          access_token: 'existing-token',
          user: { id: 'existing-user' },
        },
      },
      error: null,
    })

    const mockSupabase = {
      auth: {
        getSession: mockGetSession,
        signInAnonymously: mockSignInAnonymously,
      },
    }

    // Call ensureAnonSession with existing session
    const result = await mod.ensureAnonSession(mockSupabase)

    // Contract: should not call signInAnonymously when session exists
    expect(mockGetSession).toHaveBeenCalled()
    expect(mockSignInAnonymously).not.toHaveBeenCalled()
    expect(result).toBeDefined()
  })

  it('should call signInAnonymously once when session is missing', async () => {
    // Dynamic import
    let mod: any
    try {
      const importFn = new Function('specifier', 'return import(specifier)')
      // @ts-expect-error - Module may not exist yet (parallel PR)
      mod = await importFn('@/lib/auth/ensureAnonSession')
    } catch (e) {
      throw new Error(
        'ensureAnonSession module not found. Merge the anonymous auth PR first.'
      )
    }

    // Mock Supabase client
    const mockSignInAnonymously = vi.fn().mockResolvedValue({
      data: {
        user: { id: 'anon-user-123' },
        session: { access_token: 'anon-token' },
      },
      error: null,
    })

    const mockGetSession = vi.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    })

    const mockSupabase = {
      auth: {
        getSession: mockGetSession,
        signInAnonymously: mockSignInAnonymously,
      },
    }

    // Call ensureAnonSession without existing session
    const result = await mod.ensureAnonSession(mockSupabase)

    // Contract: should call signInAnonymously exactly once
    expect(mockGetSession).toHaveBeenCalled()
    expect(mockSignInAnonymously).toHaveBeenCalledTimes(1)
    expect(result).toBeDefined()
    expect(result.session).toBeDefined()
  })

  it('should return a session after calling signInAnonymously', async () => {
    // Dynamic import
    let mod: any
    try {
      const importFn = new Function('specifier', 'return import(specifier)')
      // @ts-expect-error - Module may not exist yet (parallel PR)
      mod = await importFn('@/lib/auth/ensureAnonSession')
    } catch (e) {
      throw new Error(
        'ensureAnonSession module not found. Merge the anonymous auth PR first.'
      )
    }

    const mockSession = {
      access_token: 'anon-token',
      user: { id: 'anon-user-123' },
    }

    const mockSignInAnonymously = vi.fn().mockResolvedValue({
      data: {
        user: mockSession.user,
        session: mockSession,
      },
      error: null,
    })

    const mockGetSession = vi.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    })

    const mockSupabase = {
      auth: {
        getSession: mockGetSession,
        signInAnonymously: mockSignInAnonymously,
      },
    }

    const result = await mod.ensureAnonSession(mockSupabase)

    // Contract: should return a session
    expect(result.session).toEqual(mockSession)
    expect(result.session.access_token).toBe('anon-token')
  })
})

