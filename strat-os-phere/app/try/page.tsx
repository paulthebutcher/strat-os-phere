import { redirect } from 'next/navigation'

/**
 * Legacy /try route - redirects to canonical /new route
 */
export default function TryPage() {
  redirect('/new')
}
