import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Save,
  Calendar,
  BarChart3,
  Settings,
  X,
  Check,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import './BlogAdmin.css';

const BlogAdmin = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('posts');
  const [newPost, setNewPost] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image_url: '',
    meta_description: '',
    tags: [],
    published: false,
    featured: false,
    category_ids: []
  });

  useEffect(() => {
    fetchPosts();
    fetchCategories();
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage('Please log in to access admin features');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    if (!profile || profile.email !== 'alexgrwood@me.com') {
      setMessage('Admin access required. Contact administrator.');
      return;
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          profiles(full_name),
          blog_post_categories(blog_categories(id, name, color))
        `)
        .order('created_at', { ascending: false });

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

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const resetNewPost = () => {
    setNewPost({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featured_image_url: '',
      meta_description: '',
      tags: [],
      published: false,
      featured: false,
      category_ids: []
    });
  };

  const savePost = async (post, isNew = false) => {
    setSaving(true);
    setMessage('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const postData = {
        ...post,
        slug: post.slug || generateSlug(post.title),
        published_at: post.published ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
        author_id: user.id
      };

      if (isNew) {
        const { data, error } = await supabase
          .from('blog_posts')
          .insert([postData])
          .select()
          .single();
        
        if (error) throw error;

        // Add categories
        if (post.category_ids.length > 0) {
          const categoryLinks = post.category_ids.map(catId => ({
            post_id: data.id,
            category_id: catId
          }));

          await supabase
            .from('blog_post_categories')
            .insert(categoryLinks);
        }

        setPosts([data, ...posts]);
        resetNewPost();
        setShowNewPost(false);
        setMessage('Post created successfully!');
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', post.id);
        
        if (error) throw error;

        // Update categories
        await supabase
          .from('blog_post_categories')
          .delete()
          .eq('post_id', post.id);

        if (post.category_ids.length > 0) {
          const categoryLinks = post.category_ids.map(catId => ({
            post_id: post.id,
            category_id: catId
          }));

          await supabase
            .from('blog_post_categories')
            .insert(categoryLinks);
        }

        setPosts(posts.map(p => p.id === post.id ? { ...p, ...postData } : p));
        setEditingPost(null);
        setMessage('Post updated successfully!');
      }

      fetchPosts(); // Refresh to get updated categories
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);
      
      if (error) throw error;

      setPosts(posts.filter(p => p.id !== postId));
      setMessage('Post deleted successfully');
    } catch (error) {
      setMessage(`Error deleting post: ${error.message}`);
    }
  };

  const togglePublished = async (post) => {
    const updatedPost = { 
      ...post, 
      published: !post.published,
      published_at: !post.published ? new Date().toISOString() : null
    };
    await savePost(updatedPost);
  };

  const handleTagInput = (value, isNew = false) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    if (isNew) {
      setNewPost({ ...newPost, tags });
    } else {
      setEditingPost({ ...editingPost, tags });
    }
  };

  const handleCategoryChange = (categoryId, checked, isNew = false) => {
    const currentIds = isNew ? newPost.category_ids : editingPost.category_ids;
    let newIds;
    
    if (checked) {
      newIds = [...currentIds, categoryId];
    } else {
      newIds = currentIds.filter(id => id !== categoryId);
    }

    if (isNew) {
      setNewPost({ ...newPost, category_ids: newIds });
    } else {
      setEditingPost({ ...editingPost, category_ids: newIds });
    }
  };

  const startEdit = (post) => {
    setEditingPost({
      ...post,
      category_ids: post.blog_post_categories?.map(pc => pc.blog_categories.id) || [],
      tags: post.tags || []
    });
    setShowNewPost(false);
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading admin interface...</p>
      </div>
    );
  }

  return (
    <div className="blog-admin">
      <div className="admin-header">
        <div className="admin-title">
          <Settings size={24} />
          <h1>Blog Administration</h1>
        </div>
        
        <div className="admin-tabs">
          <button 
            className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            <Edit size={16} />
            Posts
          </button>
          <button 
            className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={16} />
            Analytics
          </button>
        </div>

        <button 
          className="new-post-btn"
          onClick={() => {
            setShowNewPost(true);
            setEditingPost(null);
            resetNewPost();
          }}
        >
          <Plus size={16} />
          New Post
        </button>
      </div>

      {message && (
        <div className={`admin-message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message.includes('Error') ? <AlertTriangle size={16} /> : <Check size={16} />}
          {message}
        </div>
      )}

      {activeTab === 'posts' && (
        <>
          {/* New Post Form */}
          {showNewPost && (
            <div className="post-form">
              <div className="form-header">
                <h2><Plus size={20} /> Create New Post</h2>
                <button onClick={() => setShowNewPost(false)} className="close-btn">
                  <X size={16} />
                </button>
              </div>
              
              <PostForm 
                post={newPost}
                setPost={setNewPost}
                categories={categories}
                onSave={() => savePost(newPost, true)}
                onCancel={() => setShowNewPost(false)}
                saving={saving}
                generateSlug={generateSlug}
                handleTagInput={handleTagInput}
                handleCategoryChange={handleCategoryChange}
                isNew={true}
              />
            </div>
          )}

          {/* Edit Post Form */}
          {editingPost && (
            <div className="post-form">
              <div className="form-header">
                <h2><Edit size={20} /> Edit Post</h2>
                <button onClick={() => setEditingPost(null)} className="close-btn">
                  <X size={16} />
                </button>
              </div>
              
              <PostForm 
                post={editingPost}
                setPost={setEditingPost}
                categories={categories}
                onSave={() => savePost(editingPost)}
                onCancel={() => setEditingPost(null)}
                saving={saving}
                generateSlug={generateSlug}
                handleTagInput={handleTagInput}
                handleCategoryChange={handleCategoryChange}
                isNew={false}
              />
            </div>
          )}

          {/* Posts Table */}
          <div className="posts-section">
            <h2>Manage Posts ({posts.length})</h2>
            <div className="posts-table">
              {posts.map(post => (
                <div key={post.id} className="post-row">
                  <div className="post-info">
                    <div className="post-title-section">
                      <h3>{post.title}</h3>
                      <span className="post-slug">/{post.slug}</span>
                    </div>
                    
                    <div className="post-meta">
                      <span>
                        <Calendar size={14} />
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                      <span>
                        <Eye size={14} />
                        {post.views_count || 0} views
                      </span>
                      <span className={`status ${post.published ? 'published' : 'draft'}`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                      {post.featured && <span className="featured-badge">Featured</span>}
                    </div>

                    <div className="post-categories">
                      {post.blog_post_categories?.map(pc => (
                        <span 
                          key={pc.blog_categories.id}
                          className="category-tag"
                          style={{ backgroundColor: pc.blog_categories.color }}
                        >
                          {pc.blog_categories.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="post-actions">
                    <button 
                      onClick={() => startEdit(post)}
                      className="action-btn edit"
                      title="Edit post"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => togglePublished(post)}
                      className="action-btn toggle"
                      title={post.published ? 'Unpublish' : 'Publish'}
                    >
                      {post.published ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button 
                      onClick={() => deletePost(post.id)} 
                      className="action-btn delete"
                      title="Delete post"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'analytics' && (
        <div className="analytics-section">
          <h2><BarChart3 size={20} /> Blog Analytics</h2>
          <div className="analytics-grid">
            <div className="stat-card">
              <h3>Total Posts</h3>
              <div className="stat-value">{posts.length}</div>
            </div>
            <div className="stat-card">
              <h3>Published</h3>
              <div className="stat-value">{posts.filter(p => p.published).length}</div>
            </div>
            <div className="stat-card">
              <h3>Total Views</h3>
              <div className="stat-value">
                {posts.reduce((sum, post) => sum + (post.views_count || 0), 0)}
              </div>
            </div>
            <div className="stat-card">
              <h3>Categories</h3>
              <div className="stat-value">{categories.length}</div>
            </div>
          </div>

          <div className="popular-posts">
            <h3>Most Popular Posts</h3>
            {posts
              .filter(p => p.published)
              .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
              .slice(0, 5)
              .map(post => (
                <div key={post.id} className="popular-post">
                  <span className="post-title">{post.title}</span>
                  <span className="post-views">{post.views_count || 0} views</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Post Form Component
const PostForm = ({ 
  post, 
  setPost, 
  categories, 
  onSave, 
  onCancel, 
  saving, 
  generateSlug, 
  handleTagInput, 
  handleCategoryChange, 
  isNew 
}) => {
  return (
    <div className="form-content">
      <div className="form-row">
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            placeholder="Enter post title"
            value={post.title}
            onChange={(e) => {
              const newPost = {
                ...post, 
                title: e.target.value,
                slug: generateSlug(e.target.value)
              };
              setPost(newPost);
            }}
            required
          />
        </div>
        <div className="form-group">
          <label>URL Slug *</label>
          <input
            type="text"
            placeholder="url-slug"
            value={post.slug}
            onChange={(e) => setPost({...post, slug: e.target.value})}
            required
          />
        </div>
      </div>
      
      <div className="form-group">
        <label>Excerpt *</label>
        <textarea
          placeholder="Brief description for post previews and SEO"
          value={post.excerpt}
          onChange={(e) => setPost({...post, excerpt: e.target.value})}
          rows="3"
          required
        />
      </div>
      
      <div className="form-group">
        <label>Content *</label>
        <textarea
          placeholder="Post content (HTML supported)"
          value={post.content}
          onChange={(e) => setPost({...post, content: e.target.value})}
          rows="15"
          required
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Featured Image URL</label>
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={post.featured_image_url}
            onChange={(e) => setPost({...post, featured_image_url: e.target.value})}
          />
        </div>
        <div className="form-group">
          <label>Meta Description</label>
          <input
            type="text"
            placeholder="SEO description (150-160 characters)"
            value={post.meta_description}
            onChange={(e) => setPost({...post, meta_description: e.target.value})}
            maxLength="160"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Tags (comma-separated)</label>
          <input
            type="text"
            placeholder="budget, planning, pregnancy"
            value={post.tags?.join(', ') || ''}
            onChange={(e) => handleTagInput(e.target.value, isNew)}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Categories</label>
        <div className="categories-grid">
          {categories.map(category => (
            <label key={category.id} className="category-checkbox">
              <input
                type="checkbox"
                checked={post.category_ids?.includes(category.id) || false}
                onChange={(e) => handleCategoryChange(category.id, e.target.checked, isNew)}
              />
              <span 
                className="category-label"
                style={{ backgroundColor: category.color }}
              >
                {category.name}
              </span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="form-options">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={post.published}
            onChange={(e) => setPost({...post, published: e.target.checked})}
          />
          <span>Publish immediately</span>
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={post.featured}
            onChange={(e) => setPost({...post, featured: e.target.checked})}
          />
          <span>Featured post</span>
          <Sparkles size={16} className="featured-icon" />
        </label>
      </div>
      
      <div className="form-actions">
        <button onClick={onCancel} className="cancel-btn" disabled={saving}>
          Cancel
        </button>
        <button 
          onClick={onSave}
          className="save-btn"
          disabled={saving || !post.title || !post.excerpt || !post.content}
        >
          <Save size={16} />
          {saving ? 'Saving...' : (isNew ? 'Create Post' : 'Update Post')}
        </button>
      </div>
    </div>
  );
};

export default BlogAdmin;