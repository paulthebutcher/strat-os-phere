// Prompt builder for repairing invalid JSON outputs for CompetitorSnapshot and MarketSynthesis.
// Used when the Mode A competitive analysis pipeline needs to coerce malformed model output into valid JSON.

import type { Message } from '@/lib/prompts/system'
import { getSystemStyleGuide } from '@/lib/prompts/system'

export type RepairableSchemaName =
  | 'CompetitorSnapshot'
  | 'MarketSynthesis'
  | 'JtbdArtifactContent'
  | 'OpportunitiesArtifactContent'
  | 'ScoringMatrixArtifactContent'
  | 'StrategicBetsArtifactContent'

export interface RepairPromptParams {
  rawText: string
  schemaName: RepairableSchemaName
  schemaShapeText: string
  validationErrors?: string
}

export function buildRepairMessages(params: RepairPromptParams): Message[] {
  const { rawText, schemaName, schemaShapeText, validationErrors } = params

  const lines: string[] = [
    'TASK',
    `You previously attempted to return a ${schemaName} JSON object, but the JSON was invalid or did not match the required schema. Fix it.`,
    '',
    'REQUIRED SCHEMA SHAPE',
    'Your fixed response must be a single JSON object that matches this schema shape exactly (keys and nesting must match):',
    schemaShapeText,
    '',
    'ORIGINAL RAW MODEL OUTPUT',
    'The text between RAW_OUTPUT_START and RAW_OUTPUT_END is what you previously returned.',
    'RAW_OUTPUT_START',
    rawText,
    'RAW_OUTPUT_END',
  ]

  if (validationErrors && validationErrors.trim().length > 0) {
    lines.push(
      '',
      'VALIDATION ERRORS',
      'These are hints from validation to guide your repair. Use them to adjust structure and types, but do not invent new substantive content:',
      validationErrors,
    )
  }

  lines.push(
    '',
    'REPAIR INSTRUCTIONS',
    '1) Preserve as much of the original substantive content as possible (claims, opportunities, angles, etc.).',
    '2) Fix JSON syntax issues (quoting, commas, brackets) so the result is valid JSON.',
    '3) Restructure or rename fields only as needed to match the required schema keys and nesting.',
    '4) Remove any commentary, markdown, code fences, backticks, or extra text outside the JSON object.',
    '5) Do not invent new factual information. If something is unclear, express the uncertainty in the appropriate risk or unknown fields (for example, risks_and_unknowns, risk_or_assumption, watch_out_for).',
    '6) Ensure the top-level value is a single JSON object matching the schema, not an array or a string.',
    '7) Use only keys that exist in the schema shape provided. Do not add extra keys.',
    '8) Your entire reply must be just the repaired JSON object, with no prose before or after.',
  )

  const userContent = lines.join('\n')

  return [getSystemStyleGuide(), { role: 'user', content: userContent }]
}


