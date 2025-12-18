import type { SupabaseClient as SupabaseClientBase } from '@supabase/supabase-js'

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
  created_at: string
}

export interface CompetitorInsert {
  project_id: string
  name: string
  url?: string | null
  evidence_text?: string | null
}

export type CompetitorUpdate = Partial<CompetitorInsert>

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
export interface Database {
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

export type TypedSupabaseClient = SupabaseClientBase<Database>

// Convenience entity aliases
export type Project = ProjectRow
export type NewProject = ProjectInsert

export type Competitor = CompetitorRow
export type NewCompetitor = CompetitorInsert

export type Artifact = ArtifactRow
export type NewArtifact = ArtifactInsert


