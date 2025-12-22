/**
 * Prompt for generating PageSummary (Pass A - fast triage)
 */

import type { Message } from '@/lib/prompts/system'
import { PageSummarySchema } from '@/lib/evidence/pageSummary'

export function buildPageSummaryMessages(url: string, title: string | null, text: string): Message[] {
  // Truncate text to keep prompt small (first 2000 chars should be enough for triage)
  const truncatedText = text.slice(0, 2000)
  
  return [
    {
      role: 'system',
      content: `You are an analyst evaluating web pages for competitive research. Your job is to quickly assess a page and provide a structured summary.

Analyze the page and determine:
1. source_type: The type of page (pricing, docs, reviews, changelog, jobs, status, or other)
2. signals: 3-5 key claims or pieces of information from the page
3. coverage_score: 0-1 score for how much concrete, actionable information is present (higher = more useful)
4. recency_hint: Estimated recency (today, <30d, 30-90d, >90d, or unknown)
5. credibility_hint: Source credibility (official = from the company, third_party = independent review sites, community = forums/discussions)
6. recommended_for_deep_read: true if this page contains substantive information worth deep analysis

Be efficient and accurate. Focus on factual signals that would be useful for competitive analysis.`,
    },
    {
      role: 'user',
      content: `Analyze this page:

URL: ${url}
Title: ${title || 'N/A'}

Content:
${truncatedText}

${truncatedText.length < text.length ? `\n[Note: Content truncated to ${truncatedText.length} characters for triage]` : ''}

Provide a PageSummary JSON object.`,
    },
  ]
}

export const PAGE_SUMMARY_SCHEMA_SHAPE = {
  source_type: "one of: 'pricing' | 'docs' | 'reviews' | 'changelog' | 'jobs' | 'status' | 'other'",
  signals: 'array of 3-5 key claim strings',
  coverage_score: 'number 0-1',
  recency_hint: "one of: 'today' | '<30d' | '30-90d' | '>90d' | 'unknown'",
  credibility_hint: "one of: 'official' | 'third_party' | 'community'",
  recommended_for_deep_read: 'boolean',
}

