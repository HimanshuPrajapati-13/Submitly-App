-- ATF Apply Too FAST - Database Schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/rjpbzjagdrcunidxhygv/sql)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('JOB', 'COLLEGE', 'EXAM', 'SCHOLARSHIP', 'OTHER')),
  deadline TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'IN_PROGRESS', 'SUBMITTED', 'RESULT_PENDING', 'ACCEPTED', 'REJECTED', 'CLOSED')),
  priority INTEGER DEFAULT 0,
  notes TEXT,
  reminders_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Steps table
CREATE TABLE IF NOT EXISTS steps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  estimated_minutes INTEGER,
  note TEXT,
  blocked_by TEXT,
  blocked_until TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step links table
CREATE TABLE IF NOT EXISTS step_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  step_id UUID REFERENCES steps(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step files table (stores metadata, actual files in Supabase Storage)
CREATE TABLE IF NOT EXISTS step_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  step_id UUID REFERENCES steps(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Applications policies
CREATE POLICY "Users can view own applications" ON applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications" ON applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications" ON applications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications" ON applications
  FOR DELETE USING (auth.uid() = user_id);

-- Steps policies
CREATE POLICY "Users can view own steps" ON steps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own steps" ON steps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own steps" ON steps
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own steps" ON steps
  FOR DELETE USING (auth.uid() = user_id);

-- Step links policies
CREATE POLICY "Users can view own step_links" ON step_links
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own step_links" ON step_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own step_links" ON step_links
  FOR DELETE USING (auth.uid() = user_id);

-- Step files policies
CREATE POLICY "Users can view own step_files" ON step_files
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own step_files" ON step_files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own step_files" ON step_files
  FOR DELETE USING (auth.uid() = user_id);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for files
INSERT INTO storage.buckets (id, name, public)
VALUES ('step-files', 'step-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'step-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'step-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'step-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_deadline ON applications(deadline);
CREATE INDEX IF NOT EXISTS idx_steps_application_id ON steps(application_id);
CREATE INDEX IF NOT EXISTS idx_step_links_step_id ON step_links(step_id);
CREATE INDEX IF NOT EXISTS idx_step_files_step_id ON step_files(step_id);
