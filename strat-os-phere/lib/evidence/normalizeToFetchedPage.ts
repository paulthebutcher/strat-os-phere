/**
 * Normalize ShortlistedPage to FetchedPage
 * Adds missing required fields (e.g., fromCache) with sensible defaults
 */

import type { FetchedPage } from './parallelFetch'
import type { ShortlistedPage } from './shortlist'

export function toFetchedPage(p: ShortlistedPage): FetchedPage {
  return {
    ...p,
    fromCache: false,
  }
}

