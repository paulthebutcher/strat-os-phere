/**
 * Centralized Microcopy
 * 
 * Single source of truth for all user-facing copy across Plinth.
 * Focus: Investment decision tool for startups and enterprises.
 * Tone: Calm, confident, analytical. "Trust > novelty." "Decision credibility."
 * 
 * Avoid: boss/manager pleasing, productivity coaching, "feel good" language.
 */

export const microcopy = {
  marketing: {
    heroHeadline: "Find your unfair advantage",
    heroSubhead: "Turn an idea into a clear next step—backed by public evidence you can point to.",
    heroTagline: "No dashboards. No fluff. Just the evidence behind the call.",
    primaryCTA: "See a real example",
    secondaryCTA: "Try it on your idea",
    proofLine: "Citations included · Explainable ranking · Clear \"what would change my mind\"",
  },

  onboarding: {
    stepTitles: {
      step1: "Create a new analysis",
      step2: "Add competitors",
      step3: "Project details",
    },
    stepDescriptions: {
      step1: "Define the product/market you're investing in and the decision you're trying to make.",
      step2: "Select competitors to analyze. We'll help you discover relevant options.",
      step3: "Finalize your project settings and context.",
    },
    helperText: {
      investmentFocus: "Define the product/market you're investing in and the decision you're trying to make.",
      evidenceGuidance: "We only use public sources. Citations are preserved.",
      whatYoullGet: {
        title: "What you'll get",
        items: [
          "Ranked opportunities with scores",
          "Evidence & confidence metrics",
          "Citations and source links",
        ],
      },
      publicSourcesOnly: "Only public pages are used. Don't paste confidential information.",
    },
  },

  emptyStates: {
    noProjects: {
      title: "Start your first analysis",
      description: "Create a new competitive analysis to identify strategic investment opportunities backed by public evidence.",
      cta: "Start guided analysis",
      ctaSecondary: "Try an example",
    },
    noEvidence: {
      title: "Not enough evidence to rank opportunities yet",
      description: "Add public sources across competitors to generate defensible bets with citations.",
      cta: "Fetch evidence",
    },
    noEvidenceCaptured: {
      title: "No evidence captured yet for this analysis",
      description: "Re-run evidence collection to populate sources and generate ranked opportunities.",
      cta: "Collect evidence",
    },
    notReady: {
      title: "Analysis not ready",
      description: "Gather evidence across competitors before generating strategic bets.",
      cta: "Add evidence",
    },
    notEnoughEvidenceYet: "Not enough evidence yet",
    errorLoadProject: {
      title: "This project couldn't be loaded right now",
      description: "If this persists, it may be a schema mismatch. Try reloading.",
      cta: "Reload",
      ctaSecondary: "Back to projects",
    },
  },

  actions: {
    generateAnalysis: "Run analysis",
    viewOpportunities: "View opportunities",
    fetchEvidence: "Fetch evidence",
    startAnalysis: "Start an analysis",
    newAnalysis: "New analysis",
    generateResearchPlan: "Generate research plan",
    addCompetitors: "Add competitors",
    tryExample: "Try an example",
    seeExampleOutput: "See example output",
    continueSetup: "Continue setup",
    improveEvidence: "Improve evidence & rerun",
  },

  framing: {
    analysisFraming: "Investment focus",
    weWillAnalyze: "We'll analyze",
    inMarket: "In",
    decision: "Decision",
    addCompanyDecision: "Add a company + decision to see a preview",
  },

  quality: {
    gettingStarted: "Getting started",
    goodStart: "Good start",
    strong: "Strong",
    excellent: "Excellent",
    signalsProvided: "signals provided",
  },
} as const

export type Microcopy = typeof microcopy

