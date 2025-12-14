-- Remove the foreign key constraint on user_id to allow projects without real auth.users entries
-- This aligns with the localStorage-based admin authentication architecture
ALTER TABLE public.projects DROP CONSTRAINT projects_user_id_fkey;