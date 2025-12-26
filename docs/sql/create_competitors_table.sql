-- REFERENCE ONLY - DO NOT RUN DIRECTLY
-- This SQL is for reference only. Check supabase/migrations/ for the actual migration.
--
-- Migration: Create competitors table for PR-3
-- This table stores competitor companies with their primary websites
-- Run this in your Supabase SQL editor or via migration tool

-- Table to store competitors for each project
CREATE TABLE IF NOT EXISTS competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  evidence_text TEXT,
  evidence_citations JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint: prevent duplicate URLs per project
CREATE UNIQUE INDEX IF NOT EXISTS idx_competitors_project_url 
  ON competitors(project_id, url);

-- Index for efficient queries by project
CREATE INDEX IF NOT EXISTS idx_competitors_project_created 
  ON competitors(project_id, created_at DESC);

-- RLS policies (adjust based on your auth setup)
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see competitors for their own projects
CREATE POLICY "Users can view their own project competitors"
  ON competitors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = competitors.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Policy: Users can insert competitors for their own projects
CREATE POLICY "Users can insert competitors for their own projects"
  ON competitors FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = competitors.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Policy: Users can update competitors for their own projects
CREATE POLICY "Users can update competitors for their own projects"
  ON competitors FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = competitors.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = competitors.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Policy: Users can delete competitors for their own projects
CREATE POLICY "Users can delete competitors for their own projects"
  ON competitors FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = competitors.project_id
      AND projects.user_id = auth.uid()
    )
  );

