// Prompt builder for evidence draft generation
// Used to generate structured evidence drafts from scraped web content

import type { Message } from '@/lib/prompts/system'
import { getSystemStyleGuide } from '@/lib/prompts/system'

export interface EvidencePromptInput {
  competitorName: string
  domain: string
  extractedContent: Array<{
    url: string
    text: string
    title?: string
    sourceType?: string
    confidence?: string | null
    dateRange?: string | null
  }>
}

export const EVIDENCE_DRAFT_SCHEMA_SHAPE = {
  competitor_name: 'string',
  domain: 'string',
  sections: {
    positioning: {
      bullets: ['string'],
      sources: ['string'], // URLs
    },
    pricing: {
      bullets: ['string'],
      sources: ['string'],
    },
    target_customers: {
      bullets: ['string'],
      sources: ['string'],
    },
    key_features: {
      bullets: ['string'],
      sources: ['string'],
    },
    integrations: {
      bullets: ['string'],
      sources: ['string'],
    },
    enterprise_signals: {
      bullets: ['string'],
      sources: ['string'],
    },
  },
} as const

function stringifySchemaForPrompt(schemaShape: unknown): string {
  return JSON.stringify(schemaShape, null, 2)
}

export function buildEvidenceMessages(input: EvidencePromptInput): Message[] {
  const { competitorName, domain, extractedContent } = input

  // Build content sections from extracted pages with source type metadata
  const contentSections = extractedContent
    .map((content, index) => {
      const sourceType = content.sourceType || 'marketing_site'
      const sourceTypeLabel = sourceType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      const lines = [
        `SOURCE ${index + 1}: ${content.url}`,
        content.title ? `Title: ${content.title}` : '',
        `Source Type: ${sourceTypeLabel}`,
        content.dateRange ? `Date Range: ${content.dateRange}` : '',
        content.confidence ? `Confidence: ${content.confidence}` : '',
        'Content:',
        content.text,
        '',
      ]
      return lines.filter(Boolean).join('\n')
    })
    .join('\n---\n\n')

  const userContent = [
    'TASK',
    'Analyze the scraped web content for this competitor and produce a structured EvidenceDraft JSON object.',
    'Each section must be supported by specific evidence from the provided sources, with source URLs cited.',
    '',
    'COMPETITOR',
    `Name: ${competitorName}`,
    `Domain: ${domain}`,
    '',
    'SCRAPED CONTENT',
    'The following content was extracted from public web pages. Use only this content as your source of truth.',
    'Each source is labeled with its URL, source type, and metadata. Cite these URLs in the sources arrays.',
    '',
    'SOURCE TYPE HIERARCHY (prefer higher-signal sources when conflicts exist):',
    '1. reviews - Real user feedback (highest signal for actual experience)',
    '2. pricing - Actual pricing constraints and plans',
    '3. changelog - Recent product changes and updates',
    '4. jobs - Hiring signals (what they\'re building)',
    '5. docs - Technical documentation (what\'s actually available)',
    '6. status - Service status and reliability signals',
    '7. marketing_site - Marketing claims (lowest signal, verify against other sources)',
    '',
    'CRITICAL: When sources conflict, prefer evidence from reviews, pricing, and changelog over marketing claims.',
    'Distinguish between "What they market" vs "What they actually deliver" based on source types.',
    'CONTENT_START',
    contentSections,
    'CONTENT_END',
    '',
    'OUTPUT SCHEMA',
    'You must output a JSON object that matches the following EvidenceDraft schema shape (keys and nesting must match exactly):',
    stringifySchemaForPrompt(EVIDENCE_DRAFT_SCHEMA_SHAPE),
    '',
    'OUTPUT RULES',
    '1) Output a single JSON object only. No surrounding prose, labels, or explanations.',
    '2) Do not use markdown or backticks. Do not wrap the JSON in any kind of code fence.',
    '3) Use exactly the schema keys shown above. Do not add, remove, or rename keys.',
    '4) Use standard JSON syntax with double-quoted keys and string values.',
    '5) Each section.sources array must contain at least one URL from the SCRAPED CONTENT section.',
    '6) Only include integrations and enterprise_signals sections if relevant evidence is found.',
    '',
    'CONTENT RULES',
    'Positioning:',
    '- Extract clear positioning statements, taglines, value propositions, or "what makes us different" messaging.',
    '- Each bullet should be a concise, factual statement about how they position themselves.',
    '- Cite the specific URL(s) where this positioning appears.',
    '',
    'Pricing:',
    '- Extract pricing information, pricing models, plans, or pricing-related messaging.',
    '- PREFER pricing source_type over marketing_site for pricing information.',
    '- Include specific prices if found, pricing tiers, or pricing structure details.',
    '- Note any pricing constraints, limitations, or hidden costs mentioned in reviews.',
    '- If pricing is "contact us" or not publicly available, state that clearly.',
    '- Cite the specific URL(s) where pricing information appears, noting source_type when relevant.',
    '',
    'Target customers:',
    '- Extract information about who they serve: customer segments, industries, company sizes, roles, etc.',
    '- Each bullet should describe a specific customer segment or persona they target.',
    '- Cite the specific URL(s) where target customer information appears.',
    '',
    'Key features:',
    '- Extract notable product features, capabilities, or functionality.',
    '- Focus on distinctive or emphasized features, not generic lists.',
    '- Each bullet should describe a specific feature or capability.',
    '- Cite the specific URL(s) where feature information appears.',
    '',
    'Integrations (optional):',
    '- Extract information about integrations, APIs, partnerships, or connectivity.',
    '- Only include if there is clear evidence of integrations mentioned.',
    '- Cite the specific URL(s) where integration information appears.',
    '',
    'Enterprise signals (optional):',
    '- Extract signals that indicate enterprise focus: security certifications, compliance, SLAs, enterprise features, case studies, etc.',
    '- Only include if there is clear evidence of enterprise positioning.',
    '- Cite the specific URL(s) where enterprise signals appear.',
    '',
    'GENERAL BEHAVIOR',
    '- Base all bullets on specific evidence from the scraped content. Do not invent or assume facts.',
    '- If a section has no clear evidence, still create it with an empty bullets array and cite the most relevant source.',
    '- Each bullet must be supported by at least one source URL in that section\'s sources array.',
    '- Use concise, factual language. Avoid marketing fluff or overly promotional language.',
    '- If content is ambiguous or unclear, reflect that uncertainty in the bullet text.',
    '',
    'MARKETING vs REALITY:',
    '- When you find conflicting information, note the conflict and prefer higher-signal sources.',
    '- Example: If marketing says "easy to use" but reviews mention "steep learning curve", include both perspectives.',
    '- For reviews source_type: Extract top complaints and praises. These reflect actual user experience.',
    '- For changelog source_type: Note recent changes (last 6-12 months) that indicate product direction.',
    '- For pricing source_type: Extract actual constraints, limitations, and plan differences.',
    '- For jobs source_type: Note what roles they\'re hiring for and required skills (indicates product direction).',
    '- Always cite the source_type in your analysis when it\'s relevant to understanding the evidence.',
  ].join('\n')

  return [getSystemStyleGuide(), { role: 'user', content: userContent }]
}

