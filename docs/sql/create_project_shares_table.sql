-- Migration: Create project_shares table for public share links
-- Run this in your Supabase SQL editor or via migration tool

CREATE TABLE IF NOT EXISTS project_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  share_token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_shares_project_id ON project_shares(project_id);
CREATE INDEX IF NOT EXISTS idx_project_shares_share_token ON project_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_project_shares_revoked_at ON project_shares(revoked_at) WHERE revoked_at IS NULL;

-- RLS policies (if using Row Level Security)
-- Allow anyone to read non-revoked shares (for public access)
ALTER TABLE project_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view non-revoked shares"
  ON project_shares
  FOR SELECT
  USING (revoked_at IS NULL);

-- Allow authenticated users to create shares for their own projects
CREATE POLICY "Users can create shares for their own projects"
  ON project_shares
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_shares.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Allow authenticated users to revoke shares for their own projects
CREATE POLICY "Users can revoke shares for their own projects"
  ON project_shares
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_shares.project_id
      AND projects.user_id = auth.uid()
    )
  );

