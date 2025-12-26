/**
 * Sample Data for Marketing Previews
 * 
 * Static sample data used by marketing preview components.
 * These are NOT real app data - they're purely presentational for the landing page.
 * No API calls, no database queries, no app state.
 * 
 * Note: This file is being phased out in favor of sampleReadoutData.ts for consistency.
 * Some components may still reference this for backward compatibility.
 */

import { sampleAnalysis } from "../sampleReadoutData"

export const sampleEvidenceQueue = {
  competitors: sampleAnalysis.competitors.map((comp, idx) => ({
    name: comp.name,
    domain: comp.domain,
    status: idx < 2 ? "done" : idx === 2 ? "fetching" : "queued"
  })),
  items: sampleAnalysis.evidence.sources.slice(0, 9).map((source, idx) => ({
    type: source.type,
    title: source.title,
    domain: source.domain,
    status: idx < 5 ? "done" : idx === 5 ? "fetching" : idx === 7 ? "skipped" : "queued"
  })),
  coverage: { 
    sources: sampleAnalysis.evidence.totalSources, 
    types: sampleAnalysis.evidence.types.length, 
    freshness: "High", 
    progress: 73 
  },
  currentTask: `Collecting pricing pages from ${sampleAnalysis.competitors[2].domain}...`,
};

export const sampleNormalizedLedger = {
  evidenceTypes: sampleAnalysis.evidence.types.map(et => ({
    id: et.type.toLowerCase(),
    label: et.type,
    count: et.count,
    active: et.type === "Pricing"
  })),
  evidenceRows: sampleAnalysis.evidence.sources
    .filter(s => s.type === "Pricing")
    .slice(0, 5)
    .map(source => ({
      domain: source.domain,
      pageTitle: source.title,
      extractedAt: source.updated,
      badges: source.updated.includes("week") || source.updated.includes("day") 
        ? ["Pricing", "Fresh"] 
        : ["Pricing"],
      confidence: source.updated.includes("week") || source.updated.includes("day") 
        ? "high" 
        : "medium",
    })),
  confidenceSignals: {
    crossSourceAgreement: { level: "High", percentage: 87 },
    recency: { days: 28, label: "28 days" },
    coverageGaps: { type: "Reviews", missing: "2/5 competitors" },
  },
};

export const sampleRankedOpportunities = [
  {
    rank: 1,
    title: sampleAnalysis.recommendation.title,
    description:
      `${sampleAnalysis.competitors.length - 1} of ${sampleAnalysis.competitors.length} competitors offer free tiers with usage-based limits. ${sampleAnalysis.competitors[0].name} and ${sampleAnalysis.competitors[1].name} expanded their free tiers in the past 6 months, with user growth tracking in their changelogs.`,
    confidence: sampleAnalysis.recommendation.score,
    defensibility: "High",
    citations: sampleAnalysis.evidence.totalSources - 6,
    metrics: [
      { label: "Market coverage", value: "78%" },
      { label: "User impact", value: "High" },
    ],
    sources: sampleAnalysis.evidence.sources
      .filter(s => s.type === "Pricing" || s.type === "Docs")
      .slice(0, 5)
      .map(s => `${s.domain}${s.path}`),
  },
  {
    rank: 2,
    title: "API-first positioning gap",
    description:
      `${sampleAnalysis.competitors[1].name} and ${sampleAnalysis.competitors[2].name} emphasize API access in their positioning. Other competitors have limited API marketing, creating a positioning opportunity.`,
    confidence: 84.2,
    defensibility: "Medium",
    citations: 7,
    metrics: [
      { label: "Market coverage", value: "42%" },
      { label: "User impact", value: "Medium" },
    ],
    sources: sampleAnalysis.evidence.sources
      .filter(s => s.type === "Docs")
      .slice(0, 4)
      .map(s => `${s.domain}${s.path}`),
  },
  {
    rank: 3,
    title: "Team collaboration features",
    description:
      "All competitors have strong team features, but reviews indicate gaps in real-time collaboration UX. Opportunity for differentiation.",
    confidence: 76.8,
    defensibility: "Medium",
    citations: 11,
    metrics: [
      { label: "Market coverage", value: "76%" },
      { label: "User impact", value: "High" },
    ],
    sources: sampleAnalysis.evidence.sources
      .filter(s => s.type === "Reviews" || s.type === "Changelog")
      .slice(0, 5)
      .map(s => `${s.domain}${s.path}`),
  },
];

