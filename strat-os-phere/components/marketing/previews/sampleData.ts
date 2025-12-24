/**
 * Sample Data for Marketing Previews
 * 
 * Static sample data used by marketing preview components.
 * These are NOT real app data - they're purely presentational for the landing page.
 * No API calls, no database queries, no app state.
 */

export const sampleEvidenceQueue = {
  competitors: [
    { name: "PagerDuty", domain: "pagerduty.com", status: "done" },
    { name: "Opsgenie", domain: "atlassian.com", status: "done" },
    { name: "Splunk On-Call", domain: "splunk.com", status: "fetching" },
    { name: "Better Stack", domain: "betterstack.com", status: "queued" },
    { name: "Datadog", domain: "datadoghq.com", status: "queued" },
  ],
  items: [
    { type: "Pricing", title: "Pricing", domain: "pagerduty.com", status: "done" },
    { type: "Docs", title: "API Docs", domain: "pagerduty.com", status: "done" },
    { type: "Changelog", title: "Release Notes", domain: "pagerduty.com", status: "done" },
    { type: "Pricing", title: "Pricing", domain: "atlassian.com", status: "done" },
    { type: "Docs", title: "Documentation", domain: "atlassian.com", status: "done" },
    { type: "Pricing", title: "Pricing", domain: "splunk.com", status: "fetching" },
    { type: "Docs", title: "Documentation", domain: "splunk.com", status: "queued" },
    { type: "Reviews", title: "G2 Reviews", domain: "g2.com", status: "skipped" },
    { type: "Pricing", title: "Pricing", domain: "betterstack.com", status: "queued" },
  ],
  coverage: { sources: 14, types: 4, freshness: "High", progress: 68 },
  currentTask: "Collecting pricing pages from splunk.com...",
};

export const sampleNormalizedLedger = {
  evidenceTypes: [
    { id: "pricing", label: "Pricing", count: 12, active: true },
    { id: "docs", label: "Docs", count: 8, active: false },
    { id: "changelog", label: "Changelog", count: 5, active: false },
    { id: "reviews", label: "Reviews", count: 15, active: false },
  ],
  evidenceRows: [
    {
      domain: "pagerduty.com",
      pageTitle: "Pricing - PagerDuty",
      extractedAt: "2 days ago",
      badges: ["Pricing", "Fresh"],
      confidence: "high",
    },
    {
      domain: "atlassian.com",
      pageTitle: "Opsgenie Pricing Plans",
      extractedAt: "1 day ago",
      badges: ["Pricing", "Fresh"],
      confidence: "high",
    },
    {
      domain: "splunk.com",
      pageTitle: "Splunk On-Call Pricing",
      extractedAt: "5 days ago",
      badges: ["Pricing"],
      confidence: "medium",
    },
    {
      domain: "betterstack.com",
      pageTitle: "Better Stack Pricing",
      extractedAt: "3 days ago",
      badges: ["Pricing", "Fresh"],
      confidence: "high",
    },
    {
      domain: "datadoghq.com",
      pageTitle: "Datadog Incident Management Pricing",
      extractedAt: "1 week ago",
      badges: ["Pricing"],
      confidence: "medium",
    },
  ],
  confidenceSignals: {
    crossSourceAgreement: { level: "High", percentage: 92 },
    recency: { days: 30, label: "30 days" },
    coverageGaps: { type: "Reviews", missing: "2/5 competitors" },
  },
};

export const sampleRankedOpportunities = [
  {
    rank: 1,
    title: "Free tier expansion opportunity",
    description:
      "3 of 5 competitors offer free tiers with generous limits. PagerDuty and Opsgenie have seen 40%+ user growth after launching free tiers.",
    confidence: 92,
    defensibility: "High",
    citations: 8,
    metrics: [
      { label: "Market coverage", value: "60%" },
      { label: "User impact", value: "High" },
    ],
    sources: [
      "pagerduty.com/pricing",
      "atlassian.com/docs",
      "splunk.com/blog",
      "betterstack.com/pricing",
      "datadoghq.com/changelog",
    ],
  },
  {
    rank: 2,
    title: "API-first positioning gap",
    description:
      "Opsgenie and Better Stack emphasize API access in their positioning. Splunk and PagerDuty have limited API marketing, creating a positioning opportunity.",
    confidence: 85,
    defensibility: "Medium",
    citations: 6,
    metrics: [
      { label: "Market coverage", value: "40%" },
      { label: "User impact", value: "Medium" },
    ],
    sources: [
      "atlassian.com/docs",
      "betterstack.com/docs",
      "splunk.com/docs",
      "pagerduty.com/docs",
    ],
  },
  {
    rank: 3,
    title: "Team collaboration features",
    description:
      "All competitors have strong team features, but reviews indicate gaps in real-time collaboration UX. Opportunity for differentiation.",
    confidence: 78,
    defensibility: "Medium",
    citations: 12,
    metrics: [
      { label: "Market coverage", value: "80%" },
      { label: "User impact", value: "High" },
    ],
    sources: [
      "g2.com/reviews",
      "pagerduty.com/changelog",
      "atlassian.com/changelog",
      "splunk.com/blog",
      "betterstack.com/docs",
    ],
  },
];

