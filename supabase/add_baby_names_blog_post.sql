-- Add the Baby Names 2024 blog post to the existing blog system
-- Run this after your existing blog_schema.sql and the ONS baby names schema

-- Insert the baby names category if it doesn't exist
INSERT INTO blog_categories (name, slug, description, color)
VALUES ('Baby Names', 'baby-names', 'Name inspiration and trends', '#ddb3ff')
ON CONFLICT (slug) DO NOTHING;

-- Insert the baby names blog post
INSERT INTO blog_posts (
    title, 
    slug, 
    excerpt, 
    content, 
    featured_image_url,
    meta_description,
    tags,
    interactive_components,
    published,
    featured,
    published_at,
    author_id
) VALUES (
    'The Baby Names Everyone''s Actually Choosing in 2024 (Real-Time Analysis)',
    'baby-names-2024-real-time-analysis',
    'While everyone''s debating whether Muhammad or Noah will claim the #1 spot, our live ONS database reveals the names that have skyrocketed in popularity. One name jumped an incredible 348 positions in just five years – and it''s probably not on your radar yet.',
    '<!-- This will be rendered by the React component -->
    <div id="baby-names-blog-2024"></div>
    
    <script>
    // The interactive content will be rendered by the BabyNamesBlog2024 React component
    // This ensures SEO content while providing full interactivity with live ONS data
    </script>',
    'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    'Discover the baby names with the most dramatic momentum in 2024. Real-time ONS analysis reveals which names are skyrocketing in popularity and the cultural trends driving the changes.',
    ARRAY['baby names', '2024', 'trends', 'analysis', 'data', 'ONS', 'statistics', 'predictions', 'cultural patterns', 'interactive', 'UK baby names', 'England Wales'],
    '["BabyNamesBlog2024"]'::jsonb,
    true,
    true,
    NOW(),
    (SELECT id FROM profiles LIMIT 1) -- Gets first user as author
);

-- Link the post to the baby names category
INSERT INTO blog_post_categories (post_id, category_id)
SELECT 
    (SELECT id FROM blog_posts WHERE slug = 'baby-names-2024-real-time-analysis'),
    (SELECT id FROM blog_categories WHERE slug = 'baby-names');

