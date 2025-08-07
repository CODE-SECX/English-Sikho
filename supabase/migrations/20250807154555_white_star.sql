/*
  # English Learning Application Database Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `color` (text, for UI theming)
      - `created_at` (timestamp)
    
    - `vocabulary`
      - `id` (uuid, primary key) 
      - `word` (text, unique)
      - `meaning` (text)
      - `context` (text)
      - `moment_of_memory` (text)
      - `date` (date)
      - `created_at` (timestamp)
    
    - `sikho`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `moment_of_memory` (text)
      - `category_id` (uuid, foreign key)
      - `date` (date)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (no authentication required)
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  color text DEFAULT '#059669',
  created_at timestamptz DEFAULT now()
);

-- Create vocabulary table
CREATE TABLE IF NOT EXISTS vocabulary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text UNIQUE NOT NULL,
  meaning text NOT NULL,
  context text DEFAULT '',
  moment_of_memory text DEFAULT '',
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Create sikho table
CREATE TABLE IF NOT EXISTS sikho (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  moment_of_memory text DEFAULT '',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE sikho ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Public access for categories"
  ON categories
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public access for vocabulary"
  ON vocabulary
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public access for sikho"
  ON sikho
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Insert some default categories
INSERT INTO categories (name, description, color) VALUES
  ('Grammar', 'English grammar rules and concepts', '#1e40af'),
  ('Conversation', 'Speaking and conversation practice', '#059669'),
  ('Reading', 'Reading comprehension and analysis', '#dc2626'),
  ('Writing', 'Writing techniques and practice', '#7c3aed')
ON CONFLICT (name) DO NOTHING;