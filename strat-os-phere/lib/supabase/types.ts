import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Database,
  ProjectRow,
  ProjectInsert,
  CompetitorRow,
  CompetitorInsert,
  ArtifactRow,
  ArtifactInsert,
  ArtifactType,
  EvidenceSourceRow,
  EvidenceSourceInsert,
  EvidenceSourceType,
  EvidenceSourceConfidence,
  Json,
} from './database.types'

// Re-export types for convenience
export type {
  Database,
  ProjectRow,
  ProjectInsert,
  CompetitorRow,
  CompetitorInsert,
  ArtifactRow,
  ArtifactInsert,
  ArtifactType,
  EvidenceSourceType,
  EvidenceSourceConfidence,
  Json,
}

export type ProjectUpdate = Partial<ProjectInsert>
export type CompetitorUpdate = Partial<CompetitorInsert>
export type ArtifactUpdate = Partial<ArtifactInsert>

// TypedSupabaseClient is explicitly typed as SupabaseClient<Database>
// The @supabase/ssr functions return compatible types but don't preserve
// the Database generic, so we cast at the creation site
export type TypedSupabaseClient = SupabaseClient<Database>

// Convenience entity aliases
export type Project = ProjectRow
export type NewProject = ProjectInsert

export type Competitor = CompetitorRow
export type NewCompetitor = CompetitorInsert

export type Artifact = ArtifactRow
export type NewArtifact = ArtifactInsert

export type EvidenceSource = EvidenceSourceRow
export type NewEvidenceSource = EvidenceSourceInsert


