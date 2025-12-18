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
  owner_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string | null
}

export interface ProjectInsert {
  owner_id: string
  name: string
  description?: string | null
}

export type ProjectUpdate = Partial<ProjectInsert>

export interface CompetitorRow {
  id: string
  project_id: string
  name: string
  website: string | null
  description: string | null
  created_at: string
}

export interface CompetitorInsert {
  project_id: string
  name: string
  website?: string | null
  description?: string | null
}

export type CompetitorUpdate = Partial<CompetitorInsert>

export type ArtifactType = 'note' | 'screenshot' | 'document' | 'link'

export interface ArtifactRow {
  id: string
  project_id: string
  competitor_id: string | null
  type: ArtifactType
  title: string
  url: string | null
  content: string | null
  created_at: string
}

export interface ArtifactInsert {
  project_id: string
  type: ArtifactType
  title: string
  competitor_id?: string | null
  url?: string | null
  content?: string | null
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


