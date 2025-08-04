import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { BlogPostSEO } from './BlogSEO';
import BabyNamesBlog2024 from './BabyNamesBlog2024';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Eye, 
  Share2,
  Facebook,
  Twitter,
  Copy,
  Check,
  Heart,
  ArrowRight
} from 'lucide-react';
import './BlogPost.css';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (slug) {
      // Check if this is the static baby names post
      if (slug === 'baby-names-2024-under-radar') {
        // Set static post data for SEO
        const staticPost = {
          title: "Everyone's Obsessing Over the Top 10 Baby Names, But We Found those Flying Under the Radar in 2024",
          meta_description: "Discover which UK baby names jumped 348+ positions in 2024. Our analysis reveals under-the-radar names climbing the charts, plus free Name Predictor tool.",
          slug: 'baby-names-2024-under-radar',
          featured_image_url: `${window.location.origin}/images/baby-names-trend-2024.png`,
          published_at: '2025-08-01T10:00:00Z',
          tags: [
            'baby names 2024',
            'UK baby names',
            'baby name trends',
            'unique baby names',
            'baby name predictions',
            'ONS baby names',
            'rising baby names',
            'baby name meanings',
            'pregnancy planning',
            'baby name ideas'
          ],
          excerpt: "One name has jumped 348 spots in five years! Our analysis of ONS 2024 data reveals which under-the-radar names are climbing the UK rankings - plus use our Name Predictor tool to check any name's trajectory."
        };
        setPost(staticPost);
        setLoading(false);
        // Fetch related posts for static content
        fetchRelatedPosts('baby-names-2024');
      } else {
        fetchPost();
      }
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          profiles(full_name),
          blog_post_categories(blog_categories(name, slug, color))
        `)
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (!error && data) {
        setPost(data);
        
        // Increment view count
        await supabase.rpc('increment_post_views', { post_id: data.id });
        
        // Fetch related posts
        fetchRelatedPosts(data.id);
      } else {
        console.error('Post not found or error:', error);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async (currentPostId) => {
    try {
      // For static posts, just get the most popular posts
      if (currentPostId === 'baby-names-2024') {
        const { data } = await supabase
          .from('blog_posts')
          .select('id, title, slug, excerpt, featured_image_url, published_at')
          .eq('published', true)
          .order('views_count', { ascending: false })
          .limit(3);
        
        setRelatedPosts(data || []);
        return;
      }

      const { data } = await supabase.rpc('get_related_posts', { 
        current_post_id: currentPostId,
        limit_count: 3 
      });
      setRelatedPosts(data || []);
    } catch (error) {
      // Fallback to simple query if function doesn't exist yet
      const { data } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, featured_image_url, published_at')
        .eq('published', true)
        .neq('id', currentPostId)
        .order('views_count', { ascending: false })
        .limit(3);
      
      setRelatedPosts(data || []);
    }
  };

  const sharePost = async (platform) => {
    const url = window.location.href;
    const title = post?.title || "Everyone's Obsessing Over the Top 10 Baby Names, But We Found those Flying Under the Radar in 2024";
    const text = post?.excerpt || "One name has jumped 348 spots in five years! Our research reveals which under-the-radar names are climbing the rankings - and where they'll be in five years with our new Predictor tool.";
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`);
        break;
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({ title, text, url });
          } catch (error) {
            // User cancelled or error occurred
          }
        } else {
          copyToClipboard(url);
        }
        break;
      case 'copy':
        copyToClipboard(url);
        break;
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
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

  const formatContent = (content) => {
    // Simple content formatting - you can enhance this with a proper markdown parser later
    return content
      .replace(/\n/g, '<br>')
      .replace(/<h2>/g, '<h2 class="content-heading">')
      .replace(/<h3>/g, '<h3 class="content-subheading">')
      .replace(/<ul>/g, '<ul class="content-list">')
      .replace(/<li>/g, '<li class="content-list-item">');
  };

  // Render interactive components based on the post's interactive_components field
  const renderInteractiveComponents = () => {
    if (!post.interactive_components || post.interactive_components.length === 0) {
      return null;
    }

    return post.interactive_components.map((componentName, index) => {
      switch (componentName) {
        case 'BabyNamesBlog2024':
          return <BabyNamesBlog2024 key={index} />;
        default:
          return (
            <div key={index} className="coming-soon-interactive">
              <h3>🧮 Interactive Tool: {componentName}</h3>
              <p>This interactive component is being developed and will be available soon!</p>
            </div>
          );
      }
    });
  };

  // Special handling for the baby names blog post - render it as a full interactive experience
  if (slug === 'baby-names-2024-under-radar') {
    // Create a static post object for this special case
    const staticPost = {
      id: 'baby-names-2024',
      title: "Everyone's Obsessing Over the Top 10 Baby Names, But We Found those Flying Under the Radar in 2024",
      slug: 'baby-names-2024-under-radar',
      excerpt: "One name has jumped 348 spots in five years! Our research reveals which under-the-radar names are climbing the rankings - and where they'll be in five years with our new Predictor tool.",
      featured_image_url: '/images/baby-names-trend.png',
      published_at: '2025-08-01T00:00:00Z',
      views_count: 0,
      content: '',
      featured: true,
      blog_post_categories: [{
        blog_categories: {
          name: 'UK Baby Names 2024',
          slug: 'baby-names',
          color: '#ff6b9d'
        }
      }]
    };
    
    return (
      <div className="interactive-blog-post">
        <BlogPostSEO post={staticPost} />
        <BabyNamesBlog2024 />
        
        {/* Related Posts and sharing for interactive posts */}
        <div className="blog-post-container">
          {/* Sharing */}
          <div className="post-sharing">
            <h3>Share this analysis</h3>
            <div className="share-buttons">
              <button onClick={() => sharePost('facebook')} className="share-btn facebook">
                <Facebook size={16} />
                Facebook
              </button>
              <button onClick={() => sharePost('twitter')} className="share-btn twitter">
                <Twitter size={16} />
                Twitter
              </button>
              {navigator.share && (
                <button onClick={() => sharePost('native')} className="share-btn native">
                  <Share2 size={16} />
                  Share
                </button>
              )}
              <button onClick={() => sharePost('copy')} className="share-btn copy">
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          </div>


        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="blog-post-loading">
        <div className="loading-spinner"></div>
        <p>Loading post...</p>
      </div>
    );
  }

  // Handle static baby names post
  if (slug === 'baby-names-2024-under-radar' && post) {
    return (
      <div className="interactive-blog-post">
        <BlogPostSEO post={post} />
        <BabyNamesBlog2024 />
        
        {/* Related Posts and sharing for interactive posts */}
        <div className="blog-post-container">
          {/* Sharing */}
          <div className="post-sharing">
            <h3>Share this analysis</h3>
            <div className="share-buttons">
              <button onClick={() => sharePost('facebook')} className="share-btn facebook">
                <Facebook size={16} />
                Facebook
              </button>
              <button onClick={() => sharePost('twitter')} className="share-btn twitter">
                <Twitter size={16} />
                Twitter
              </button>
              {navigator.share && (
                <button onClick={() => sharePost('native')} className="share-btn native">
                  <Share2 size={16} />
                  Share
                </button>
              )}
              <button onClick={() => sharePost('copy')} className="share-btn copy">
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="related-posts">
              <h3>You might also like</h3>
              <div className="related-grid">
                {relatedPosts.map(relatedPost => (
                  <Link 
                    key={relatedPost.id} 
                    to={`/blog/${relatedPost.slug}`}
                    className="related-card"
                  >
                    {relatedPost.featured_image_url && (
                      <div className="related-image">
                        <img src={relatedPost.featured_image_url} alt={relatedPost.title} />
                      </div>
                    )}
                    <div className="related-content">
                      <h4>{relatedPost.title}</h4>
                      <p>{relatedPost.excerpt}</p>
                      <span className="read-more">
                        Read more <ArrowRight size={14} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-not-found">
        <div className="not-found-content">
          <Heart size={48} />
          <h2>Post not found</h2>
          <p>The post you're looking for doesn't exist or has been removed.</p>
          <Link to="/blog" className="back-to-blog">
            <ArrowLeft size={16} />
            Back to blog
          </Link>
        </div>
      </div>
    );
  }
  
  // Keep the existing check for other interactive posts
  if (post && post.slug === 'baby-names-2024-real-time-analysis') {
    return (
      <div className="interactive-blog-post">
        {post && <BlogPostSEO post={post} />}
        <BabyNamesBlog2024 />
        
        {/* Related Posts and sharing for interactive posts */}
        <div className="blog-post-container">
          {/* Sharing */}
          <div className="post-sharing">
            <h3>Share this analysis</h3>
            <div className="share-buttons">
              <button onClick={() => sharePost('facebook')} className="share-btn facebook">
                <Facebook size={16} />
                Facebook
              </button>
              <button onClick={() => sharePost('twitter')} className="share-btn twitter">
                <Twitter size={16} />
                Twitter
              </button>
              {navigator.share && (
                <button onClick={() => sharePost('native')} className="share-btn native">
                  <Share2 size={16} />
                  Share
                </button>
              )}
              <button onClick={() => sharePost('copy')} className="share-btn copy">
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard blog post rendering for all other posts
  return (
    <article className="blog-post">
      {post && <BlogPostSEO post={post} />}
      <div className="blog-post-container">
        {/* Header */}
        <header className="post-header">
          <div className="header-navigation">
            <Link to="/blog" className="back-link">
              <ArrowLeft size={16} />
              Back to blog
            </Link>
          </div>
          
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
          
          <h1>{post.title}</h1>
          <p className="post-excerpt">{post.excerpt}</p>
          
          <div className="post-meta">
            <span><Calendar size={16} /> {formatDate(post.published_at)}</span>
            <span><Eye size={16} /> {post.views_count || 0} views</span>
            <span><Clock size={16} /> {getReadingTime(post.content)}</span>
          </div>
          
          {post.featured_image_url && (
            <div className="featured-image-container">
              <img src={post.featured_image_url} alt={post.title} className="featured-image" />
            </div>
          )}
        </header>

        {/* Content */}
        <div className="post-content">
          <div 
            className="content-body"
            dangerouslySetInnerHTML={{ __html: formatContent(post.content) }} 
          />
          
          {/* Render Interactive Components */}
          {renderInteractiveComponents()}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            <h4>Tags:</h4>
            <div className="tags-list">
              {post.tags.map(tag => (
                <span key={tag} className="tag">#{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* Sharing */}
        <div className="post-sharing">
          <h3>Share this post</h3>
          <div className="share-buttons">
            <button onClick={() => sharePost('facebook')} className="share-btn facebook">
              <Facebook size={16} />
              Facebook
            </button>
            <button onClick={() => sharePost('twitter')} className="share-btn twitter">
              <Twitter size={16} />
              Twitter
            </button>
            {navigator.share && (
              <button onClick={() => sharePost('native')} className="share-btn native">
                <Share2 size={16} />
                Share
              </button>
            )}
            <button onClick={() => sharePost('copy')} className="share-btn copy">
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="related-posts">
            <h3>You might also like</h3>
            <div className="related-grid">
              {relatedPosts.map(relatedPost => (
                <Link 
                  key={relatedPost.id} 
                  to={`/blog/${relatedPost.slug}`}
                  className="related-card"
                >
                  {relatedPost.featured_image_url && (
                    <div className="related-image">
                      <img src={relatedPost.featured_image_url} alt={relatedPost.title} />
                    </div>
                  )}
                  <div className="related-content">
                    <h4>{relatedPost.title}</h4>
                    <p>{relatedPost.excerpt}</p>
                    <span className="read-more">
                      Read more <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="post-cta">
          <div className="cta-content">
            <h3>Ready to plan your perfect pregnancy journey?</h3>
            <p>Join thousands of parents using Baby Steps to stay organised and prepared for their little one's arrival.</p>
            <Link to="/" className="cta-button">
              Start planning for free
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogPost;