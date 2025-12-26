// Database type definitions for Supabase
// This file defines the structure of the database tables for TypeScript type safety

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Row types
export interface ProjectRow {
  id: string
  user_id: string
  name: string
  market: string
  target_customer: string
  your_product: string | null
  business_goal: string | null
  geography: string | null
  primary_constraint: string | null
  risk_posture: RiskPosture | null
  ambition_level: AmbitionLevel | null
  organizational_capabilities: string | null
  decision_level: DecisionLevel | null
  explicit_non_goals: string | null
  input_confidence: InputConfidence | null
  // Note: starting_point, hypothesis, job_gap, customer_profile,
  // market_context, solution_idea columns do not exist in production schema
  // Note: latest_run_id and latest_successful_run_id columns do not exist in production schema
  // Use lib/data/latestRun.ts to derive latest run info from artifacts table
  created_at: string
}

export interface ProjectInsert {
  user_id: string
  name: string
  market: string
  target_customer: string
  your_product?: string | null
  business_goal?: string | null
  geography?: string | null
  primary_constraint?: string | null
  risk_posture?: RiskPosture | null
  ambition_level?: AmbitionLevel | null
  organizational_capabilities?: string | null
  decision_level?: DecisionLevel | null
  explicit_non_goals?: string | null
  input_confidence?: InputConfidence | null
  // Note: starting_point, hypothesis, job_gap, customer_profile,
  // market_context, solution_idea columns do not exist in production schema
  // Note: latest_run_id and latest_successful_run_id columns do not exist in production schema
  // Use lib/data/latestRun.ts to derive latest run info from artifacts table
}

export type ProjectUpdate = Partial<ProjectInsert>

export interface CompetitorRow {
  id: string
  project_id: string
  name: string
  url: string | null
  evidence_text: string | null
  evidence_citations: Json | null
  created_at: string
}

export interface CompetitorInsert {
  project_id: string
  name: string
  url?: string | null
  evidence_text?: string | null
  evidence_citations?: Json | null
}

export type CompetitorUpdate = Partial<CompetitorInsert>

export type EvidenceSourceType =
  | 'marketing_site'
  | 'changelog'
  | 'pricing'
  | 'reviews'
  | 'jobs'
  | 'docs'
  | 'status'

export type EvidenceSourceConfidence = 'low' | 'medium' | 'high'

// Project decision-framing enums
export type RiskPosture = 'near_term_traction' | 'long_term_defensibility' | 'balanced'
export type AmbitionLevel = 'core_optimization' | 'adjacent_expansion' | 'category_redefinition'
export type DecisionLevel = 'IC' | 'Director' | 'VP' | 'C-suite'
export type InputConfidence = 'very_confident' | 'some_assumptions' | 'exploratory'
export type StartingPoint = 'product' | 'problem' | 'customer' | 'market'

export interface EvidenceSourceRow {
  id: string
  project_id: string
  competitor_id: string | null
  domain: string
  url: string
  extracted_text: string
  page_title: string | null
  source_type: EvidenceSourceType
  source_date_range: string | null // e.g., "last 90 days"
  source_confidence: EvidenceSourceConfidence | null
  extracted_at: string
  created_at: string
}

export interface EvidenceSourceInsert {
  project_id: string
  competitor_id?: string | null
  domain: string
  url: string
  extracted_text: string
  page_title?: string | null
  source_type?: EvidenceSourceType
  source_date_range?: string | null
  source_confidence?: EvidenceSourceConfidence | null
  extracted_at?: string
}

export type EvidenceSourceUpdate = Partial<EvidenceSourceInsert>

export interface EvidenceCacheRow {
  id: string
  normalized_url: string
  content_hash: string
  fetched_at: string
  http_status: number | null
  final_url: string | null
  title: string | null
  raw_text: string | null
  extract_json: Json | null
  summary_json: Json | null
  summary_prompt_version: string | null
  stale_after_days: number
  created_at: string
  updated_at: string
}

