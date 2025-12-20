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

// Artifact storage for analysis outputs (and future extension types).
// Database schema: { id, project_id, type, content_json(jsonb), created_at }
export type ArtifactType = 'profiles' | 'synthesis'

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

