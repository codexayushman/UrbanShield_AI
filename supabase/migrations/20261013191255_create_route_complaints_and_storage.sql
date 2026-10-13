/*
# Route Complaints Table and Storage Bucket

## Purpose
Allows citizens to submit complaints about route safety — whether a suggested safe route
was actually safe or unsafe — with optional photo/video evidence uploaded from camera
or file picker.

## New Tables
1. `route_complaints`
   - `id` (uuid, primary key)
   - `route_name` (text, not null) — the route the complaint is about
   - `destination` (text, not null) — the destination the user was navigating to
   - `feedback` (text, not null) — 'safe' or 'unsafe'
   - `description` (text, not null default '') — detailed complaint text
   - `sector` (text, default 'Unknown') — area of complaint
   - `media_urls` (jsonb, default '[]') — array of storage URLs for uploaded photos/videos
   - `reporter_name` (text, default 'Anonymous') — optional name
   - `status` (text, default 'submitted') — complaint workflow status
   - `created_at` (timestamptz, default now())

2. Storage bucket: `route-complaint-media` (public, 50MB file limit)
   - Stores uploaded photos and videos from complaints.

## Security
- RLS enabled on `route_complaints`.
- This is a DEMO / no-auth app — policies allow `anon, authenticated` CRUD.
- Storage bucket is public for read; anon can upload.

## Important Notes
1. This is a single-tenant demo app with no sign-in — all policies use `TO anon, authenticated`.
2. Media files are stored in Supabase Storage bucket `route-complaint-media`.
3. Complaint statuses: submitted -> under_review -> resolved -> dismissed.
*/

-- 1. Route complaints table
CREATE TABLE IF NOT EXISTS route_complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_name text NOT NULL,
  destination text NOT NULL,
  feedback text NOT NULL CHECK (feedback IN ('safe', 'unsafe')),
  description text NOT NULL DEFAULT '',
  sector text NOT NULL DEFAULT 'Unknown',
  media_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
  reporter_name text NOT NULL DEFAULT 'Anonymous',
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'resolved', 'dismissed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE route_complaints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_complaints" ON route_complaints;
CREATE POLICY "anon_select_complaints" ON route_complaints FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_complaints" ON route_complaints;
CREATE POLICY "anon_insert_complaints" ON route_complaints FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_complaints" ON route_complaints;
CREATE POLICY "anon_update_complaints" ON route_complaints FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_complaints" ON route_complaints;
CREATE POLICY "anon_delete_complaints" ON route_complaints FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_complaints_status ON route_complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON route_complaints(created_at DESC);

-- 2. Storage bucket for complaint media (photos/videos)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('route-complaint-media', 'route-complaint-media', true, 52428800)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: anon can read and upload
DROP POLICY IF EXISTS "anon_read_complaint_media" ON storage.objects;
CREATE POLICY "anon_read_complaint_media" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'route-complaint-media');

DROP POLICY IF EXISTS "anon_upload_complaint_media" ON storage.objects;
CREATE POLICY "anon_upload_complaint_media" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'route-complaint-media');

DROP POLICY IF EXISTS "anon_delete_complaint_media" ON storage.objects;
CREATE POLICY "anon_delete_complaint_media" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'route-complaint-media');