export interface EvidenceCacheInsert {
  normalized_url: string
  content_hash: string
  http_status?: number | null
  final_url?: string | null
  title?: string | null
  raw_text?: string | null
  extract_json?: Json | null
  summary_json?: Json | null
  summary_prompt_version?: string | null
  stale_after_days?: number
}

export type EvidenceCacheUpdate = Partial<EvidenceCacheInsert>

// Artifact storage for analysis outputs (and future extension types).
// Database schema: { id, project_id, type, content_json(jsonb), created_at }
// Import from centralized constants to prevent drift
import type { ArtifactType } from '@/lib/constants/types'
export type { ArtifactType }

export interface ArtifactRow {
  id: string
  project_id: string
  type: ArtifactType
  content_json: Json
  created_at: string
}

export interface ArtifactInsert {
  project_id: string
  type: ArtifactType
  content_json: Json
}

export type ArtifactUpdate = Partial<ArtifactInsert>

// Analysis run status
export type AnalysisRunStatus = 'queued' | 'running' | 'completed' | 'failed'

// Analysis run event level
export type AnalysisRunEventLevel = 'info' | 'warn' | 'error'

export interface AnalysisRunRow {
  id: string
  project_id: string
  status: AnalysisRunStatus
  started_at: string | null
  completed_at: string | null
  last_heartbeat_at: string | null
  current_phase: string | null
  percent: number | null
  error_message: string | null
  error: Json | null
  created_at: string
  updated_at: string
}

export interface AnalysisRunInsert {
  project_id: string
  status?: AnalysisRunStatus
  started_at?: string | null
  completed_at?: string | null
  last_heartbeat_at?: string | null
  current_phase?: string | null
  percent?: number | null
  error_message?: string | null
  error?: Json | null
  updated_at?: string | null
}

export type AnalysisRunUpdate = Partial<AnalysisRunInsert>

export interface AnalysisRunEventRow {
  id: string
  run_id: string
  created_at: string
  level: AnalysisRunEventLevel
  phase: string | null
  message: string
  meta: Json | null
}

export interface AnalysisRunEventInsert {
  run_id: string
  level: AnalysisRunEventLevel
  phase?: string | null
  message: string
  meta?: Json | null
}

export type AnalysisRunEventUpdate = Partial<AnalysisRunEventInsert>

// Supabase generated-style Database type
export type Database = {
  public: {
    Tables: {
      projects: {
        Row: ProjectRow
        Insert: ProjectInsert
        Update: ProjectUpdate
        Relationships: []
      }
      competitors: {
        Row: CompetitorRow
        Insert: CompetitorInsert
        Update: CompetitorUpdate
        Relationships: []
      }
      evidence_sources: {
        Row: EvidenceSourceRow
        Insert: EvidenceSourceInsert
        Update: EvidenceSourceUpdate
        Relationships: []
      }
      artifacts: {
        Row: ArtifactRow
        Insert: ArtifactInsert
        Update: ArtifactUpdate
        Relationships: []
      }
      analysis_runs: {
        Row: AnalysisRunRow
        Insert: AnalysisRunInsert
        Update: AnalysisRunUpdate
        Relationships: []
      }
      analysis_run_events: {
        Row: AnalysisRunEventRow
        Insert: AnalysisRunEventInsert
        Update: AnalysisRunEventUpdate
        Relationships: []
      }
      evidence_cache: {
        Row: EvidenceCacheRow
        Insert: EvidenceCacheInsert
        Update: EvidenceCacheUpdate
        Relationships: []
      }
    }
    Views: {
      [_: string]: {
        Row: Record<string, never>
      }
    }
    Functions: {
      [_: string]: {
        Args: Record<string, never>
        Returns: unknown
      }
    }
    Enums: {
      [_: string]: string
    }
    CompositeTypes: {
      [_: string]: Record<string, unknown>
    }
  }
}