-- Add comprehensive SEO-friendly content for when JavaScript is disabled
UPDATE blog_posts 
SET content = '
<div class="baby-names-seo-content">
    <h2>The 5-Year Name Revolution: Real ONS Data Analysis</h2>
    
    <p>Our comprehensive analysis of official ONS (Office for National Statistics) data from 2019-2024 reveals unprecedented changes in baby naming trends across England and Wales. While traditional rankings focus on the top 10, the most dramatic stories are happening in the 20-100 range where smart parents are finding distinctive names before they become "everywhere."</p>
    
    <div class="highlight-box">
        <h3>🚀 The Record Breaker: Raya''s 348-Position Jump</h3>
        <p>From #430 in 2019 to #82 in 2024, Disney''s "Raya and the Last Dragon" created the largest single naming influence in modern UK history. This isn''t just a trend – it''s a cultural phenomenon reshaping baby naming forever.</p>
    </div>
    
    <h3>The Biggest Movers of 2024</h3>
    
    <h4>Girls Names on the Rise:</h4>
    <ul>
        <li><strong>Raya</strong> - #82 (up from #430 in 2019) - Disney influence driving 348-position gain</li>
        <li><strong>Maeve</strong> - #26 (up from #218 in 2019) - Irish heritage revival with 192-position jump</li>
        <li><strong>Eden</strong> - #60 (up 27 positions from 2023) - Nature names gaining momentum</li>
        <li><strong>Margot</strong> - #28 (up 16 positions from 2023) - Vintage sophistication trend</li>
        <li><strong>Elodie</strong> - #55 (up 20 positions from 2023) - French elegance rising</li>
        <li><strong>Maryam</strong> - #57 (up 20 positions from 2023) - Islamic heritage strength</li>
    </ul>
    
    <h4>Boys Names with Momentum:</h4>
    <ul>
        <li><strong>Yahya</strong> - #93 (up 33 positions from 2023) - Islamic names showing unprecedented strength</li>
        <li><strong>Bodhi</strong> - #97 (up from #192 in 2019) - Spiritual wellness influence with 95-position climb</li>
        <li><strong>Jude</strong> - #11 (up from #57 in 2019) - Classic revival with modern appeal</li>
        <li><strong>Hudson</strong> - #42 (up from #92 in 2019) - International influence growing strong</li>
        <li><strong>Enzo</strong> - #92 (up from #181 in 2019) - Italian sophistication with 89-position jump</li>
        <li><strong>Vinnie</strong> - #91 (up 20 positions from 2023) - Vintage charm returning</li>
    </ul>
    
    <h3>Cultural Patterns Driving Change</h3>
    
    <p>Our analysis identifies three major cultural movements influencing baby names in 2024:</p>
    
    <div class="pattern-grid">
        <div class="pattern-item">
            <h4>🎬 Pop Culture Impact</h4>
            <p>Disney''s "Raya and the Last Dragon" created the largest single naming influence in modern UK history. The 348-position jump proves that quality storytelling can reshape cultural preferences permanently.</p>
        </div>
        
        <div class="pattern-item">
            <h4>🍀 Heritage Revival</h4>
            <p>Irish names like Maeve and Aoife are experiencing unprecedented growth as parents seek meaningful connections to Celtic culture. This isn''t just trend-following – it''s identity reclamation.</p>
        </div>
        
        <div class="pattern-item">
            <h4>🧘 Spiritual Wellness</h4>
            <p>Names like Bodhi reflect the growing interest in mindfulness and spirituality. The wellness movement has moved beyond lifestyle into how we name our children.</p>
        </div>
        
        <div class="pattern-item">
            <h4>🕌 Islamic Renaissance</h4>
            <p>With Muhammad at #1 and Yahya showing massive growth, Islamic names are demonstrating cultural strength across all ranking levels, not just the top spot.</p>
        </div>
    </div>
    
    <h3>The "Sweet Spot" Strategy</h3>
    
    <p>The smartest parents aren''t choosing from the top 10. They''re identifying names in the 20-60 range that show strong upward momentum. These names offer the perfect balance: recognisable and pronounceable, but not "too popular."</p>
    
    <div class="sweet-spot-examples">
        <h4>Boys'' Sweet Spot Names (Strong Momentum, Not Oversaturated):</h4>
        <ul>
            <li><strong>Jude</strong> - #11 (perfect positioning with classic appeal)</li>
            <li><strong>Hudson</strong> - #42 (50-position climb in 5 years)</li>
            <li><strong>Oakley</strong> - #34 (nature trend with masculine strength)</li>
            <li><strong>Sonny</strong> - #51 (vintage charm with modern edge)</li>
        </ul>
        
        <h4>Girls'' Sweet Spot Names (Rising But Not Peaked):</h4>
        <ul>
            <li><strong>Margot</strong> - #28 (66-position climb showing vintage appeal)</li>
            <li><strong>Maeve</strong> - #26 (Celtic heritage with contemporary sound)</li>
            <li><strong>Eden</strong> - #60 (nature beauty with spiritual undertones)</li>
            <li><strong>Elodie</strong> - #55 (French sophistication gaining momentum)</li>
        </ul>
    </div>
    
    <h3>Interactive Tools Available</h3>
    
    <p>This article includes real-time interactive tools powered by our live ONS database:</p>
    <ul>
        <li><strong>Live Trend Checker</strong> - Instant lookups for any name in our database with cultural insights</li>
        <li><strong>5-Year Trajectory Visualizer</strong> - Animated charts showing dramatic position changes</li>
        <li><strong>AI-Powered Predictor</strong> - Future ranking predictions through 2027</li>
        <li><strong>Cultural Pattern Recognition</strong> - Understanding the movements behind the numbers</li>
        <li><strong>Real-Time Ranking Updates</strong> - Always current with latest ONS releases</li>
    </ul>
    
    <h3>Looking Ahead: 2025 Predictions</h3>
    
    <p>Based on our trajectory analysis and cultural pattern recognition, here are our predictions for next year''s trending names:</p>
    
    <div class="predictions-grid">
        <div class="prediction-category">
            <h4>Names to Watch - Boys (2025 Predictions):</h4>
            <ul>
                <li><strong>Bodhi:</strong> Breaking into top 70 (spiritual wellness trend)</li>
                <li><strong>Enzo:</strong> Cracking top 80 (international appeal)</li>
                <li><strong>Yahya:</strong> Climbing to top 75 (Islamic strength continuing)</li>
                <li><strong>Atlas:</strong> New entry potential (mythological trend)</li>
            </ul>
        </div>
        
        <div class="prediction-category">
            <h4>Names to Watch - Girls (2025 Predictions):</h4>
            <ul>
                <li><strong>Elodie:</strong> Rising to top 45 (vintage French appeal)</li>
                <li><strong>Margot:</strong> Climbing to top 25 (sophisticated charm)</li>
                <li><strong>Raya:</strong> Continuing upward to top 70 (sustained Disney effect)</li>
                <li><strong>Eden:</strong> Moving to top 45 (nature trend strength)</li>
            </ul>
        </div>
    </div>
    
    <div class="methodology-note">
        <h3>📊 Our Methodology</h3>
        <p>This analysis uses official ONS data from 2019-2024, covering over 42 carefully selected names representing all major cultural categories. Our momentum algorithms factor in 5-year changes, year-over-year movement, current positioning, and cultural influence scores to provide the most comprehensive baby naming analysis available in the UK.</p>
    </div>
    
    <div class="cta-section">
        <h3>Start Your Baby Name Journey</h3>
        <p>Ready to find the perfect name for your little one? Use Baby Steps Planner to create shared name lists, vote with your partner, and track your favourites over time. Our platform combines the data insights you''ve just seen with practical tools for modern couples planning their families.</p>
        
        <div class="cta-features">
            <ul>
                <li>🗳️ <strong>Partner Voting</strong> - Rate names privately, then see where you align</li>
                <li>📈 <strong>Trend Tracking</strong> - Monitor how your favourites are moving in real-time</li>
                <li>💭 <strong>Notes & Memories</strong> - Capture why certain names speak to you</li>
                <li>👨‍👩‍👧‍👦 <strong>Family Sharing</strong> - Get input from trusted family members when you''re ready</li>
            </ul>
        </div>
        
        <a href="/" class="cta-button">Explore Baby Names in Baby Steps Planner →</a>
    </div>
    
    <div class="sources-section">
        <h3>📚 Sources & Related Reading</h3>
        <p><strong>Data Sources:</strong> Office for National Statistics Baby Names in England and Wales 2024, Baby Steps Planner trend analysis database, cultural pattern recognition research.</p>
        
        <div class="related-links">
            <h4>Related Articles:</h4>
            <ul>
                <li><a href="/blog/baby-budget-guide-uk-2025">The Complete Baby Budget Guide: Real UK Costs for 2025</a></li>
                <li><a href="/blog/hospital-bag-checklist">Hospital Bag Checklist: What You Actually Need</a></li>
                <li><a href="/blog/partner-pregnancy-planning">Partner Pregnancy Planning: Tools for Modern Couples</a></li>
            </ul>
        </div>
    </div>
