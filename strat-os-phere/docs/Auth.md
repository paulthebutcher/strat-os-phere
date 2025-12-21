# Authentication Configuration

This document describes the authentication setup for Plinth, including Supabase magic link authentication and 7-day session persistence.

## Session Persistence

Plinth implements **7-day session persistence** for authenticated users. After signing in via magic link, users remain logged in for 7 days without needing another magic link, as long as they return within that window.

### How It Works

1. **Initial Login**: When a user clicks a magic link, the auth callback (`/app/auth/callback/route.ts`) exchanges the code for a session and sets cookies with a `maxAge` of 7 days (604,800 seconds).

2. **Cookie Configuration**: All Supabase auth cookies are set with:
   - `httpOnly: true` - Prevents JavaScript access for security
   - `secure: true` - HTTPS only in production (localhost works in development)
   - `sameSite: "lax"` - CSRF protection
   - `path: "/"` - Available across the entire app
   - `maxAge: 604800` - 7 days in seconds

3. **Automatic Token Refresh**: The middleware (`/lib/supabase/middleware.ts`) runs on every request and:
   - Calls `supabase.auth.getUser()` which automatically refreshes tokens when needed
   - Updates cookies with refreshed tokens, maintaining the 7-day maxAge
   - Ensures users stay logged in as long as they visit within 7 days

4. **Cookie Setting Locations**: Cookies are set with proper maxAge in:
   - `/app/auth/callback/route.ts` - Initial login
   - `/lib/supabase/middleware.ts` - Token refresh on subsequent requests
   - `/lib/supabase/server.ts` - Server-side client creation

## Supabase Project Settings

### JWT Expiry

The Supabase **JWT expiry** setting can remain at its default value (typically 1 hour). This controls how long the access token is valid, not the session duration. The session persists via refresh tokens stored in cookies with a 7-day maxAge.

**Recommended**: Leave JWT expiry at default (1 hour). Our middleware automatically refreshes tokens before they expire.

### Session Timeout

Supabase does not have a separate "session timeout" setting that would override our 7-day cookie configuration. The session duration is controlled by:

1. Our cookie `maxAge` setting (7 days)
2. The refresh token expiry (typically 30 days by default in Supabase)

**Important**: As long as users return within 7 days, their session will be refreshed and extended. If they don't return for more than 7 days, they'll need to sign in again.

### Configuration Check

To verify your Supabase project settings:

1. Go to your Supabase Dashboard → Authentication → Settings
2. Check **JWT expiry** - should be default (1 hour is fine)
3. Check **Refresh token rotation** - can be enabled or disabled (doesn't affect our 7-day persistence)
4. No other settings need to be changed

## Testing Session Persistence

### Manual Testing

1. **Sign in** via magic link
2. **Verify cookies** in browser DevTools:
   - Open Application/Storage → Cookies
   - Look for cookies starting with `sb-` or containing `auth`
   - Check that `Max-Age` or `Expires` is approximately 7 days from now
3. **Close browser completely** (not just the tab)
4. **Reopen browser** and navigate to the app
5. **Verify** you're still logged in (should redirect to `/dashboard` if on `/login`)

### Dev-Only Debug Utility

In development, the middleware logs session information on every request:

```typescript
[middleware] {
  path: '/dashboard',
  authed: true,
  userId: '...',
  sessionExpiry: '2024-01-08T12:00:00.000Z',
  cookieCount: 3,
  cookieNames: ['sb-xxx-auth-token', 'sb-xxx-auth-token-code-verifier', ...]
}
```

You can also use the `getSessionDebugInfo()` utility from `/lib/supabase/session-debug.ts` in server components (dev-only):

```typescript
import { getSessionDebugInfo } from '@/lib/supabase/session-debug'

const debugInfo = await getSessionDebugInfo()
// Returns session expiry, cookie maxAge, refresh status, etc.
```

### Automated Testing

To test programmatically:

1. Sign in and capture cookies
2. Wait or manipulate cookie expiry
3. Make a request and verify session is still valid
4. Verify cookies are refreshed with new maxAge

## Environment-Agnostic Configuration

The authentication system works across all environments without separate `.env` files and **does not rely on `NEXT_PUBLIC_SITE_URL`**:

- **Local Development**: `secure: false` allows cookies on `localhost`
- **Vercel Preview**: Uses `x-forwarded-host` and `x-forwarded-proto` headers
- **Vercel Production**: Same as preview, with `secure: true` for HTTPS
- **Custom Staging Domains**: Automatically detected from request headers

The `getOrigin()` helper in `/lib/server/origin.ts` handles environment detection automatically by:
1. Preferring `x-forwarded-proto` and `x-forwarded-host` headers (set by Vercel)
2. Falling back to the `host` header if forwarded headers aren't available
3. Using `https` on Vercel deployments, `http` otherwise
4. Only falling back to `localhost:3000` in development if no headers are present

**Important**: Origin is always computed from request headers. The Supabase Site URL setting in the Supabase dashboard should remain set to production (e.g., `https://myplinth.com`), but magic links will use the correct origin based on where the login request originated.

## Troubleshooting

### Users getting logged out unexpectedly

1. Check cookie `maxAge` in browser DevTools - should be ~604800 seconds
2. Check middleware logs (dev) - verify `getUser()` is succeeding
3. Verify Supabase project settings haven't changed
4. Check that cookies aren't being blocked by browser settings

### Cookies not persisting

1. Verify `secure: true` only in production (localhost needs `secure: false`)
2. Check browser console for cookie errors
3. Verify `sameSite: "lax"` isn't being blocked by browser
4. Check that cookies are being set on response (not request)

### Token refresh not working

1. Verify middleware is running (check logs)
2. Check that `supabase.auth.getUser()` is being called
3. Verify cookies are being updated with new maxAge on refresh
4. Check Supabase project hasn't disabled refresh tokens

