/*
  # Add Language Column to Tables

  1. Schema Changes
    - Add `language` column to `vocabulary` table
    - Add `language` column to `sikho` table
    - Set default language as 'English'
    - Add index for better performance on language filtering

  2. Data Migration
    - Update existing records to have 'English' as default language

  3. No RLS changes needed (existing policies cover new column)
*/

-- Add language column to vocabulary table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vocabulary' AND column_name = 'language'
  ) THEN
    ALTER TABLE vocabulary ADD COLUMN language text DEFAULT 'English' NOT NULL;
  END IF;
END $$;

-- Add language column to sikho table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sikho' AND column_name = 'language'
  ) THEN
    ALTER TABLE sikho ADD COLUMN language text DEFAULT 'English' NOT NULL;
  END IF;
END $$;

-- Update existing records to have English as default language
UPDATE vocabulary SET language = 'English' WHERE language IS NULL;
UPDATE sikho SET language = 'English' WHERE language IS NULL;

-- Add indexes for better performance on language filtering
CREATE INDEX IF NOT EXISTS idx_vocabulary_language ON vocabulary(language);
CREATE INDEX IF NOT EXISTS idx_sikho_language ON sikho(language);