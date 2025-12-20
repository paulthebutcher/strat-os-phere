# Authentication

Magic link authentication with PKCE flow and 7-day session persistence.

## Magic Link PKCE Flow

1. **User enters email** → `signIn(email)` server action
2. **Server calls** `supabase.auth.signInWithOtp()` with `emailRedirectTo`
3. **Supabase sends email** with magic link containing `code` parameter
4. **User clicks link** → redirects to `/auth/callback?code=...`
5. **Callback exchanges code** → `supabase.auth.exchangeCodeForSession(code)`
6. **Session cookies set** with 7-day `maxAge`
7. **User redirected** to `/dashboard`

## Critical Implementation Notes

### signInWithOtp MUST Use SSR Client

The `signInWithOtp` call **must** use an SSR client wired to Next.js cookies so the PKCE verifier cookie is set:

```typescript
// ✅ CORRECT (app/login/actions.ts)
const cookieStore = await cookies()
const supabase = createServerClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) { /* set cookies */ },
    },
  }
)
await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo } })
```

**Why**: The PKCE verifier cookie (`sb-xxx-auth-token-code-verifier`) must be set server-side during the OTP request. Without it, `exchangeCodeForSession` will fail with `auth-code-exchange-failed`.

### PKCE Verifier Cookies Must NOT Have 7-Day maxAge

PKCE verifier cookies are short-lived (typically 10 minutes) for security. The `mergeAuthCookieOptions` function protects these cookies:

```typescript
// lib/supabase/cookie-options.ts
const isVerifierCookie = cookieName && (
  cookieName.includes('code-verifier') || 
  cookieName.includes('pkce')
)

if (isVerifierCookie) {
  // Do NOT override maxAge for verifier cookies
  return { ...existingOptions, maxAge: existingOptions?.maxAge }
}
```

**Why**: Verifier cookies should expire quickly after code exchange. Forcing 7-day maxAge would be a security risk.

### Callback Route Expectations

The callback route (`app/auth/callback/route.ts`) handles:

1. **PKCE flow** (`code` parameter):
   - Calls `exchangeCodeForSession(code)`
   - Requires verifier cookie to be present
   - Sets session cookies with 7-day maxAge

2. **Legacy OTP flow** (`token_hash` + `type` parameters):
   - Calls `verifyOtp({ token_hash, type })`
   - Sets session cookies with 7-day maxAge

3. **Redirect handling**:
   - Validates `next` parameter (must be relative path)
   - Defaults to `/dashboard`
   - Copies cookies to redirect response

### Middleware Route Protection

Middleware (`lib/supabase/middleware.ts`) enforces:

**Public routes** (always allowed):
- `/`, `/login`, `/auth/callback`
- `/api/*` (all API routes)

**Protected routes** (require auth):
- `/dashboard`, `/projects/*`

**Behavior**:
- Unauthenticated users on protected routes → redirect to `/login`
- Authenticated users on `/login` or `/` → redirect to `/dashboard`
- Session refresh happens automatically via `supabase.auth.getUser()`

## Supabase Dashboard Settings

### Site URL
Set to production domain: `https://myplinth.com`

**Note**: Magic links will use the correct origin based on where the login request originated (see origin handling below). The Site URL is only used as a fallback.

### Redirect URL Allowlist

Add patterns for all environments:

**Production**:
```
https://myplinth.com/auth/callback
```

**Staging** (if using custom domain):
```
https://staging.myplinth.com/auth/callback
```

**Preview** (Vercel):
```
https://*.vercel.app/auth/callback
```

**Local** (optional, for testing):
```
http://localhost:3000/auth/callback
```

## Origin Handling

Origin is **request-derived** and does not rely on `NEXT_PUBLIC_SITE_URL`:

1. **Vercel Preview/Production**: Uses `x-forwarded-host` + `x-forwarded-proto` headers
2. **Custom domains**: Uses `host` header + protocol detection
3. **Local dev**: Falls back to `http://localhost:3000` if no headers

See `lib/server/origin.ts` for implementation.

**Why**: Enables preview deployments to work without config changes. Each environment uses its own origin automatically.

## Known Failure Modes

### `auth-code-exchange-failed`

**Meaning**: PKCE verifier cookie missing or expired.

**Causes**:
- `signInWithOtp` not using SSR client (verifier cookie not set)
- Verifier cookie expired (typically 10 minutes)
- Browser blocking cookies

**Fix**:
1. Verify `signInWithOtp` uses SSR client (see `app/login/actions.ts`)
2. Check browser DevTools → Application → Cookies for verifier cookie
3. Ensure cookies not blocked by browser settings

### `redirect_to` Falling Back to Site URL

**Meaning**: Supabase redirect URL not in allowlist.

**Symptom**: Magic link redirects to production domain instead of preview/staging.

**Fix**:
1. Add redirect URL pattern to Supabase allowlist
2. For preview: `https://*.vercel.app/auth/callback`
3. For staging: `https://staging.myplinth.com/auth/callback`

### Session Expires Unexpectedly

**Meaning**: Cookie `maxAge` not set correctly.

**Causes**:
- Cookies set without `mergeAuthCookieOptions`
- PKCE verifier cookie forced to 7-day maxAge (should be short-lived)

**Fix**:
1. Verify `mergeAuthCookieOptions` applied in:
   - `app/auth/callback/route.ts`
   - `lib/supabase/middleware.ts`
   - `lib/supabase/server.ts`
2. Check cookie `maxAge` in browser DevTools (should be ~604800 for session cookies)
3. Ensure verifier cookies are NOT forced to 7-day maxAge

## Session Persistence

Sessions persist for **7 days** (604,800 seconds) via cookie `maxAge`:

- **Initial login**: Callback route sets cookies with 7-day maxAge
- **Token refresh**: Middleware refreshes tokens and maintains 7-day maxAge
- **Automatic refresh**: Supabase SDK refreshes tokens before expiry

**JWT expiry** (Supabase setting): Leave at default (1 hour). This controls access token validity, not session duration. Refresh tokens handle long-lived sessions.

## Testing Auth

### Manual Testing
1. Sign in via magic link
2. Check cookies in DevTools → Application → Cookies
3. Verify `maxAge` is ~604800 for session cookies
4. Close browser completely
5. Reopen and navigate to app
6. Should still be logged in

### Debug Utilities

**Dev-only session info** (`lib/supabase/session-debug.ts`):
```typescript
import { getSessionDebugInfo } from '@/lib/supabase/session-debug'
const info = await getSessionDebugInfo()
// Returns: session expiry, cookie maxAge, refresh status
```

**Debug endpoints**:
- `/api/whoami` - Check auth state
- `/api/debug/origin` - Inspect origin computation
