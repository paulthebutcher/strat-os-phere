/**
 * Templates, examples, and quick-fill data for the New Analysis form.
 */

export interface AnalysisTemplate {
  id: string
  name: string
  description: string
  values: {
    name: string
    marketCategory: string
    targetCustomer: string
    businessGoal: string
    product?: string
    geography?: string
  }
}

export const ANALYSIS_TEMPLATES: AnalysisTemplate[] = [
  {
    id: 'b2b-saas',
    name: 'B2B SaaS competitive strategy',
    description: 'For software companies entering or competing in B2B markets',
    values: {
      name: 'B2B SaaS Competitive Analysis',
      marketCategory: 'B2B productivity and collaboration software',
      targetCustomer: 'Mid-market companies (50-500 employees) seeking to improve team efficiency',
      businessGoal: 'Identify defensible positioning opportunities and prioritize feature investments to reduce churn in the first 90 days',
      product: 'Cloud-based project management and team collaboration platform',
      geography: 'North America and Western Europe',
    },
  },
  {
    id: 'local-services',
    name: 'Local services / SMB',
    description: 'For local service businesses targeting small and medium businesses',
    values: {
      name: 'Local Services Competitive Analysis',
      marketCategory: 'Local business services and SMB solutions',
      targetCustomer: 'Small to medium businesses (5-50 employees) in service industries seeking operational efficiency',
      businessGoal: 'Find opportunities to differentiate from established competitors and win local market share',
      product: 'Integrated business management software for local service providers',
      geography: 'United States',
    },
  },
  {
    id: 'b2b-productivity',
    name: 'B2B productivity & collaboration',
    description: 'For tools that help teams work better together',
    values: {
      name: 'B2B Productivity Competitive Analysis',
      marketCategory: 'Enterprise productivity and collaboration tools',
      targetCustomer: 'Enterprise teams (500+ employees) looking to streamline workflows and reduce tool sprawl',
      businessGoal: 'Understand competitive landscape to position our platform as the central hub for team collaboration',
      product: 'Unified workspace platform combining chat, docs, and project management',
      geography: 'Global (with focus on North America and EMEA)',
    },
  },
]

export interface FieldExamples {
  marketCategory: string[]
  targetCustomer: string[]
  businessGoal: string[]
}

export const FIELD_EXAMPLES: FieldExamples = {
  marketCategory: [
    'B2B project management software',
    'Fitness and wellness mobile apps',
    'E-commerce platform solutions',
    'Healthcare practice management software',
    'EdTech learning management systems',
    'Real estate property management tools',
    'Restaurant POS and management systems',
    'Financial planning and wealth management software',
  ],
  targetCustomer: [
    'Small business owners (5-20 employees) seeking automation',
    'Enterprise IT teams (1000+ employees) managing complex infrastructure',
    'Freelancers and independent contractors building their practice',
    'Mid-market companies (100-500 employees) scaling operations',
    'Healthcare providers in private practice',
    'E-commerce merchants selling on multiple channels',
    'Real estate agents managing multiple properties',
    'Fitness studio owners running boutique gyms',
  ],
  businessGoal: [
    'Reduce customer churn in the first 90 days by identifying key differentiators',
    'Prioritize feature investments to win against established competitors',
    'Enter a new market segment with defensible positioning',
    'Improve conversion rates by understanding competitive gaps',
    'Identify partnership opportunities with complementary products',
    'Optimize pricing strategy based on competitive analysis',
    'Build a roadmap that addresses unmet customer needs',
    'Position product for acquisition or funding round',
  ],
}

export interface QuickFillData {
  name: string
  marketCategory: string
  targetCustomer: string
  businessGoal: string
  product: string
  geography: string
}

export const GYM_QUICK_FILL: QuickFillData = {
  name: 'Gym Management Competitive Analysis',
  marketCategory: 'Boutique fitness studio management software',
  targetCustomer: 'Fitness studio owners and gym managers (1-5 locations) seeking to streamline operations and increase member retention',
  businessGoal: 'Identify opportunities to differentiate from established players and win market share by addressing pain points in member management and class scheduling',
  product: 'All-in-one gym management platform with scheduling, payments, and member engagement tools',
  geography: 'United States and Canada',
}

