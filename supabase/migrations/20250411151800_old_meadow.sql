/*
  # Initial Schema Setup for Buying Guide

  1. New Tables
    - `categories` - Product categories (laptop, TV, AC)
    - `flow_steps` - Steps in the buying guide flow
    - `flow_options` - Options for each step
    - `products` - Available products
    - `recommendations` - Product recommendations based on user selections
    
  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for admin write access
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create flow steps table
CREATE TABLE IF NOT EXISTS flow_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id),
  title text NOT NULL,
  description text,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create flow options table
CREATE TABLE IF NOT EXISTS flow_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id uuid REFERENCES flow_steps(id),
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id),
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  specifications jsonb,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id),
  flow_options jsonb NOT NULL,
  score integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access on categories" ON categories
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access on flow_steps" ON flow_steps
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access on flow_options" ON flow_options
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access on products" ON products
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access on recommendations" ON recommendations
  FOR SELECT TO public USING (true);

-- Insert initial categories
INSERT INTO categories (name, slug) VALUES
  ('Laptop', 'laptop'),
  ('TV', 'tv'),
  ('AC', 'ac');

-- Insert initial flow steps for laptop
INSERT INTO flow_steps (category_id, title, description, order_index)
SELECT 
  id as category_id,
  'Purpose' as title,
  'What will you use the laptop for?' as description,
  1 as order_index
FROM categories WHERE slug = 'laptop'
UNION ALL
SELECT 
  id as category_id,
  'Budget' as title,
  'What is your budget range?' as description,
  2 as order_index
FROM categories WHERE slug = 'laptop';

-- Insert initial flow steps for TV
INSERT INTO flow_steps (category_id, title, description, order_index)
SELECT 
  id as category_id,
  'Budget' as title,
  'What is your budget range?' as description,
  1 as order_index
FROM categories WHERE slug = 'tv'
UNION ALL
SELECT 
  id as category_id,
  'Size' as title,
  'What screen size are you looking for?' as description,
  2 as order_index
FROM categories WHERE slug = 'tv';