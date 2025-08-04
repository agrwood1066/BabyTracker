-- ONS Baby Names Blog Post Database Setup
-- This file contains sample data for the trending names featured in the blog post

-- Sample data for ons_baby_names table
INSERT INTO ons_baby_names (name, gender, origin, meaning, cultural_category) VALUES
-- Rising Fast Names
('Raya', 'girls', 'Sanskrit/Disney', 'Ray of light', 'Cultural'),
('Bodhi', 'boys', 'Sanskrit', 'Awakening, enlightenment', 'Spiritual'),
('Maeve', 'girls', 'Irish', 'She who intoxicates', 'Celtic'),
('Enzo', 'boys', 'Italian', 'Ruler of the estate', 'International'),
('Eden', 'girls', 'Hebrew', 'Paradise, delight', 'Nature'),
('Margot', 'girls', 'French', 'Pearl', 'Vintage'),
('Jude', 'boys', 'Hebrew', 'Praised', 'Classic Revival'),
('Hudson', 'boys', 'English', 'Son of Hugh', 'Modern'),

-- Other trending names mentioned
('Yahya', 'boys', 'Arabic', 'God is gracious', 'Islamic'),
('Vinnie', 'boys', 'Latin', 'Conquering', 'Modern'),
('Elias', 'boys', 'Hebrew', 'The Lord is my God', 'Classic'),
('Nathan', 'boys', 'Hebrew', 'Gift from God', 'Classic'),
('Mohammad', 'boys', 'Arabic', 'Praiseworthy', 'Islamic'),
('Eloise', 'girls', 'French', 'Healthy, wide', 'Vintage'),
('Elodie', 'girls', 'French', 'Foreign riches', 'International'),
('Maryam', 'girls', 'Arabic', 'Beloved', 'Islamic'),

-- Top stable names
('Muhammad', 'boys', 'Arabic', 'Praiseworthy', 'Islamic'),
('Olivia', 'girls', 'Latin', 'Olive tree', 'Classic'),
('Noah', 'boys', 'Hebrew', 'Rest, comfort', 'Classic'),
('Amelia', 'girls', 'Germanic', 'Work, industrious', 'Classic'),
('Oliver', 'boys', 'Latin', 'Olive tree', 'Classic'),
('Lily', 'girls', 'English', 'Lily flower', 'Nature'),
('Arthur', 'boys', 'Celtic', 'Bear', 'Classic'),
('Isla', 'girls', 'Scottish', 'Island', 'Celtic'),

-- Falling names mentioned
('Hunter', 'boys', 'English', 'One who hunts', 'Modern')
ON CONFLICT (name) DO UPDATE SET
  gender = EXCLUDED.gender,
  origin = EXCLUDED.origin,
  meaning = EXCLUDED.meaning,
  cultural_category = EXCLUDED.cultural_category;

-- Sample data for ons_name_trends table
-- Get the name IDs first and insert trend data
INSERT INTO ons_name_trends (
  name_id, 
  current_rank, 
  previous_rank, 
  year_over_year_change, 
  five_year_change, 
  trend_category, 
  prediction,
  momentum_score,
  cultural_influence_score
)
SELECT 
  n.id,
  t.current_rank,
  t.previous_rank,
  t.year_over_year_change,
  t.five_year_change,
  t.trend_category,
  t.prediction,
  t.momentum_score,
  t.cultural_influence_score
