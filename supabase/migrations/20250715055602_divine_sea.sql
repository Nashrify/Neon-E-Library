/*
# Create resources table for Neon-Library

1. New Tables
  - `resources`
    - `id` (uuid, primary key)
    - `title` (text, required)
    - `description` (text, required)
    - `subject` (text, required)
    - `level` (text, required)
    - `category` (text, required)
    - `file_url` (text, required)
    - `file_type` (text, required)
    - `download_count` (integer, default 0)
    - `created_at` (timestamp)
    - `updated_at` (timestamp)

2. Security
  - Enable RLS on `resources` table
  - Add policy for public read access
  - Add policy for authenticated users to manage content

3. Storage
  - Create storage bucket for file uploads
  - Configure public access for downloads
*/

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  subject text NOT NULL,
  level text NOT NULL,
  category text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  download_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all resources
CREATE POLICY "Public can read resources"
  ON resources
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert resources
CREATE POLICY "Authenticated users can insert resources"
  ON resources
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update resources
CREATE POLICY "Authenticated users can update resources"
  ON resources
  FOR UPDATE
  TO authenticated
  USING (true);

-- Allow authenticated users to delete resources
CREATE POLICY "Authenticated users can delete resources"
  ON resources
  FOR DELETE
  TO authenticated
  USING (true);

-- Create storage bucket for library files
INSERT INTO storage.buckets (id, name, public)
VALUES ('library-files', 'library-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for public access
CREATE POLICY "Public can view library files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'library-files');

-- Create storage policy for authenticated uploads
CREATE POLICY "Authenticated can upload library files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'library-files');

-- Create storage policy for authenticated updates
CREATE POLICY "Authenticated can update library files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'library-files');

-- Create storage policy for authenticated deletes
CREATE POLICY "Authenticated can delete library files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'library-files');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();