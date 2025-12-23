import { redirect } from 'next/navigation'
import type { SearchParams } from '@/lib/routing/searchParams'
import { isParamTruthy } from '@/lib/routing/searchParams'

/**
 * Legacy /projects/new route - redirects to canonical /new route
 * Preserves query parameters (e.g., ?onboarding=1)
 */
type PageProps = {
  searchParams?: SearchParams
}

export default async function NewProjectPage(props: PageProps) {
  const isGuidedMode = isParamTruthy(props.searchParams, 'onboarding')
  const redirectUrl = isGuidedMode ? '/new?onboarding=1' : '/new'
  redirect(redirectUrl)
}


