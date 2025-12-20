import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/auth/callback/route'
import { NextRequest, NextResponse } from 'next/server'

// Mock Supabase SSR
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      exchangeCodeForSession: vi.fn(),
      verifyOtp: vi.fn(),
    },
  })),
}))

// Mock cookie options
vi.mock('@/lib/supabase/cookie-options', () => ({
  mergeAuthCookieOptions: vi.fn((opts) => opts),
}))

describe('Auth Callback Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to login when code exchange fails', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    const mockExchange = vi.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid code', code: 'invalid_code' },
    })
    ;(createServerClient as any).mockReturnValue({
      auth: {
        exchangeCodeForSession: mockExchange,
      },
    })

    const url = new URL('http://localhost/auth/callback?code=test-code')
    const request = new NextRequest(url)

    const response = await GET(request)

    expect(response.status).toBe(307) // Redirect
    const location = response.headers.get('location')
    expect(location).toContain('/login')
    expect(location).toContain('error=auth-code-exchange-failed')
  })

  it('redirects to /dashboard on successful code exchange', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    const mockExchange = vi.fn().mockResolvedValue({
      data: {
        user: { id: 'user-123', email: 'test@example.com' },
        session: { access_token: 'token' },
      },
      error: null,
    })
    ;(createServerClient as any).mockReturnValue({
      auth: {
        exchangeCodeForSession: mockExchange,
      },
    })

    const url = new URL('http://localhost/auth/callback?code=valid-code')
    const request = new NextRequest(url)

    const response = await GET(request)

    expect(response.status).toBe(307)
    const location = response.headers.get('location')
    expect(location).toContain('/dashboard')
  })

  it('redirects to login when missing auth parameters', async () => {
    const url = new URL('http://localhost/auth/callback')
    const request = new NextRequest(url)

    const response = await GET(request)

    expect(response.status).toBe(307)
    const location = response.headers.get('location')
    expect(location).toContain('/login')
    expect(location).toContain('error=missing_params')
  })

  it('uses custom next parameter when provided', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    const mockExchange = vi.fn().mockResolvedValue({
      data: {
        user: { id: 'user-123' },
        session: { access_token: 'token' },
      },
      error: null,
    })
    ;(createServerClient as any).mockReturnValue({
      auth: {
        exchangeCodeForSession: mockExchange,
      },
    })

    const url = new URL('http://localhost/auth/callback?code=valid&next=/projects/123')
    const request = new NextRequest(url)

    const response = await GET(request)

    expect(response.status).toBe(307)
    const location = response.headers.get('location')
    expect(location).toContain('/projects/123')
  })

  it('sanitizes next parameter to prevent open redirects', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    const mockExchange = vi.fn().mockResolvedValue({
      data: {
        user: { id: 'user-123' },
        session: { access_token: 'token' },
      },
      error: null,
    })
    ;(createServerClient as any).mockReturnValue({
      auth: {
        exchangeCodeForSession: mockExchange,
      },
    })

    // Try to inject an external URL
    const url = new URL('http://localhost/auth/callback?code=valid&next=http://evil.com')
    const request = new NextRequest(url)

    const response = await GET(request)

    expect(response.status).toBe(307)
    const location = response.headers.get('location')
    // Should default to /dashboard, not use the external URL
    expect(location).toContain('/dashboard')
    expect(location).not.toContain('evil.com')
  })
})

