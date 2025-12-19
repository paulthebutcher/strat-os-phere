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
      setMessage('Check your email for the magic link!')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-text-primary">
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
        <p
          className={`text-sm ${
            isError ? 'text-danger' : 'text-accent-primary'
          }`}
        >
          {message}
        </p>
      )}
    </form>
  )
}

