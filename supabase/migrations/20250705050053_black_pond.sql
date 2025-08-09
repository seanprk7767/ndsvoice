/*
  # Enhanced Staff Profile System

  1. New Tables
    - `staff_profiles` - Extended user profiles with photos and work details
    - `work_progress` - Track staff work progress and tasks
    - `staff_performance` - Performance tracking and evaluations
    - `submission_staff` - Many-to-many relationship for relevant staff assignments

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users and admins
    - File upload policies for profile images

  3. Storage
    - Create storage bucket for profile images
    - Set up policies for image uploads
*/

-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'profile-images');
CREATE POLICY "Authenticated users can upload profile images" ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'profile-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile images" ON storage.objects FOR UPDATE 
  USING (bucket_id = 'profile-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete own profile images" ON storage.objects FOR DELETE 
  USING (bucket_id = 'profile-images' AND auth.role() = 'authenticated');

-- Enhanced user profiles table
CREATE TABLE IF NOT EXISTS staff_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  email text,
  phone text,
  department text,
  position text,
  supervisor_id uuid REFERENCES users(id),
  hire_date date,
  profile_image_url text,
  skills text[],
  bio text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on-leave')),
  emergency_contact_name text,
  emergency_contact_phone text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Work progress tracking table
CREATE TABLE IF NOT EXISTS work_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text DEFAULT 'task' CHECK (category IN ('project', 'task', 'training', 'meeting', 'other')),
  status text DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed', 'on-hold', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  start_date date DEFAULT CURRENT_DATE,
  due_date date,
  completed_date date,
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  assigned_by uuid REFERENCES users(id),
  tags text[],
  notes text,
  attachments text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Staff performance tracking table
CREATE TABLE IF NOT EXISTS staff_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES users(id) ON DELETE CASCADE,
  period text NOT NULL, -- e.g., "2024-Q1", "2024-01"
  tasks_completed integer DEFAULT 0,
  tasks_on_time integer DEFAULT 0,
  average_rating decimal(3,2) DEFAULT 0.00,
  goals text[],
  achievements text[],
  areas_for_improvement text[],
  supervisor_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Junction table for submission-staff relationships
CREATE TABLE IF NOT EXISTS submission_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES submissions(id) ON DELETE CASCADE,
  staff_id uuid REFERENCES users(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  assigned_by uuid REFERENCES users(id),
  UNIQUE(submission_id, staff_id)
);

-- Add new columns to existing submissions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'submissions' AND column_name = 'department'
  ) THEN
    ALTER TABLE submissions ADD COLUMN department text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'submissions' AND column_name = 'impact'
  ) THEN
    ALTER TABLE submissions ADD COLUMN impact text DEFAULT 'medium' CHECK (impact IN ('low', 'medium', 'high'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'submissions' AND column_name = 'category'
  ) THEN
    ALTER TABLE submissions ADD COLUMN category text;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_staff ENABLE ROW LEVEL SECURITY;

-- RLS Policies for staff_profiles
CREATE POLICY "Users can view all staff profiles"
  ON staff_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON staff_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all profiles"
  ON staff_profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can insert own profile"
  ON staff_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for work_progress
CREATE POLICY "Users can view own work progress"
  ON work_progress FOR SELECT
  TO authenticated
  USING (staff_id = auth.uid());

CREATE POLICY "Admins can view all work progress"
  ON work_progress FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage work progress"
  ON work_progress FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Staff can update own progress"
  ON work_progress FOR UPDATE
  TO authenticated
  USING (staff_id = auth.uid());

-- RLS Policies for staff_performance
CREATE POLICY "Users can view own performance"
  ON staff_performance FOR SELECT
  TO authenticated
  USING (staff_id = auth.uid());

CREATE POLICY "Admins can manage all performance records"
  ON staff_performance FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for submission_staff
CREATE POLICY "Users can view submission staff assignments"
  ON submission_staff FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage submission staff assignments"
  ON submission_staff FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_staff_profiles_user_id ON staff_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_department ON staff_profiles(department);
CREATE INDEX IF NOT EXISTS idx_work_progress_staff_id ON work_progress(staff_id);
CREATE INDEX IF NOT EXISTS idx_work_progress_status ON work_progress(status);
CREATE INDEX IF NOT EXISTS idx_work_progress_due_date ON work_progress(due_date);
CREATE INDEX IF NOT EXISTS idx_staff_performance_staff_id ON staff_performance(staff_id);
CREATE INDEX IF NOT EXISTS idx_submission_staff_submission_id ON submission_staff(submission_id);
CREATE INDEX IF NOT EXISTS idx_submission_staff_staff_id ON submission_staff(staff_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_staff_profiles_updated_at BEFORE UPDATE ON staff_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_progress_updated_at BEFORE UPDATE ON work_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_performance_updated_at BEFORE UPDATE ON staff_performance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();