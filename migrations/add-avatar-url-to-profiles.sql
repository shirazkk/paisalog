-- ============================================================
-- ADD: avatar_url to profiles table and setup storage
-- ============================================================

-- 1. Add avatar_url column to profiles
ALTER TABLE public.profiles ADD COLUMN avatar_url text;

-- 2. Create a storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

-- 3. Policy to allow authenticated users to upload their own avatar
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- 4. Policy to allow everyone to view avatars
CREATE POLICY "Allow public access" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
