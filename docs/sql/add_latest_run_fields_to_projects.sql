-- Migration: Add latest_successful_run_id and latest_run_id to projects table
-- Run this in your Supabase SQL editor or via migration tool

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS latest_successful_run_id TEXT,
ADD COLUMN IF NOT EXISTS latest_run_id TEXT;

-- Indexes for performance (if needed for queries)
CREATE INDEX IF NOT EXISTS idx_projects_latest_successful_run_id ON projects(latest_successful_run_id) WHERE latest_successful_run_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_latest_run_id ON projects(latest_run_id) WHERE latest_run_id IS NOT NULL;