FROM ons_baby_names n
JOIN (VALUES
  -- Rising Fast Names (for the chart)
  ('Raya', 82, 100, 18, 348, 'RISING FAST', 'Top 60 by 2026', 142.4, 95.0),
  ('Bodhi', 97, 110, 13, 95, 'RISING FAST', 'Top 70 by 2025', 139.9, 88.5),
  ('Maeve', 26, 40, 14, 192, 'RISING FAST', 'Top 20 by 2026', 84.8, 92.0),
  ('Enzo', 92, 110, 18, 89, 'RISING FAST', 'Top 80 by 2025', 78.3, 85.0),
  ('Eden', 60, 87, 27, 27, 'RISING FAST', 'Top 45 by 2026', 72.8, 78.0),
  ('Margot', 28, 44, 16, 66, 'STRONG MOMENTUM', 'Top 25 by 2025', 67.2, 82.0),
  ('Jude', 11, 18, 7, 46, 'STRONG MOMENTUM', 'Top 10 by 2026', 64.7, 90.0),
  ('Hudson', 42, 52, 10, 50, 'STRONG MOMENTUM', 'Top 35 by 2025', 57.4, 75.0),
  
  -- Other trending names
  ('Yahya', 93, 126, 33, 85, 'RISING FAST', 'Top 70 by 2026', 95.5, 88.0),
  ('Vinnie', 91, 111, 20, 62, 'RISING FAST', 'Top 80 by 2025', 85.3, 72.0),
  ('Elias', 79, 96, 17, 58, 'STRONG MOMENTUM', 'Top 65 by 2025', 76.8, 80.0),
  ('Nathan', 88, 102, 14, 42, 'STRONG MOMENTUM', 'Top 75 by 2025', 68.4, 78.0),
  ('Mohammad', 53, 68, 15, 45, 'STRONG MOMENTUM', 'Top 45 by 2025', 72.1, 85.0),
  ('Eloise', 85, 109, 24, 71, 'RISING FAST', 'Top 70 by 2025', 88.2, 78.0),
  ('Elodie', 55, 75, 20, 65, 'RISING FAST', 'Top 40 by 2026', 82.4, 84.0),
  ('Maryam', 57, 77, 20, 52, 'RISING FAST', 'Top 45 by 2026', 79.6, 86.0),
  
  -- Top stable names
  ('Muhammad', 1, 2, 1, 2, 'STABLE', 'Maintaining #1 position', 45.2, 98.0),
  ('Olivia', 1, 1, 0, 0, 'STABLE', 'Holding top 3 through 2027', 40.1, 95.0),
  ('Noah', 2, 1, -1, 3, 'STABLE', 'Stable top 3', 42.3, 93.0),
  ('Amelia', 2, 2, 0, 0, 'STABLE', 'Stable top 3', 39.8, 92.0),
  ('Oliver', 3, 3, 0, 1, 'STABLE', 'Stable top 5', 38.5, 91.0),
  ('Lily', 3, 4, 1, -1, 'STABLE', 'Stable top 5', 37.2, 89.0),
  ('Arthur', 4, 5, 1, 3, 'STABLE', 'Stable top 5', 36.9, 88.0),
  ('Isla', 4, 3, -1, 2, 'STABLE', 'Stable top 5', 35.7, 90.0),
  
  -- Falling names
  ('Hunter', 78, 57, -21, -35, 'FALLING', 'Continuing decline', 25.3, 65.0)
) AS t(name, current_rank, previous_rank, year_over_year_change, five_year_change, trend_category, prediction, momentum_score, cultural_influence_score)
ON n.name = t.name
ON CONFLICT (name_id) DO UPDATE SET
  current_rank = EXCLUDED.current_rank,
  previous_rank = EXCLUDED.previous_rank,
  year_over_year_change = EXCLUDED.year_over_year_change,
  five_year_change = EXCLUDED.five_year_change,
  trend_category = EXCLUDED.trend_category,
  prediction = EXCLUDED.prediction,
  momentum_score = EXCLUDED.momentum_score,
  cultural_influence_score = EXCLUDED.cultural_influence_score,
  updated_at = now();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ons_name_trends_category ON ons_name_trends(trend_category);
CREATE INDEX IF NOT EXISTS idx_ons_name_trends_momentum ON ons_name_trends(momentum_score DESC);
CREATE INDEX IF NOT EXISTS idx_ons_baby_names_name_lower ON ons_baby_names(LOWER(name));

-- Enable Row Level Security (if needed)
ALTER TABLE ons_baby_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE ons_name_trends ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to ons_baby_names" ON ons_baby_names
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to ons_name_trends" ON ons_name_trends
  FOR SELECT USING (true);
