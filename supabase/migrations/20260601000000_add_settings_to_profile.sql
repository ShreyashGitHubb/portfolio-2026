-- Migration: Add settings jsonb column to profile table
ALTER TABLE public.profile ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}'::jsonb;
