-- Migration: Add credential_url to certificates
-- Jalankan di Supabase → SQL Editor

ALTER TABLE public.certificates
ADD COLUMN IF NOT EXISTS credential_url text;

-- Jika credential_id juga belum ada di DB (cek dulu):
-- ALTER TABLE public.certificates
-- ADD COLUMN IF NOT EXISTS credential_id text;
