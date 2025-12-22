import type { OpportunityV3Item } from '@/lib/schemas/opportunityV3'

export interface DerivedExperiment {
  name: string
  whatToBuild: string
  primaryMetric: string
  timeToSignal: string
  effortLevel: 'Low' | 'Medium' | 'High'
}

/**
 * Derives concrete experiments from an opportunity using deterministic pattern matching.
 * No AI calls - purely template-based mapping.
 */
export function deriveExperiments(opportunity: OpportunityV3Item): DerivedExperiment[] {
  const experiments: DerivedExperiment[] = []
  
  // Extract keywords from title and description for pattern matching
  const titleLower = opportunity.title.toLowerCase()
  const descriptionLower = opportunity.one_liner.toLowerCase()
  const proposedMoveLower = opportunity.proposed_move.toLowerCase()
  const problemLower = opportunity.problem_today.toLowerCase()
  
  const combinedText = `${titleLower} ${descriptionLower} ${proposedMoveLower} ${problemLower}`
  
  // Pattern 1: Pricing confusion / pricing friction
  if (
    combinedText.includes('pricing') ||
    combinedText.includes('cost') ||
    combinedText.includes('price') ||
    combinedText.includes('subscription') ||
    combinedText.includes('billing')
  ) {
    experiments.push({
      name: 'Pricing page A/B test',
      whatToBuild: 'Test alternative pricing structures or messaging to reduce confusion and improve conversion',
      primaryMetric: 'Pricing page conversion rate',
      timeToSignal: '2–4 weeks',
      effortLevel: 'Low',
    })
  }
  
  // Pattern 2: Feature parity gap / missing features
  if (
    combinedText.includes('feature') ||
    combinedText.includes('capability') ||
    combinedText.includes('functionality') ||
    combinedText.includes('missing') ||
    combinedText.includes('gap')
  ) {
    experiments.push({
      name: 'Concierge MVP',
      whatToBuild: 'Build a manual, high-touch version of the feature to validate demand before full implementation',
      primaryMetric: 'User adoption and satisfaction scores',
      timeToSignal: '3–6 weeks',
      effortLevel: 'Medium',
    })
  }
  
  // Pattern 3: Onboarding friction / activation
  if (
    combinedText.includes('onboarding') ||
    combinedText.includes('activation') ||
    combinedText.includes('first session') ||
    combinedText.includes('getting started') ||
    combinedText.includes('setup')
  ) {
    experiments.push({
      name: 'First-session activation experiment',
      whatToBuild: 'Redesign the initial user experience to reduce friction and increase time-to-value',
      primaryMetric: 'Day 1 activation rate',
      timeToSignal: '2–3 weeks',
      effortLevel: 'Medium',
    })
  }
  
  // Pattern 4: Trust gap / credibility
  if (
    combinedText.includes('trust') ||
    combinedText.includes('credibility') ||
    combinedText.includes('proof') ||
    combinedText.includes('social proof') ||
    combinedText.includes('testimonial')
  ) {
    experiments.push({
      name: 'Proof-point landing page',
      whatToBuild: 'Create a dedicated page showcasing case studies, testimonials, or security certifications',
      primaryMetric: 'Landing page engagement and conversion',
      timeToSignal: '1–2 weeks',
      effortLevel: 'Low',
    })
  }
  
  // Pattern 5: Integration / connectivity
  if (
    combinedText.includes('integration') ||
    combinedText.includes('connect') ||
    combinedText.includes('api') ||
    combinedText.includes('workflow')
  ) {
    experiments.push({
      name: 'Integration pilot program',
      whatToBuild: 'Build a lightweight integration with a key partner tool to validate workflow improvements',
      primaryMetric: 'Integration usage and user satisfaction',
      timeToSignal: '4–8 weeks',
      effortLevel: 'High',
    })
  }
  
  // Pattern 6: Performance / speed
  if (
    combinedText.includes('performance') ||
    combinedText.includes('speed') ||
    combinedText.includes('slow') ||
    combinedText.includes('latency') ||
    combinedText.includes('loading')
  ) {
    experiments.push({
      name: 'Performance optimization sprint',
      whatToBuild: 'Identify and fix the top 3 performance bottlenecks affecting user experience',
      primaryMetric: 'Page load time and user-reported performance',
      timeToSignal: '2–4 weeks',
      effortLevel: 'Medium',
    })
  }
  
  // Pattern 7: Discovery / search
  if (
    combinedText.includes('discover') ||
    combinedText.includes('find') ||
    combinedText.includes('search') ||
    combinedText.includes('navigation')
  ) {
    experiments.push({
      name: 'Discovery sprint',
      whatToBuild: 'Run user interviews and usability tests to understand how users currently find and access key features',
      primaryMetric: 'Task completion rate and user feedback',
      timeToSignal: '2–3 weeks',
      effortLevel: 'Low',
    })
  }
  
  // Pattern 8: Support / help
  if (
    combinedText.includes('support') ||
    combinedText.includes('help') ||
    combinedText.includes('documentation') ||
    combinedText.includes('tutorial')
  ) {
    experiments.push({
      name: 'In-app help experiment',
      whatToBuild: 'Add contextual help, tooltips, or interactive tutorials at key friction points',
      primaryMetric: 'Support ticket volume and feature adoption',
      timeToSignal: '2–3 weeks',
      effortLevel: 'Low',
    })
  }
  
  // Default: Generic discovery sprint if no pattern matches
  if (experiments.length === 0) {
    experiments.push({
      name: 'Discovery sprint',
      whatToBuild: 'Run user interviews and competitive analysis to validate the opportunity and identify the smallest testable hypothesis',
      primaryMetric: 'User validation signals and qualitative feedback',
      timeToSignal: '2–3 weeks',
      effortLevel: 'Low',
    })
  }
  
  // Always ensure we have 2-3 experiments
  if (experiments.length === 1) {
    // Add a validation experiment
    experiments.push({
      name: 'Validation survey',
      whatToBuild: 'Survey existing users to confirm the problem exists and gauge willingness to pay',
      primaryMetric: 'Response rate and problem validation score',
      timeToSignal: '1–2 weeks',
      effortLevel: 'Low',
    })
  }
  
  if (experiments.length === 2) {
    // Add a quick win experiment
    experiments.push({
      name: 'Quick win test',
      whatToBuild: 'Implement the smallest possible version of the proposed solution to test immediate user response',
      primaryMetric: 'User engagement and feedback',
      timeToSignal: '1–2 weeks',
      effortLevel: 'Low',
    })
  }
  
  // Return top 3 experiments
  return experiments.slice(0, 3)
}

