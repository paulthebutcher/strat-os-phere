/**
 * How It Works Slides Data
 * 
 * NOTE: Use template literals (backticks) for copy to avoid apostrophe parsing errors.
 * This prevents issues when copy contains contractions like "you're", "we're", etc.
 */

import { FramePreview } from './previews/FramePreview'
import { ScanPreview } from './previews/ScanPreview'
import { WeighPreview } from './previews/WeighPreview'
import { DecidePreview } from './previews/DecidePreview'

export type HowItWorksSlide = {
  id: string
  headline: string
  copy: string[]
  preview: React.ComponentType
}

export const HOW_IT_WORKS_SLIDES: HowItWorksSlide[] = [
  {
    id: 'frame',
    headline: 'Frame',
    copy: [
      `Start with a real decision — not a prompt.`,
      `Plinth works best when the question is explicit. You can start with a hunch, a competitor set, or a market tension you're trying to resolve.`,
      `We infer what to research from how you frame the decision — just like a strategy team would.`,
    ],
    preview: FramePreview,
  },
  {
    id: 'scan',
    headline: 'Scan',
    copy: [
      `Plinth gathers public market signals continuously.`,
      `We analyze pricing pages, documentation, reviews, changelogs, and positioning across competitors — focusing only on primary sources.`,
      `Every claim is grounded in something you can open and inspect.`,
    ],
    preview: ScanPreview,
  },
  {
    id: 'weigh',
    headline: 'Weigh',
    copy: [
      `Not all signals matter equally.`,
      `Plinth scores evidence based on consistency, coverage, and relevance — separating directional ideas from investment-ready calls.`,
      `Confidence is explicit, and uncertainty is surfaced instead of hidden.`,
    ],
    preview: WeighPreview,
  },
  {
    id: 'decide',
    headline: 'Decide',
    copy: [
      `The output is a decision you can defend.`,
      `You get a single, prioritized recommendation when confidence is high — with clear boundaries on what would change the call.`,
      `No dashboards. No guesswork. Just clarity.`,
    ],
    preview: DecidePreview,
  },
]

