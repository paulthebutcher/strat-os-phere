'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signIn } from './actions'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setIsError(false)

    const result = await signIn(email)

    if (!result?.success) {
      setIsError(true)
      setMessage(
        result?.message ?? 'Unable to send magic link. Please try again.'
      )
    } else {
      setIsError(false)
      // In dev/preview, show canary info if present; otherwise show success message
      // Check if message contains canary info (server action sets this in dev/preview)
      if (result?.message && result.message.includes('canary=')) {
        setMessage(result.message)
      } else {
        setMessage('Check your email for the magic link!')
      }
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-semibold text-foreground">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send magic link'}
      </Button>
      {message && (
        <div className="space-y-1">
          <p
            className={`text-sm font-medium ${
              isError ? 'text-destructive' : 'text-primary'
            }`}
          >
            {message}
          </p>
          {isError && (
            <p className="text-xs text-muted-foreground">
              If this is a redirect URL error, check Supabase allowlist settings.
            </p>
          )}
        </div>
      )}
    </form>
  )
}

