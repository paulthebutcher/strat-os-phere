/**
 * Follow-up question types
 * One smart question to clarify uncertainty/gaps/conflicts in evidence
 */

export type FollowUpInputType = 'free_text' | 'single_select'

export interface FollowUpQuestion {
  schema_version: 1
  generatedAt: string
  question: string
  rationale: string // short "why we're asking"
  options?: string[] // optional multiple choice
  inputType: FollowUpInputType
  derivedFrom: {
    gaps?: string[]
    conflicts?: string[]
    lowConfidenceAreas?: string[]
  }
}

export interface FollowUpAnswer {
  questionId?: string // Optional: link back to question
  answer: string
  answeredAt: string
}

