export type PageId = 'landing' | 'dashboard' | 'new_project' | 'competitors' | 'results'

export interface GuidanceLink {
  label: string
  href: string
}

export interface PageGuidance {
  title: string
  intro: string
  nextSteps: string[]
  glossary: Record<string, string>
  commonMistakes: string[]
  links: GuidanceLink[]
}

export const guidanceContent: Record<PageId, PageGuidance> = {
  landing: {
    title: 'Welcome to Plinth',
    intro: 'Plinth turns competitor signals into decision-ready opportunities, backed by evidence and citations.',
    nextSteps: [
      'Create a new analysis project to get started',
      'Add 3-7 competitors to build your competitive landscape',
      'Generate your first analysis to see ranked opportunities',
    ],
    glossary: {
      Evidence: 'Public signals from competitors (pricing pages, reviews, job postings, changelogs) collected from the last 90 days.',
      Opportunities: 'Ranked differentiation opportunities with scores, confidence levels, and actionable next steps.',
      Bets: 'Strategic bets that identify what to say no to and why competitors won\'t easily follow, with first experiments to validate.',
    },
    commonMistakes: [
      'Adding too few competitors (minimum 3 required for analysis)',
      'Not being specific enough in market category or target customer descriptions',
      'Skipping the "Sharpen analysis" section which improves output quality',
    ],
    links: [
      { label: 'See a sample', href: '/samples' },
      { label: 'Get started', href: '/login' },
    ],
  },
  dashboard: {
    title: 'Your Projects',
    intro: 'Manage your competitive analysis projects. Create new analyses or continue working on existing ones.',
    nextSteps: [
      'Create a new analysis project to start fresh',
      'Continue working on your most recent project',
      'Review completed analyses to reference insights',
    ],
    glossary: {
      Project: 'A competitive analysis workspace containing competitors, evidence, and generated insights.',
      Analysis: 'The AI-generated output including opportunities, evidence, and strategic bets for a project.',
    },
    commonMistakes: [
      'Creating duplicate projects for the same analysis',
      'Not naming projects clearly enough to find them later',
    ],
    links: [
      { label: 'Create new analysis', href: '/projects/new' },
      { label: 'Help center', href: '/help' },
    ],
  },
  new_project: {
    title: 'New Analysis',
    intro: 'Set up your competitive analysis by defining your market, target customer, and business goal.',
    nextSteps: [
      'Fill in the core fields: market category, target customer, and business goal',
      'Optionally use a template or paste existing context to speed up setup',
      'Consider using "Sharpen analysis" to improve output quality with constraints and calibration',
    ],
    glossary: {
      'Primary constraint': 'The main limitation (time, budget, organizational, regulatory) that helps Plinth prioritize tradeoffs.',
      'Risk posture': 'Whether to optimize for near-term traction or long-term defensibility.',
      'Ambition level': 'The scope of change: core optimization, adjacent expansion, or category redefinition.',
      'Input confidence': 'How confident you are in your inputs, which helps calibrate the analysis.',
    },
    commonMistakes: [
      'Being too vague in market category or target customer (be specific)',
      'Writing business goals as features instead of outcomes',
      'Skipping the "Sharpen analysis" section which significantly improves results',
    ],
    links: [
      { label: 'View examples', href: '/samples' },
      { label: 'Help with setup', href: '/help#new_project' },
    ],
  },
  competitors: {
    title: 'Competitors',
    intro: 'Add real alternatives so Plinth can generate a sharp, exec-ready landscape summary. You need at least 3 competitors to generate an analysis.',
    nextSteps: [
      'Add competitors by URL or name (3-7 total)',
      'Generate evidence for each competitor to build the evidence pack',
      'Once you have 3+ competitors, generate your analysis',
    ],
    glossary: {
      Competitor: 'A real alternative that your target customer might choose instead of your product.',
      Evidence: 'Public signals collected from competitors (pricing, reviews, job postings, changelogs) from the last 90 days.',
      'Evidence pack': 'The complete collection of evidence for all competitors, used to generate opportunities and insights.',
    },
    commonMistakes: [
      'Adding fewer than 3 competitors (analysis requires minimum 3)',
      'Adding competitors that aren\'t real alternatives to your target customer',
      'Not generating evidence before running the analysis',
    ],
    links: [
      { label: 'How to add competitors', href: '/help#competitors' },
      { label: 'Back to project', href: '/dashboard' },
    ],
  },
  results: {
    title: 'Opportunities',
    intro: 'Ranked differentiation opportunities with scores, confidence levels, and actionable next steps. Each opportunity is backed by evidence and citations.',
    nextSteps: [
      'Review the top-ranked opportunities and their scores',
      'Check the evidence and citations for each opportunity',
      'Explore strategic bets to see what to say no to and why',
    ],
    glossary: {
      'Opportunity score': 'A ranking that combines differentiation potential, feasibility, and strategic fit.',
      Confidence: 'How certain we are about the opportunity based on evidence quality and recency.',
      Citations: 'Links to the public sources (pricing pages, reviews, job postings) that support each insight.',
      'Strategic bets': 'Recommendations on what to pursue and what to avoid, with experiments to validate.',
    },
    commonMistakes: [
      'Focusing only on the highest-scored opportunities without considering confidence levels',
      'Not reviewing citations to validate evidence quality',
      'Ignoring strategic bets which help prioritize what to say no to',
    ],
    links: [
      { label: 'View evidence', href: '/help#evidence' },
      { label: 'Understanding scores', href: '/help#results' },
    ],
  },
}

export function getGuidanceForPage(pageId: PageId): PageGuidance {
  return guidanceContent[pageId]
}

