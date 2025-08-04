-- Blog System Schema for Baby Steps
-- Run this after your existing schema.sql

-- Blog posts table
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    featured_image_url TEXT,
    meta_description TEXT,
    tags TEXT[] DEFAULT '{}', -- Array of tags for categorization
    interactive_components JSONB DEFAULT '[]'::jsonb, -- Components to render
    published BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    author_id UUID REFERENCES profiles(id),
    views_count INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Blog categories
CREATE TABLE blog_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#ff9faa', -- Match your pink theme
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Post categories junction table
CREATE TABLE blog_post_categories (
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES blog_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, category_id)
);

-- Blog analytics
CREATE TABLE blog_post_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_ip TEXT, -- For basic analytics
    referrer TEXT
);

-- Indexes for performance
CREATE INDEX idx_blog_posts_published ON blog_posts(published, published_at DESC);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_featured ON blog_posts(featured, published_at DESC);
CREATE INDEX idx_blog_post_views_post_id ON blog_post_views(post_id);

-- Function to increment post views
CREATE OR REPLACE FUNCTION increment_post_views(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE blog_posts 
    SET views_count = views_count + 1 
    WHERE id = post_id;
    
    INSERT INTO blog_post_views (post_id, user_ip, referrer)
    VALUES (post_id, '', ''); -- You can capture actual IP/referrer if needed
END;
$$;

-- Function to get related posts
CREATE OR REPLACE FUNCTION get_related_posts(
    current_post_id UUID,
    limit_count INTEGER DEFAULT 3
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    slug TEXT,
    excerpt TEXT,
    featured_image_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.slug,
        p.excerpt,
        p.featured_image_url,
        p.published_at
    FROM blog_posts p
    WHERE p.published = true 
      AND p.id != current_post_id
    ORDER BY p.views_count DESC, p.published_at DESC
    LIMIT limit_count;
END;
$$;

-- Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_views ENABLE ROW LEVEL SECURITY;

-- Policies for blog_posts
CREATE POLICY "Blog posts are viewable by everyone" ON blog_posts
    FOR SELECT USING (published = true);

CREATE POLICY "Admin can manage all blog posts" ON blog_posts
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM profiles WHERE email LIKE '%@yourdomain.com' -- Replace with your admin email domain
    ));

-- Policies for blog_categories
CREATE POLICY "Blog categories are viewable by everyone" ON blog_categories
    FOR SELECT USING (true);

CREATE POLICY "Admin can manage blog categories" ON blog_categories
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM profiles WHERE email LIKE '%@yourdomain.com' -- Replace with your admin email domain
    ));

-- Policies for blog_post_categories
CREATE POLICY "Blog post categories are viewable by everyone" ON blog_post_categories
    FOR SELECT USING (true);

CREATE POLICY "Admin can manage blog post categories" ON blog_post_categories
    FOR ALL USING (auth.uid() IN (
        SELECT id FROM profiles WHERE email LIKE '%@yourdomain.com' -- Replace with your admin email domain
    ));

-- Policies for blog_post_views
CREATE POLICY "Blog post views are insertable by everyone" ON blog_post_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can view analytics" ON blog_post_views
    FOR SELECT USING (auth.uid() IN (
        SELECT id FROM profiles WHERE email LIKE '%@yourdomain.com' -- Replace with your admin email domain
    ));

-- Seed initial categories
INSERT INTO blog_categories (name, slug, description, color) VALUES
('Budget Planning', 'budget-planning', 'Tips for planning your baby budget', '#ff9faa'),
('Pregnancy Journey', 'pregnancy-journey', 'Week-by-week pregnancy guidance', '#a8d8ea'),
('Baby Gear', 'baby-gear', 'Essential items and product reviews', '#b8e6b8'),
('Hospital Prep', 'hospital-prep', 'Hospital bag and birth preparation', '#ffd6a5'),
('Baby Names', 'baby-names', 'Name inspiration and trends', '#ddb3ff'),
('Health & Wellness', 'health-wellness', 'Pregnancy health and wellness tips', '#ffb3ba');

-- Sample blog post (you can remove this after testing)
INSERT INTO blog_posts (
    title, 
    slug, 
    excerpt, 
    content, 
    featured_image_url,
    meta_description,
    tags,
    published,
    featured,
    published_at,
    author_id
) VALUES (
    'Complete Baby Budget Planning Guide: How Much Does a Baby Really Cost?',
    'complete-baby-budget-planning-guide',
    'Discover the real costs of having a baby and learn how to create a realistic budget for your growing family. Our comprehensive guide covers everything from essentials to unexpected expenses.',
    '<h2>The Reality of Baby Costs</h2>
    <p>Having a baby is one of life''s greatest joys, but it also comes with significant financial considerations. Many new parents are surprised by the true cost of raising a child, especially in the first year.</p>
    
    <h3>Essential Categories to Budget For</h3>
    <ul>
        <li><strong>Baby Gear:</strong> Cot, pram, car seat, high chair (£800-£2,000)</li>
        <li><strong>Clothes:</strong> Newborn to 12 months (£200-£500)</li>
        <li><strong>Feeding:</strong> Formula, bottles, weaning supplies (£300-£800)</li>
        <li><strong>Nappies & Toiletries:</strong> First year supply (£400-£600)</li>
        <li><strong>Healthcare:</strong> Private scans, vitamins, baby classes (£200-£800)</li>
    </ul>
    
    <p>The total cost can range from £2,000 to £5,000 in the first year, but with smart planning and our interactive budget calculator, you can prepare financially for your little one''s arrival.</p>
    
    <h3>Money-Saving Tips</h3>
    <p>Start budgeting early, consider second-hand options for larger items, and take advantage of family and friends who may have outgrown baby items. Remember, babies don''t need everything immediately - you can spread purchases over time.</p>',
    'https://images.unsplash.com/photo-1560958412-0a47db5eea3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    'Complete guide to baby budget planning. Learn real costs and create a realistic budget for your baby with our interactive calculator.',
    ARRAY['budget', 'planning', 'costs', 'financial', 'baby'],
    true,
    true,
    now(),
    (SELECT id FROM profiles LIMIT 1) -- Gets first user as author
);

-- Link the sample post to budget category
INSERT INTO blog_post_categories (post_id, category_id)
SELECT 
    (SELECT id FROM blog_posts WHERE slug = 'complete-baby-budget-planning-guide'),
    (SELECT id FROM blog_categories WHERE slug = 'budget-planning');
