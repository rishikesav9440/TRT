/*
  # Add conditional flow relationships

  1. New Tables
    - `flow_conditions`
      - `id` (uuid, primary key)
      - `option_id` (uuid, references flow_options)
      - `next_step_id` (uuid, references flow_steps)
      - `created_at` (timestamp)

  2. Changes
    - Add `parent_option_id` to `flow_steps` table to track which option triggered this step
    - Add `is_conditional` to `flow_steps` to identify steps that appear based on conditions

  3. Security
    - Enable RLS on new table
    - Add policies for public read access
*/

-- Add parent_option_id and is_conditional to flow_steps
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'flow_steps' AND column_name = 'parent_option_id'
  ) THEN
    ALTER TABLE flow_steps ADD COLUMN parent_option_id uuid REFERENCES flow_options(id);
    ALTER TABLE flow_steps ADD COLUMN is_conditional boolean DEFAULT false;
  END IF;
END $$;

-- Create flow_conditions table
CREATE TABLE IF NOT EXISTS flow_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id uuid REFERENCES flow_options(id) NOT NULL,
  next_step_id uuid REFERENCES flow_steps(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE flow_conditions ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Allow public read access on flow_conditions"
  ON flow_conditions
  FOR SELECT
  TO public
  USING (true);