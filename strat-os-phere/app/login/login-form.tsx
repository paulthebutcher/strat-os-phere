'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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

    if (result?.error) {
      setIsError(true)
      setMessage(result.error)
    } else if (result?.success) {
      setIsError(false)
      setMessage('Check your email for the magic link!')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="you@example.com"
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send magic link'}
      </Button>
      {message && (
        <p className={`text-sm ${isError ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </form>
  )
}

