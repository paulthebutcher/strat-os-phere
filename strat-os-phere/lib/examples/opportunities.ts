/**
 * Static Example Opportunity Artifacts
 * 
 * Mock opportunity outputs for demos, testing, and reference.
 * These are standalone examples that do not depend on database types or runtime schemas.
 * 
 * Use these for:
 * - Marketing/demo pages
 * - UI component development
 * - Design system reference
 * - Testing scenarios
 */

export type ConfidenceLevel = 'exploratory' | 'directional' | 'investment_ready'

export interface ExampleEvidence {
  sourceType: 'pricing' | 'docs' | 'changelog' | 'reviews' | 'jobs' | 'status'
  label: string
  url: string
  excerpt: string
}

export interface ExampleScoringBreakdown {
  driver: string
  explanation: string
  weight: number // 0-1
  direction: 'up' | 'down'
}

export interface ExampleOpportunity {
  title: string
  confidenceLevel: ConfidenceLevel
  safeToDecide: string // 1-2 sentences
  whatWouldIncreaseConfidence: string[] // 2-4 bullets
  whyThisSurfaced: string // 1-2 sentences
  evidence: ExampleEvidence[] // 3-6 items
  scoringBreakdown: ExampleScoringBreakdown[] // 3-5 items
}

export const EXAMPLE_OPPORTUNITIES: ExampleOpportunity[] = [
  {
    title: "Add real-time collaborative editing to code editors",
    confidenceLevel: "exploratory",
    safeToDecide: "Early signal suggests demand exists, but evidence is limited to three competitor launches and sparse user feedback. Not yet safe to commit significant resources without validating actual user willingness to adopt.",
    whatWouldIncreaseConfidence: [
      "User research data showing teams actively seeking collaboration features",
      "Pricing page analysis showing collaboration as a paid differentiator",
      "Job postings from multiple competitors indicating strategic investment in real-time infrastructure"
    ],
    whyThisSurfaced: "Three competitors launched collaborative editing features within the last 90 days, and early user reviews mention this as a desired capability.",
    evidence: [
      {
        sourceType: "changelog",
        label: "GitHub Codespaces Collaboration Launch",
        url: "https://example.com/github-collaboration",
        excerpt: "GitHub announced real-time collaboration features for Codespaces in January 2024, allowing multiple developers to edit code simultaneously."
      },
      {
        sourceType: "changelog",
        label: "Gitpod Real-time Collaboration",
        url: "https://example.com/gitpod-collaboration",
        excerpt: "Gitpod added collaborative editing capabilities in early 2024, with live cursor tracking and synchronized edits."
      },
      {
        sourceType: "reviews",
        label: "VS Code Reviews - G2",
        url: "https://example.com/g2-reviews",
        excerpt: "User reviews from January 2024 show multiple teams requesting real-time collaboration features, particularly for pair programming workflows."
      },
      {
        sourceType: "pricing",
        label: "Replit Pricing - Collaboration",
        url: "https://example.com/replit-pricing",
        excerpt: "Replit's pricing page highlights collaborative features as a premium differentiator, suggesting market value perception."
      }
    ],
    scoringBreakdown: [
      {
        driver: "Competitor activity signal",
        explanation: "Recent launches indicate market movement, but sample size is small",
        weight: 0.4,
        direction: "up"
      },
      {
        driver: "User feedback coverage",
        explanation: "Limited review data, mostly anecdotal mentions rather than systematic demand signals",
        weight: 0.3,
        direction: "down"
      },
      {
        driver: "Strategic investment signals",
        explanation: "No job postings or infrastructure announcements yet observed",
        weight: 0.2,
        direction: "down"
      },
      {
        driver: "Pricing validation",
        explanation: "One competitor pricing page suggests value, but not enough to confirm market willingness to pay",
        weight: 0.1,
        direction: "up"
      }
    ]
  },
  {
    title: "Build native mobile apps for design collaboration tools",
    confidenceLevel: "directional",
    safeToDecide: "Converging signals show clear demand and competitive gaps. Evidence spans pricing pages, user reviews, and competitor roadmaps. Safe to begin scoping, but validate specific use cases before committing engineering resources.",
    whatWouldIncreaseConfidence: [
      "Quantitative data on mobile usage patterns from analytics or user research",
      "Job postings indicating competitors are investing in mobile teams",
      "User interviews confirming specific mobile collaboration workflows that desktop cannot serve"
    ],
    whyThisSurfaced: "Analysis of competitor pricing pages shows mobile apps consistently positioned as premium features, and user reviews across multiple platforms indicate frustration with mobile web experiences for design collaboration.",
    evidence: [
      {
        sourceType: "pricing",
        label: "Figma Mobile App Pricing",
        url: "https://example.com/figma-mobile-pricing",
        excerpt: "Figma's pricing tiers highlight mobile app access as a key differentiator for Professional and Organization plans."
      },
      {
        sourceType: "pricing",
        label: "Sketch Mobile Access",
        url: "https://example.com/sketch-mobile",
        excerpt: "Sketch's pricing page emphasizes mobile app capabilities as a premium feature, separate from web access."
      },
      {
        sourceType: "reviews",
        label: "Design Tool Reviews - Mobile Feedback",
        url: "https://example.com/design-reviews",
        excerpt: "User reviews from Q4 2023 show consistent requests for better mobile experiences, with many users expressing frustration that mobile web versions are too limited."
      },
      {
        sourceType: "docs",
        label: "Competitor Mobile Roadmap",
        url: "https://example.com/competitor-roadmap",
        excerpt: "Public roadmap documents from two competitors mention mobile app improvements as strategic priorities for 2024."
      },
      {
        sourceType: "changelog",
        label: "Recent Mobile Feature Launches",
        url: "https://example.com/mobile-launches",
        excerpt: "Three design collaboration tools launched significant mobile app updates in the last quarter, suggesting active investment in this area."
      }
    ],
    scoringBreakdown: [
      {
        driver: "Pricing validation",
        explanation: "Multiple competitors position mobile as premium, indicating market willingness to pay",
        weight: 0.35,
        direction: "up"
      },
      {
        driver: "User demand signals",
        explanation: "Consistent review feedback shows clear user frustration with current mobile experiences",
        weight: 0.3,
        direction: "up"
      },
      {
        driver: "Competitive activity",
        explanation: "Recent launches and roadmap mentions suggest this is an active investment area",
        weight: 0.25,
        direction: "up"
      },
      {
        driver: "Use case clarity",
        explanation: "While demand exists, specific mobile workflows that justify native apps need validation",
        weight: 0.1,
        direction: "down"
      }
    ]
  },
  {
    title: "Implement AI-powered code review suggestions",
    confidenceLevel: "investment_ready",
    safeToDecide: "Strong evidence across multiple dimensions: widespread competitor adoption, clear user demand, pricing validation, and strategic hiring signals. This opportunity is safe to act on with committed resources.",
    whatWouldIncreaseConfidence: [
      "Performance metrics from competitors showing adoption rates and user satisfaction",
      "Specific implementation details on which AI models or approaches competitors are using"
    ],
    whyThisSurfaced: "Analysis across changelogs, pricing pages, and job postings reveals that seven of eight major code review platforms have launched AI-powered suggestions in the past 12 months, with strong user sentiment and clear pricing premiums attached.",
    evidence: [
      {
        sourceType: "changelog",
        label: "GitHub Copilot Code Review",
        url: "https://example.com/github-copilot-review",
        excerpt: "GitHub launched AI-powered code review suggestions in late 2023, with automatic detection of potential bugs and style issues."
      },
      {
        sourceType: "changelog",
        label: "GitLab AI Code Review",
        url: "https://example.com/gitlab-ai-review",
        excerpt: "GitLab introduced AI-assisted code review features in Q4 2023, with integration into merge request workflows."
      },
      {
        sourceType: "pricing",
        label: "Code Review Platform Pricing Comparison",
        url: "https://example.com/code-review-pricing",
        excerpt: "Five of seven code review platforms now include AI features in their premium tiers, with pricing premiums of 30-50% over base plans."
      },
      {
        sourceType: "reviews",
        label: "User Reviews - AI Code Review",
        url: "https://example.com/ai-review-reviews",
        excerpt: "User reviews from Q4 2023 and Q1 2024 show overwhelmingly positive sentiment toward AI code review features, with users citing time savings and improved code quality."
      },
      {
        sourceType: "jobs",
        label: "AI Code Review Hiring Signals",
        url: "https://example.com/ai-review-jobs",
        excerpt: "Job postings from four competitors specifically mention AI/ML roles for code review features, indicating strategic investment and ongoing development."
      },
      {
        sourceType: "docs",
        label: "Competitor AI Documentation",
        url: "https://example.com/ai-review-docs",
        excerpt: "Competitor documentation shows extensive investment in AI code review capabilities, with detailed feature descriptions and integration guides."
      }
    ],
    scoringBreakdown: [
      {
        driver: "Competitor adoption rate",
        explanation: "Seven of eight major platforms have launched features, indicating market maturity and validation",
        weight: 0.3,
        direction: "up"
      },
      {
        driver: "Pricing validation",
        explanation: "Clear premium pricing attached to AI features across multiple competitors",
        weight: 0.25,
        direction: "up"
      },
      {
        driver: "User sentiment",
        explanation: "Overwhelmingly positive reviews with specific benefits cited (time savings, quality improvements)",
        weight: 0.25,
        direction: "up"
      },
      {
        driver: "Strategic investment signals",
        explanation: "Multiple competitors actively hiring for AI code review roles, suggesting ongoing commitment",
        weight: 0.15,
        direction: "up"
      },
      {
        driver: "Implementation clarity",
        explanation: "While market validation is strong, technical implementation approach needs definition",
        weight: 0.05,
        direction: "down"
      }
    ]
  }
]

