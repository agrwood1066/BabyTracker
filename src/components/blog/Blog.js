import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { BlogListingSEO } from './BlogSEO';
import { 
  Calendar, 
  Clock, 
  Eye, 
  Share2, 
  Search,
  Filter,
  TrendingUp,
  Heart,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import './Blog.css';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchPosts();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, searchTerm]);

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          profiles(full_name),
          blog_post_categories(blog_categories(name, slug, color))
        `)
        .eq('published', true)
        .order('published_at', { ascending: false });

      if (selectedCategory !== 'all') {
        // For category filtering, we'll need to join through the junction table
        const { data: categoryPosts } = await supabase
          .from('blog_post_categories')
          .select('post_id')
          .in('category_id', [
            await supabase
              .from('blog_categories')
              .select('id')
              .eq('slug', selectedCategory)
              .single()
              .then(res => res.data?.id)
          ]);
        
        if (categoryPosts) {
          const postIds = categoryPosts.map(cp => cp.post_id);
          query = query.in('id', postIds);
        }
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (!error && data) {
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const incrementViews = async (postId) => {
    try {
      await supabase.rpc('increment_post_views', { post_id: postId });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const sharePost = async (post) => {
    const url = `${window.location.origin}/blog/${post.slug}`;
    const title = post.title;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: post.excerpt,
          url: url,
        });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url);
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getReadingTime = (content) => {
    const words = content.replace(/<[^>]*>/g, '').split(' ').length;
    const readingTime = Math.ceil(words / 200); // Average reading speed
    return `${readingTime} min read`;
  };

  // Static posts that don't come from database
  const staticPosts = [
    {
      id: 'baby-names-2024',
      title: "Everyone's Obsessing Over the Top 10 Baby Names, But We Found those Flying Under the Radar in 2024",
      slug: 'baby-names-2024-under-radar',
      excerpt: "One name has jumped 348 spots in five years! Our research reveals which under-the-radar names are climbing the rankings - and where they'll be in five years with our new Predictor tool.",
      featured_image_url: '/images/baby-names-trend.png',
      published_at: '2025-08-01T00:00:00Z',
      views_count: 0,
      content: '',
      featured: true,
      interactive_components: ['predictor', 'chart'],
      blog_post_categories: [{
        blog_categories: {
          name: 'UK Baby Names 2024',
          slug: 'baby-names',
          color: '#ff6b9d'
        }
      }]
    }
  ];

  // Combine static posts with database posts
  const allPosts = [...staticPosts, ...posts];

  if (loading) {
    return (
      <div className="blog-loading">
        <div className="loading-spinner"></div>
        <p>Loading blog posts...</p>
      </div>
    );
  }

  const featuredPost = allPosts.find(post => post.featured);
  const regularPosts = allPosts.filter(post => !post.featured);

  return (
    <div className="blog-container">
      <BlogListingSEO />
      {/* Hero Section */}
      <div className="blog-hero">
        <div className="hero-content">
          <h1>Baby Steps Blog</h1>
          <p>Expert tips, interactive tools, and guides for your pregnancy journey</p>
          
          {/* Search & Filter */}
          <div className="blog-filters">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="category-filter">
              <Filter size={16} />
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Post */}
      {featuredPost && (
        <div className="featured-post">
          <div className="featured-badge">
            <TrendingUp size={16} />
            Featured
          </div>
          <Link 
            to={`/blog/${featuredPost.slug}`}
            onClick={() => incrementViews(featuredPost.id)}
            className="featured-link"
          >
            <div className="featured-content">
              {featuredPost.featured_image_url && (
                <div className="featured-image">
                  <img src={featuredPost.featured_image_url} alt={featuredPost.title} />
                </div>
              )}
              <div className="featured-text">
                <div className="featured-categories">
                  {featuredPost.blog_post_categories?.map(pc => (
                    <span 
                      key={pc.blog_categories.slug}
                      className="category-tag"
                      style={{ backgroundColor: pc.blog_categories.color }}
                    >
                      {pc.blog_categories.name}
                    </span>
                  ))}
                </div>
                <h2>{featuredPost.title}</h2>
                <p>{featuredPost.excerpt}</p>
                <div className="post-meta">
                  <span><Calendar size={14} /> {formatDate(featuredPost.published_at)}</span>
                  <span><Eye size={14} /> {featuredPost.views_count || 0} views</span>
                  <span><Clock size={14} /> {getReadingTime(featuredPost.content)}</span>
                </div>
                <div className="read-more">
                  Read more <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Posts Grid */}
      <div className="posts-section">
        <h2>Latest Posts</h2>
        <div className="posts-grid">
          {regularPosts.map(post => (
            <article key={post.id} className="post-card fade-in">
              <Link 
                to={`/blog/${post.slug}`}
                onClick={() => incrementViews(post.id)}
                className="post-link"
              >
                {post.featured_image_url && (
                  <div className="post-image">
                    <img src={post.featured_image_url} alt={post.title} />
                    {post.interactive_components?.length > 0 && (
                      <div className="interactive-badge">
                        <Sparkles size={14} />
                        Interactive
                      </div>
                    )}
                  </div>
                )}
                
                <div className="post-content">
                  <div className="post-categories">
                    {post.blog_post_categories?.map(pc => (
                      <span 
                        key={pc.blog_categories.slug}
                        className="category-tag"
                        style={{ backgroundColor: pc.blog_categories.color }}
                      >
                        {pc.blog_categories.name}
                      </span>
                    ))}
                  </div>
                  
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  
                  <div className="post-meta">
                    <span><Calendar size={14} /> {formatDate(post.published_at)}</span>
                    <span><Eye size={14} /> {post.views_count || 0}</span>
                    <span><Clock size={14} /> {getReadingTime(post.content)}</span>
                  </div>
                </div>
              </Link>
              
              <div className="post-actions">
                <button 
                  className="share-btn"
                  onClick={() => sharePost(post)}
                  title="Share this post"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>

        {allPosts.length === 0 && (
          <div className="no-posts">
            <Heart size={48} />
            <h3>No posts found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="blog-cta">
        <div className="cta-content">
          <h3>Ready to start your pregnancy journey?</h3>
          <p>Join thousands of parents using Baby Steps to stay organised and prepared for their little one's arrival.</p>
          <Link to="/" className="cta-button">
            Start planning for free
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Blog;