</div>

<div id="baby-names-blog-2024"></div>

<script>
// The full interactive experience will be rendered here by React
// when JavaScript is enabled, replacing the SEO content above
console.log("Baby Names 2024 blog post loaded - preparing interactive components");
</script>

<style>
.baby-names-seo-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    line-height: 1.6;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.baby-names-seo-content h2, .baby-names-seo-content h3, .baby-names-seo-content h4 {
    color: #2d3748;
    margin-top: 2em;
    margin-bottom: 1em;
}

.baby-names-seo-content h2 {
    font-size: 2em;
    border-bottom: 3px solid #ff9faa;
    padding-bottom: 0.5em;
}

.baby-names-seo-content ul, .baby-names-seo-content ol {
    margin: 1em 0;
    padding-left: 2em;
}

.baby-names-seo-content li {
    margin: 0.5em 0;
}

.highlight-box {
    background: linear-gradient(135deg, #ff9faa 0%, #ddb3ff 100%);
    padding: 20px;
    border-radius: 10px;
    color: white;
    margin: 30px 0;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.highlight-box h3 {
    margin-top: 0;
    color: white;
}

.pattern-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin: 30px 0;
}

.pattern-item {
    background: #f8fafc;
    padding: 20px;
    border-radius: 8px;
    border-left: 4px solid #ff9faa;
}

.pattern-item h4 {
    margin-top: 0;
    color: #6366f1;
}

.sweet-spot-examples {
    background: #eff6ff;
    padding: 25px;
    border-radius: 10px;
    margin: 30px 0;
    border: 2px solid #3b82f6;
}

.predictions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 25px;
    margin: 30px 0;
}

.prediction-category {
    background: #f0fdf4;
    padding: 20px;
    border-radius: 8px;
    border: 2px solid #22c55e;
}

.methodology-note {
    background: #fafafa;
    padding: 20px;
    border-radius: 8px;
    border-left: 4px solid #8b5cf6;
    margin: 40px 0;
}

.cta-section {
    background: linear-gradient(135deg, #ff9faa 0%, #a78bfa 100%);
    padding: 40px;
    border-radius: 15px;
    text-align: center;
    color: white;
    margin: 50px 0;
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.cta-section h3 {
    color: white;
    margin-top: 0;
}

.cta-features {
    text-align: left;
    max-width: 500px;
    margin: 0 auto 30px auto;
}

.cta-features ul {
    list-style: none;
    padding: 0;
}

.cta-features li {
    margin: 15px 0;
    padding-left: 0;
}

.cta-button {
    display: inline-block;
    background: white;
    color: #6366f1;
    padding: 15px 30px;
    border-radius: 10px;
    text-decoration: none;
    font-weight: bold;
    font-size: 1.1em;
    margin-top: 20px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    transition: all 0.2s ease;
}

.cta-button:hover {
    background: #f8fafc;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

.sources-section {
    background: #f1f5f9;
    padding: 25px;
    border-radius: 8px;
    margin-top: 50px;
    font-size: 0.95em;
}

.sources-section h3, .sources-section h4 {
    color: #475569;
}

.related-links ul {
    list-style-type: none;
    padding-left: 0;
}

.related-links li {
    margin: 10px 0;
}

.related-links a {
    color: #6366f1;
    text-decoration: none;
    font-weight: 500;
}

.related-links a:hover {
    text-decoration: underline;
}

@media (max-width: 768px) {
    .baby-names-seo-content {
        padding: 15px;
    }
    
    .pattern-grid, .predictions-grid {
        grid-template-columns: 1fr;
    }
    
    .cta-section {
        padding: 30px 20px;
    }
}
</style>'
WHERE slug = 'baby-names-2024-real-time-analysis';