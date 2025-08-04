-- ONS Baby Names Database Schema for Baby Steps Planner
-- Add this to your existing Supabase project
-- Run this AFTER your existing schema.sql and blog_schema.sql

-- Core ONS names table with metadata
CREATE TABLE ons_baby_names (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    gender TEXT NOT NULL CHECK (gender IN ('boys', 'girls', 'unisex')),
    origin TEXT, -- e.g., 'Irish', 'Arabic', 'English', 'Sanskrit'
    meaning TEXT,
    cultural_category TEXT, -- e.g., 'Islamic', 'Celtic', 'Nature', 'Vintage'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Historical ONS rankings by year
CREATE TABLE ons_name_rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_id UUID REFERENCES ons_baby_names(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    rank INTEGER, -- NULL if not in top 100
    region TEXT DEFAULT 'England_Wales', -- For future expansion
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name_id, year, region)
);

-- Calculated ONS trends and predictions (updated periodically)
CREATE TABLE ons_name_trends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_id UUID REFERENCES ons_baby_names(id) ON DELETE CASCADE,
    current_rank INTEGER,
    previous_rank INTEGER,
    year_over_year_change INTEGER,
    five_year_change INTEGER,
    trend_category TEXT CHECK (trend_category IN ('RISING FAST', 'STRONG MOMENTUM', 'STABLE', 'COOLING', 'FALLING', 'NEW ENTRY')),
    prediction TEXT,
    momentum_score DECIMAL(5,2), -- Calculated momentum index
    cultural_influence_score DECIMAL(5,2), -- How much cultural events affect this name
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cultural events that influence ONS names (for analysis)
CREATE TABLE ons_cultural_influences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_name TEXT NOT NULL,
    event_type TEXT CHECK (event_type IN ('Movie', 'TV Show', 'Celebrity', 'Historical', 'Religious', 'Social Movement')),
    year INTEGER,
    description TEXT,
    affected_names TEXT[], -- Array of name IDs or names affected
    influence_strength INTEGER CHECK (influence_strength BETWEEN 1 AND 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ONS name popularity predictions (AI-generated)
CREATE TABLE ons_name_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_id UUID REFERENCES ons_baby_names(id) ON DELETE CASCADE,
    prediction_year INTEGER,
    predicted_rank INTEGER,
    confidence_score DECIMAL(5,2),
    prediction_type TEXT CHECK (prediction_type IN ('Conservative', 'Momentum', 'Cultural')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Universal blog analytics (for all interactive blog features)
CREATE TABLE blog_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interaction_type TEXT CHECK (interaction_type IN ('chart_hover', 'trend_search', 'prediction_tool', 'cta_click', 'page_view', 'tool_usage', 'name_search')),
    blog_post_slug TEXT, -- Which blog post generated this interaction
    name_involved TEXT, -- For name-specific interactions
    tool_section TEXT, -- Which interactive tool was used
    user_session TEXT, -- Anonymous session tracking
    additional_data JSONB DEFAULT '{}', -- Flexible data storage for different interaction types
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Name search tracking (part of blog analytics but separate for performance)
CREATE TABLE ons_name_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    searched_name TEXT NOT NULL,
    found BOOLEAN DEFAULT FALSE,
    user_session TEXT, -- Anonymous session tracking
    blog_post_slug TEXT DEFAULT 'baby-names-2024-real-time-analysis',
    search_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_ons_name_rankings_year ON ons_name_rankings(year);
CREATE INDEX idx_ons_name_rankings_rank ON ons_name_rankings(rank);
CREATE INDEX idx_ons_baby_names_gender ON ons_baby_names(gender);
CREATE INDEX idx_ons_baby_names_cultural_category ON ons_baby_names(cultural_category);
CREATE INDEX idx_ons_name_trends_trend_category ON ons_name_trends(trend_category);
CREATE INDEX idx_ons_name_trends_momentum_score ON ons_name_trends(momentum_score DESC);
CREATE INDEX idx_ons_name_searches_searched_name ON ons_name_searches(searched_name);
CREATE INDEX idx_blog_analytics_interaction_type ON blog_analytics(interaction_type);
CREATE INDEX idx_blog_analytics_blog_post_slug ON blog_analytics(blog_post_slug);

-- RLS (Row Level Security) policies
ALTER TABLE ons_baby_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE ons_name_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ons_name_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE ons_cultural_influences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ons_name_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ons_name_searches ENABLE ROW LEVEL SECURITY;

-- Public read access for blog data
CREATE POLICY "Public read access" ON ons_baby_names FOR SELECT USING (true);
CREATE POLICY "Public read access" ON ons_name_rankings FOR SELECT USING (true);
CREATE POLICY "Public read access" ON ons_name_trends FOR SELECT USING (true);
CREATE POLICY "Public read access" ON ons_cultural_influences FOR SELECT USING (true);
CREATE POLICY "Public read access" ON ons_name_predictions FOR SELECT USING (true);

-- Anonymous interaction tracking for blog analytics
CREATE POLICY "Anonymous blog analytics insert" ON blog_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Anonymous name search insert" ON ons_name_searches FOR INSERT WITH CHECK (true);

-- Admin-only write access for ONS name data (using service role or specific admin emails)
-- Note: Replace 'your-admin@email.com' with your actual admin email
CREATE POLICY "Admin read access" ON ons_baby_names FOR SELECT USING (
    auth.uid() IN (
        SELECT id FROM profiles WHERE email = 'your-admin@email.com'
    )
);

CREATE POLICY "Admin insert access" ON ons_baby_names FOR INSERT WITH CHECK (
    auth.uid() IN (
        SELECT id FROM profiles WHERE email = 'your-admin@email.com'
    )
);

CREATE POLICY "Admin update access" ON ons_baby_names FOR UPDATE USING (
    auth.uid() IN (
        SELECT id FROM profiles WHERE email = 'your-admin@email.com'
    )
) WITH CHECK (
    auth.uid() IN (
        SELECT id FROM profiles WHERE email = 'your-admin@email.com'
    )
);

CREATE POLICY "Admin delete access" ON ons_baby_names FOR DELETE USING (
    auth.uid() IN (
        SELECT id FROM profiles WHERE email = 'your-admin@email.com'
    )
);

-- Apply same admin policies to other ONS tables
CREATE POLICY "Admin insert access" ON ons_name_rankings FOR INSERT WITH CHECK (
    auth.uid() IN (
        SELECT id FROM profiles WHERE email = 'your-admin@email.com'
    )
);

CREATE POLICY "Admin update access" ON ons_name_rankings FOR UPDATE USING (
    auth.uid() IN (
        SELECT id FROM profiles WHERE email = 'your-admin@email.com'
    )
) WITH CHECK (
    auth.uid() IN (
        SELECT id FROM profiles WHERE email = 'your-admin@email.com'
    )
);

CREATE POLICY "Admin insert access" ON ons_name_trends FOR INSERT WITH CHECK (
    auth.uid() IN (
        SELECT id FROM profiles WHERE email = 'your-admin@email.com'
    )
);

CREATE POLICY "Admin update access" ON ons_name_trends FOR UPDATE USING (
    auth.uid() IN (
        SELECT id FROM profiles WHERE email = 'your-admin@email.com'
    )
) WITH CHECK (
    auth.uid() IN (
        SELECT id FROM profiles WHERE email = 'your-admin@email.com'
    )
);

-- Functions for common queries (updated for ONS tables)
CREATE OR REPLACE FUNCTION get_trending_names(
    trend_types TEXT[] DEFAULT ARRAY['RISING FAST', 'STRONG MOMENTUM'],
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    name TEXT,
    current_rank INTEGER,
    trend_category TEXT,
    year_over_year_change INTEGER,
    five_year_change INTEGER,
    gender TEXT,
    cultural_category TEXT,
    momentum_score DECIMAL(5,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bn.name,
        nt.current_rank,
        nt.trend_category,
        nt.year_over_year_change,
        nt.five_year_change,
        bn.gender,
        bn.cultural_category,
        nt.momentum_score
    FROM ons_baby_names bn
    JOIN ons_name_trends nt ON bn.id = nt.name_id
    WHERE nt.trend_category = ANY(trend_types)
    ORDER BY nt.momentum_score DESC, nt.five_year_change DESC
    LIMIT limit_count;
END;
$$;

CREATE OR REPLACE FUNCTION get_name_trajectory(name_input TEXT)
RETURNS TABLE (
    name TEXT,
    year INTEGER,
    rank INTEGER,
    trend_category TEXT,
    prediction TEXT,
    origin TEXT,
    meaning TEXT,
    cultural_category TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bn.name,
        nr.year,
        nr.rank,
        nt.trend_category,
        nt.prediction,
        bn.origin,
        bn.meaning,
        bn.cultural_category
    FROM ons_baby_names bn
    JOIN ons_name_rankings nr ON bn.id = nr.name_id
    LEFT JOIN ons_name_trends nt ON bn.id = nt.name_id
    WHERE LOWER(bn.name) = LOWER(name_input)
    ORDER BY nr.year;
END;
$$;

-- Function to track blog interactions (universal)
CREATE OR REPLACE FUNCTION track_blog_interaction(
    interaction_type_param TEXT,
    blog_post_slug_param TEXT DEFAULT 'baby-names-2024-real-time-analysis',
    name_involved_param TEXT DEFAULT NULL,
    tool_section_param TEXT DEFAULT NULL,
    user_session_param TEXT DEFAULT NULL,
    additional_data_param JSONB DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO blog_analytics (
        interaction_type,
        blog_post_slug,
        name_involved,
        tool_section,
        user_session,
        additional_data
    ) VALUES (
        interaction_type_param,
        blog_post_slug_param,
        name_involved_param,
        tool_section_param,
        user_session_param,
        additional_data_param
    );
END;
$$;

-- Function to calculate momentum score
CREATE OR REPLACE FUNCTION calculate_momentum_score(
    five_year_change INTEGER,
    year_over_year_change INTEGER,
    current_rank INTEGER
)
RETURNS DECIMAL(5,2)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Custom momentum algorithm
    -- Weights: 5-year change (40%), recent change (30%), current position bonus (30%)
    RETURN (
        (GREATEST(0, five_year_change) * 0.4) + 
        (GREATEST(0, year_over_year_change) * 0.3) + 
        (CASE 
            WHEN current_rank <= 50 THEN (100 - current_rank) * 0.3
            ELSE 0 
        END)
    );
END;
$$;

-- Insert sample cultural influences
INSERT INTO ons_cultural_influences (event_name, event_type, year, description, affected_names, influence_strength) VALUES
('Raya and the Last Dragon', 'Movie', 2021, 'Disney animated film featuring Southeast Asian princess', ARRAY['Raya'], 9),
('Mindfulness Movement', 'Social Movement', 2020, 'Growing interest in meditation and spiritual wellness', ARRAY['Bodhi', 'Zen', 'Sage'], 7),
('Celtic Heritage Revival', 'Social Movement', 2019, 'Renewed interest in Irish and Scottish culture', ARRAY['Maeve', 'Aoife', 'Finn'], 6),
('The Crown TV Series', 'TV Show', 2020, 'Popular Netflix series about British Royal Family', ARRAY['Elizabeth', 'Margaret', 'Diana'], 5),
('Bridgerton Series', 'TV Show', 2020, 'Period drama sparking vintage name revival', ARRAY['Anthony', 'Benedict', 'Eloise', 'Daphne'], 6);