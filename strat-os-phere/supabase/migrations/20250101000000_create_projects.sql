-- Migration: Create projects table
-- Purpose: Base table for competitive analysis projects
-- This is the foundational table that other tables reference via foreign keys
-- 
-- Note: This migration uses IF NOT EXISTS to be idempotent since the table
-- already exists in production. The schema matches the production database.

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  market TEXT NOT NULL,
  target_customer TEXT NOT NULL,
  your_product TEXT,
  business_goal TEXT,
  geography TEXT,
  primary_constraint TEXT,
  risk_posture TEXT CHECK (risk_posture IN ('near_term_traction', 'long_term_defensibility', 'balanced')),
  ambition_level TEXT CHECK (ambition_level IN ('core_optimization', 'adjacent_expansion', 'category_redefinition')),
  organizational_capabilities TEXT,
  decision_level TEXT CHECK (decision_level IN ('IC', 'Director', 'VP', 'C-suite')),
  explicit_non_goals TEXT,
  input_confidence TEXT CHECK (input_confidence IN ('very_confident', 'some_assumptions', 'exploratory')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for efficient queries by user
CREATE INDEX IF NOT EXISTS idx_projects_user_id 
  ON public.projects(user_id);

-- Index for efficient queries by user and creation date
CREATE INDEX IF NOT EXISTS idx_projects_user_created 
  ON public.projects(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own projects
CREATE POLICY "Users can view their own projects"
  ON public.projects
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own projects
CREATE POLICY "Users can insert their own projects"
  ON public.projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own projects
CREATE POLICY "Users can update their own projects"
  ON public.projects
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own projects
CREATE POLICY "Users can delete their own projects"
  ON public.projects
  FOR DELETE
  USING (auth.uid() = user_id);

