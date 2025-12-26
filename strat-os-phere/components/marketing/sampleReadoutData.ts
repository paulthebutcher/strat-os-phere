/**
 * Sample Readout Data for Marketing Previews
 * 
 * Standardized mock data for a single coherent sample analysis.
 * Market: Incident management / on-call
 * Decision: Should we launch a constrained free tier to unlock mid-market adoption?
 * 
 * All marketing visuals should reference this same sample analysis for consistency.
 */

export const sampleAnalysis = {
  market: "Incident management / on-call",
  decisionQuestion: "Should we launch a constrained free tier to unlock mid-market adoption?",
  recommendation: {
    title: "Launch a constrained free tier focused on teams evaluating reliability tooling",
    confidence: "Strong",
    confidenceLevel: "investment_ready" as const,
    score: 82,
    scoreBreakdown: {
      competitiveNorms: {
        score: 9,
        max: 10,
        label: "Competitive norms",
        reasoning: "4 of 5 competitors have a free tier with similar positioning"
      },
      customerFriction: {
        score: 8,
        max: 10,
        label: "Customer friction",
        reasoning: "Reviews cite 'trial friction' and 'budget approval delays' as blockers"
      },
      marketMaturity: {
        score: 7,
        max: 10,
        label: "Market maturity",
        reasoning: "Buyers expect hands-on evaluation and reliability proof before purchase"
      },
      businessRisk: {
        score: 6,
        max: 10,
        label: "Business risk",
        reasoning: "Cannibalization mitigated by hard caps and upgrade gates"
      }
    }
  },
  competitors: [
    { name: "StatusFlow", domain: "statusflow.com" },
    { name: "PagerGrid", domain: "pagergrid.io" },
    { name: "UptimeKit", domain: "uptimekit.com" },
    { name: "AlertHub", domain: "alerthub.com" },
    { name: "OnCallPro", domain: "oncallpro.io" }
  ],
  evidence: {
    totalSources: 15,
    types: [
      { type: "Pricing", count: 5 },
      { type: "Docs", count: 4 },
      { type: "Reviews", count: 3 },
      { type: "Changelog", count: 2 },
      { type: "Community", count: 1 }
    ],
    sources: [
      {
        domain: "statusflow.com",
        path: "/pricing",
        type: "Pricing",
        title: "StatusFlow Pricing - Free Tier",
        updated: "3 weeks ago"
      },
      {
        domain: "pagergrid.io",
        path: "/docs/free-plan",
        type: "Docs",
        title: "Free Plan Documentation",
        updated: "2 weeks ago"
      },
      {
        domain: "uptimekit.com",
        path: "/changelog",
        type: "Changelog",
        title: "Changelog: Nov 2025",
        updated: "1 week ago"
      },
      {
        domain: "reviewhub.com",
        path: "/statusflow",
        type: "Reviews",
        title: "StatusFlow Reviews - Free Tier Feedback",
        updated: "5 days ago"
      },
      {
        domain: "community.thread",
        path: "/free-tier-limits",
        type: "Community",
        title: "Community thread: 'free tier limits'",
        updated: "1 month ago"
      },
      {
        domain: "statusflow.com",
        path: "/blog/free-tier-announcement",
        type: "Blog",
        title: "Announcing Our Free Tier",
        updated: "2 months ago"
      },
      {
        domain: "pagergrid.io",
        path: "/pricing",
        type: "Pricing",
        title: "PagerGrid Pricing Plans",
        updated: "1 month ago"
      },
      {
        domain: "uptimekit.com",
        path: "/docs/getting-started",
        type: "Docs",
        title: "Getting Started Guide",
        updated: "3 weeks ago"
      },
      {
        domain: "alerthub.com",
        path: "/pricing",
        type: "Pricing",
        title: "AlertHub Pricing",
        updated: "2 weeks ago"
      },
      {
        domain: "oncallpro.io",
        path: "/changelog",
        type: "Changelog",
        title: "Product Updates - Free Tier Expansion",
        updated: "1 week ago"
      },
      {
        domain: "reviewhub.com",
        path: "/pagergrid",
        type: "Reviews",
        title: "PagerGrid User Reviews",
        updated: "1 week ago"
      },
      {
        domain: "statusflow.com",
        path: "/docs/api",
        type: "Docs",
        title: "API Documentation",
        updated: "4 weeks ago"
      },
      {
        domain: "alerthub.com",
        path: "/blog/free-tier-launch",
        type: "Blog",
        title: "Free Tier Launch Announcement",
        updated: "3 months ago"
      },
      {
        domain: "reviewhub.com",
        path: "/uptimekit",
        type: "Reviews",
        title: "UptimeKit Reviews - Free Tier",
        updated: "2 weeks ago"
      },
      {
        domain: "oncallpro.io",
        path: "/pricing",
        type: "Pricing",
        title: "OnCallPro Pricing",
        updated: "1 month ago"
      }
    ]
  },
  whatWouldChange: [
    {
      event: "Two competitors expand free tier limits above 5 seats or 7 days retention",
      evidenceType: "changelog",
      action: "Monitor competitor changelogs and pricing pages",
      priority: "high"
    },
    {
      event: "Trial-to-paid conversion increases above 15% without pricing changes",
      evidenceType: "reviews",
      action: "Track conversion metrics and user feedback",
      priority: "high"
    },
    {
      event: "Support load spikes above 20 tickets per 100 free tier signups",
      evidenceType: "community",
      action: "Monitor support ticket volume and community discussions",
      priority: "medium"
    }
  ],
  nextSteps: [
    "Validate free tier limits with 8 target mid-market teams",
    "Pull additional evidence from competitor docs and changelogs",
    "Run a lightweight prototype test with constrained limits"
  ]
}

// Helper to get evidence by type
export function getEvidenceByType(type: string) {
  return sampleAnalysis.evidence.sources.filter(e => e.type === type)
}

// Helper to get competitor evidence
export function getCompetitorEvidence(competitorDomain: string) {
  return sampleAnalysis.evidence.sources.filter(e => e.domain === competitorDomain)
}

// Helper to format evidence source for display
export function formatEvidenceSource(source: typeof sampleAnalysis.evidence.sources[0]) {
  return {
    domain: source.domain,
    fullUrl: `${source.domain}${source.path}`,
    type: source.type,
    title: source.title,
    updated: source.updated
  }
}

