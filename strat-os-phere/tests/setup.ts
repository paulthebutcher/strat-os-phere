import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Next.js router
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation')
  return {
    ...actual,
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
  }
})

// Mock next/headers
vi.mock('next/headers', async () => {
  const actual = await vi.importActual('next/headers')
  return {
    ...actual,
    cookies: vi.fn(() => ({
      get: vi.fn(),
      getAll: vi.fn(() => []),
      set: vi.fn(),
      delete: vi.fn(),
      has: vi.fn(),
    })),
    headers: vi.fn(() => ({
      get: vi.fn(),
      getAll: vi.fn(),
      has: vi.fn(),
    })),
  }
})

