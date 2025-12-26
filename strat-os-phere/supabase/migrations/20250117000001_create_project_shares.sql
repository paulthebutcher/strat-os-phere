-- Migration: Create project_shares table for public share links
-- Purpose: Store share tokens for publicly accessible project views

CREATE TABLE IF NOT EXISTS public.project_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  share_token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_shares_project_id ON public.project_shares(project_id);
CREATE INDEX IF NOT EXISTS idx_project_shares_share_token ON public.project_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_project_shares_revoked_at ON public.project_shares(revoked_at) WHERE revoked_at IS NULL;

-- RLS policies
ALTER TABLE public.project_shares ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view non-revoked shares (for public access)
CREATE POLICY "Anyone can view non-revoked shares"
  ON public.project_shares
  FOR SELECT
  USING (revoked_at IS NULL);

-- Policy: Users can create shares for their own projects
CREATE POLICY "Users can create shares for their own projects"
  ON public.project_shares
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.project_shares.project_id
      AND public.projects.user_id = auth.uid()
    )
  );

-- Policy: Users can revoke shares for their own projects
CREATE POLICY "Users can revoke shares for their own projects"
  ON public.project_shares
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.project_shares.project_id
      AND public.projects.user_id = auth.uid()
    )
  );

