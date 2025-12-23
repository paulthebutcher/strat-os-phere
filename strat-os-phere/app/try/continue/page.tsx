import { redirect } from 'next/navigation'

/**
 * Legacy /try/continue route - redirects to canonical /new route
 * The new flow handles draft persistence automatically via localStorage
 */
export default async function TryContinuePage() {
  redirect('/new')
}

