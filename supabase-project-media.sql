-- Add optional live-project links and up to five gallery image URLs to projects.
-- Run once in Supabase SQL Editor before using the gallery fields in the admin panel.
alter table public.projects
  add column if not exists project_url text,
  add column if not exists project_images text;
