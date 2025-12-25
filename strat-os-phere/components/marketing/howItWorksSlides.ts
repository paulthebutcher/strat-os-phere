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
  stepNumber: number
  headline: string
  shortDescriptor?: string
  copy: string[]
  preview: React.ComponentType
  proofLine?: string
}

export const HOW_IT_WORKS_SLIDES: HowItWorksSlide[] = [
  {
    id: 'frame',
    stepNumber: 1,
    headline: 'Frame',
    shortDescriptor: 'Start with a real decision',
    copy: [
      `Start with a real decision — not a prompt.`,
      `Plinth works best when the question is explicit. You can start with a hunch, a competitor set, or a market tension you're trying to resolve.`,
    ],
    preview: FramePreview,
    proofLine: `We infer what to research from how you frame the decision — just like a strategy team would.`,
  },
  {
    id: 'scan',
    stepNumber: 2,
    headline: 'Scan',
    shortDescriptor: 'Gather public market signals',
    copy: [
      `Plinth gathers public market signals continuously.`,
      `We analyze pricing pages, documentation, reviews, changelogs, and positioning across competitors — focusing only on primary sources.`,
    ],
    preview: ScanPreview,
    proofLine: `Every claim is grounded in something you can open and inspect.`,
  },
  {
    id: 'weigh',
    stepNumber: 3,
    headline: 'Weigh',
    shortDescriptor: 'Score evidence by relevance',
    copy: [
      `Not all signals matter equally.`,
      `Plinth scores evidence based on consistency, coverage, and relevance — separating directional ideas from investment-ready calls.`,
    ],
    preview: WeighPreview,
    proofLine: `Confidence is explicit. Uncertainty is surfaced.`,
  },
  {
    id: 'decide',
    stepNumber: 4,
    headline: 'Decide',
    shortDescriptor: 'Get a defendable recommendation',
    copy: [
      `The output is a decision you can defend.`,
      `You get a single, prioritized recommendation when confidence is high — with clear boundaries on what would change the call.`,
    ],
    preview: DecidePreview,
    proofLine: `No dashboards. No guesswork. Just clarity.`,
  },
]

