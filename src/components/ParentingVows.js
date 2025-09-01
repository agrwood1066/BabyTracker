import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useSubscription } from '../hooks/useSubscription';
import PaywallModal from './PaywallModal';
import { 
  Plus, 
  ChevronUp, 
  HeartHandshake, 
  Edit2, 
  Trash2, 
  Star,
  Check,
  X,
  Save,
  Lock,
  Sparkles,
  Heart,
  Users
} from 'lucide-react';
import './ParentingVows.css';

const ParentingVows = () => {
  // Subscription hook
  const { isPremium } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);
  
  // Existing state
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [user, setUser] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingResponse, setEditingResponse] = useState(null);
  const [newResponse, setNewResponse] = useState({});
  const [questionCounts, setQuestionCounts] = useState({});

  // Initialize component
  useEffect(() => {
    fetchUserAndFamily();
  }, []);

  useEffect(() => {
    if (user?.family_id) {
      fetchCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (selectedCategory) {
      fetchQuestions(selectedCategory.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const fetchUserAndFamily = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        setUser(profile);

        // Fetch family members
        if (profile.family_id) {
          const { data: members } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('family_id', profile.family_id);
          
          setFamilyMembers(members || []);
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('pregnancy_vows_categories')
        .select('*')
        .eq('family_id', user.family_id)
        .order('position', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        // Remove duplicates based on name
        const uniqueCategories = data.reduce((acc, current) => {
          const exists = acc.find(item => item.name === current.name);
          if (!exists) {
            acc.push(current);
          }
          return acc;
        }, []);
        
        setCategories(uniqueCategories);
        setSelectedCategory(uniqueCategories[0]);
        
        // Fetch question counts for all categories
        await fetchQuestionCounts(uniqueCategories);
      } else {
        // Initialize default categories if none exist
        await initializeVows();
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionCounts = async (categoriesList) => {
    try {
      const counts = {};
      for (const category of categoriesList) {
        const { count } = await supabase
          .from('pregnancy_vows_questions')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id);
        counts[category.id] = count || 0;
      }
      setQuestionCounts(counts);
    } catch (error) {
      console.error('Error fetching question counts:', error);
    }
  };

  const initializeVows = async () => {
    try {
      // Check if categories already exist before initializing
      const { data: existingCategories } = await supabase
        .from('pregnancy_vows_categories')
        .select('id')
        .eq('family_id', user.family_id)
        .limit(1);
      
      if (existingCategories && existingCategories.length > 0) {
        // Categories already exist, just refresh
        fetchCategories();
        return;
      }
      
      const { error } = await supabase.rpc('initialize_pregnancy_vows', {
        family_id_param: user.family_id,
        user_id_param: user.id
      });

      if (error) throw error;
      
      // Refresh categories after initialization
      fetchCategories();
    } catch (error) {
      console.error('Error initializing vows:', error);
    }
  };

  const fetchQuestions = async (categoryId) => {
    try {
      // Fetch questions with vote counts
      const { data: questionsData, error: questionsError } = await supabase
        .from('pregnancy_vows_questions')
        .select(`
          *,
          pregnancy_vows_question_votes (
            user_id
          )
        `)
        .eq('category_id', categoryId)
        .order('position', { ascending: true });

      if (questionsError) throw questionsError;

      // Process vote counts
      const processedQuestions = questionsData.map(q => ({
        ...q,
        voteCount: q.pregnancy_vows_question_votes?.length || 0,
        hasUserVoted: q.pregnancy_vows_question_votes?.some(v => v.user_id === user.id)
      }));

      // Sort by vote count (highest first), then by position
      processedQuestions.sort((a, b) => {
        if (b.voteCount !== a.voteCount) return b.voteCount - a.voteCount;
        return a.position - b.position;
      });

      setQuestions(processedQuestions);

      // Fetch all responses and interactions for these questions
      for (const question of processedQuestions) {
        await fetchResponsesForQuestion(question.id);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const fetchResponsesForQuestion = async (questionId) => {
    try {
      const { data: responsesData, error } = await supabase
        .from('pregnancy_vows_responses')
        .select(`
          *,
          profiles!pregnancy_vows_responses_user_id_fkey (
            id,
            full_name
          ),
          pregnancy_vows_interactions (
            user_id,
            interaction_type
          )
        `)
        .eq('question_id', questionId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process responses with interaction counts
      const processedResponses = responsesData.map(r => {
        const upvotes = r.pregnancy_vows_interactions?.filter(i => i.interaction_type === 'upvote') || [];
        const consensuses = r.pregnancy_vows_interactions?.filter(i => i.interaction_type === 'consensus') || [];
        
        return {
          ...r,
          upvoteCount: upvotes.length,
          hasUserUpvoted: upvotes.some(u => u.user_id === user.id),
          consensusCount: consensuses.length,
          hasUserConsensus: consensuses.some(c => c.user_id === user.id),
          hasFullConsensus: consensuses.length === familyMembers.length
        };
      });

      // Sort by upvote count (highest first), then by consensus, then by date
      processedResponses.sort((a, b) => {
        if (b.upvoteCount !== a.upvoteCount) return b.upvoteCount - a.upvoteCount;
        if (b.consensusCount !== a.consensusCount) return b.consensusCount - a.consensusCount;
        return new Date(b.created_at) - new Date(a.created_at);
      });

      setResponses(prev => ({
        ...prev,
        [questionId]: processedResponses
      }));
    } catch (error) {
      console.error('Error fetching responses:', error);
    }
  };

  const handleAddCategory = async (name, emoji, color) => {
    try {
      const newPosition = categories.length + 1;
      
      const { data, error } = await supabase
        .from('pregnancy_vows_categories')
        .insert({
          family_id: user.family_id,
          name,
          emoji,
          color,
          position: newPosition,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setCategories([...categories, data]);
      setShowAddCategory(false);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleAddQuestion = async (questionText, hints) => {
    try {
      const newPosition = questions.length + 1;
      
      const { data, error } = await supabase
        .from('pregnancy_vows_questions')
        .insert({
          category_id: selectedCategory.id,
          family_id: user.family_id,
          question_text: questionText,
          hints,
          position: newPosition,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setQuestions([...questions, { ...data, voteCount: 0, hasUserVoted: false }]);
      setShowAddQuestion(false);
      
      // Update question count for this category
      setQuestionCounts(prev => ({
        ...prev,
        [selectedCategory.id]: (prev[selectedCategory.id] || 0) + 1
      }));
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  const handleAddResponse = async (questionId, responseText) => {
    try {
      const { data, error } = await supabase
        .from('pregnancy_vows_responses')
        .insert({
          question_id: questionId,
          user_id: user.id,
          response_text: responseText
        })
        .select(`
          *,
          profiles!pregnancy_vows_responses_user_id_fkey (
            id,
            full_name
          )
        `)
        .single();

      if (error) throw error;

      const newResponseData = {
        ...data,
        upvoteCount: 0,
        hasUserUpvoted: false,
        consensusCount: 0,
        hasUserConsensus: false,
        hasFullConsensus: false,
        pregnancy_vows_interactions: []
      };

      setResponses(prev => ({
        ...prev,
        [questionId]: [newResponseData, ...(prev[questionId] || [])]
      }));
      
      setNewResponse(prev => ({ ...prev, [questionId]: '' }));
    } catch (error) {
      console.error('Error adding response:', error);
    }
  };

  const handleUpdateResponse = async (responseId, newText, questionId) => {
    try {
      const { error } = await supabase
        .from('pregnancy_vows_responses')
        .update({ response_text: newText, updated_at: new Date() })
        .eq('id', responseId);

      if (error) throw error;

      // Refresh responses for this question
      await fetchResponsesForQuestion(questionId);
      setEditingResponse(null);
    } catch (error) {
      console.error('Error updating response:', error);
    }
  };

  const handleDeleteResponse = async (responseId, questionId) => {
    if (!window.confirm('Are you sure you want to delete this response?')) return;

    try {
      const { error } = await supabase
        .from('pregnancy_vows_responses')
        .delete()
        .eq('id', responseId);

      if (error) throw error;

      setResponses(prev => ({
        ...prev,
        [questionId]: prev[questionId].filter(r => r.id !== responseId)
      }));
    } catch (error) {
      console.error('Error deleting response:', error);
    }
  };

  const handleToggleInteraction = async (responseId, type, questionId) => {
    try {
      const currentResponses = responses[questionId] || [];
      const response = currentResponses.find(r => r.id === responseId);
      
      const hasInteraction = type === 'upvote' 
        ? response?.hasUserUpvoted 
        : response?.hasUserConsensus;

      if (hasInteraction) {
        // Remove interaction
        const { error } = await supabase
          .from('pregnancy_vows_interactions')
          .delete()
          .eq('response_id', responseId)
          .eq('user_id', user.id)
          .eq('interaction_type', type);

        if (error) throw error;
      } else {
        // Add interaction
        const { error } = await supabase
          .from('pregnancy_vows_interactions')
          .insert({
            response_id: responseId,
            user_id: user.id,
            interaction_type: type
          });

        if (error) throw error;
      }

      // Refresh responses and update question count if needed
      await fetchResponsesForQuestion(questionId);
      if (selectedCategory) {
        await fetchQuestionCounts([selectedCategory]);
      }
    } catch (error) {
      console.error('Error toggling interaction:', error);
    }
  };

  const handleToggleQuestionVote = async (questionId) => {
    try {
      const question = questions.find(q => q.id === questionId);
      
      if (question?.hasUserVoted) {
        // Remove vote
        const { error } = await supabase
          .from('pregnancy_vows_question_votes')
          .delete()
          .eq('question_id', questionId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Add vote
        const { error } = await supabase
          .from('pregnancy_vows_question_votes')
          .insert({
            question_id: questionId,
            user_id: user.id
          });

        if (error) throw error;
      }

      // Refresh questions
      await fetchQuestions(selectedCategory.id);
    } catch (error) {
      console.error('Error toggling question vote:', error);
    }
  };

  const getResponseBackgroundColor = (response) => {
    // Get user's color based on their position in family
    const userIndex = familyMembers.findIndex(m => m.id === response.user_id);
    const colors = ['#FFE4E6', '#DBEAFE', '#D1FAE5', '#FEF3C7'];
    return colors[userIndex % colors.length];
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return 'just now';
  };

  if (loading) {
    return <div className="loading">Loading your parenting vows...</div>;
  }

  // Premium check - if not premium, show lock screen
  if (!isPremium()) {
    return (
      <div className="parenting-vows-container">
        <div className="vows-header">
          <HeartHandshake className="header-icon" size={32} />
          <h1>Parenting Values & Vows</h1>
        </div>

        <div className="premium-lock-screen">
          <div className="lock-icon-wrapper">
            <Lock size={64} className="lock-icon" />
          </div>
          
          <h2>Create Your Family's Parenting Philosophy</h2>
          
          <p className="lock-description">
            Build a shared vision for raising your child with our guided parenting values framework
          </p>

          <div className="sample-preview">
            <h3>What You'll Get:</h3>
            <div className="sample-categories">
              <div className="sample-category">
                <Star className="category-icon" />
                <div>
                  <h4>Daily Routines</h4>
                  <p>Agree on bedtime rituals, feeding approaches, and daily structure</p>
                </div>
              </div>
              <div className="sample-category">
                <Heart className="category-icon" />
                <div>
                  <h4>Education & Development</h4>
                  <p>Align on screen time, learning methods, and milestone approaches</p>
                </div>
              </div>
              <div className="sample-category">
                <HeartHandshake className="category-icon" />
                <div>
                  <h4>Discipline & Boundaries</h4>
                  <p>Create consistent approaches to behaviour and consequences</p>
                </div>
              </div>
              <div className="sample-category">
                <Users className="category-icon" />
                <div>
                  <h4>Family Values</h4>
                  <p>Define core values and traditions you want to pass on</p>
                </div>
              </div>
            </div>
          </div>

          <div className="premium-benefits">
            <h3>Premium Features:</h3>
            <ul>
              <li>✅ Create unlimited parenting value categories</li>
              <li>✅ Add discussion questions for each topic</li>
              <li>✅ Track both partners' responses</li>
              <li>✅ See where you align and differ</li>
              <li>✅ Export your parenting philosophy as PDF</li>
              <li>✅ Share with caregivers and family</li>
            </ul>
          </div>

          <button 
            className="unlock-button"
            onClick={() => setShowPaywall(true)}
          >
            <Sparkles className="button-icon" />
            Unlock Parenting Values
          </button>

          <p className="premium-note">
            Join thousands of couples creating stronger partnerships through aligned parenting
          </p>
        </div>

        <PaywallModal
          show={showPaywall}
          trigger="parenting_vows"
          onClose={() => setShowPaywall(false)}
          customMessage="Create your family's parenting philosophy with Premium"
        />
      </div>
    );
  }

  // Premium users get full functionality
  return (
    <div className="parenting-vows-container">
      <div className="vows-header">
        <h1>Parenting Vows</h1>
        <p className="subtitle">Important conversations before baby arrives</p>
      </div>

      {/* Category Pills - Horizontally Scrollable */}
      <div className="category-pills-container">
        <div className="category-pills">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-pill ${selectedCategory?.id === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
              style={{
                backgroundColor: selectedCategory?.id === category.id ? category.color : '#f3f4f6',
                borderColor: category.color
              }}
            >
              <span className="category-emoji">{category.emoji}</span>
              <span className="category-name">{category.name}</span>
              <span className="question-count">{questionCounts[category.id] || 0}x</span>
            </button>
          ))}
          <button 
            className="category-pill add-category"
            onClick={() => setShowAddCategory(true)}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Questions Section */}
      {selectedCategory && (
        <div className="questions-section">
          <div className="section-header">
            <h2>{selectedCategory.emoji} {selectedCategory.name}</h2>
            <button 
              className="add-question-btn"
              onClick={() => setShowAddQuestion(true)}
            >
              <Plus size={20} /> Add Question
            </button>
          </div>

          {questions.map(question => (
            <div key={question.id} className="question-card">
              <div className="question-header">
                <div className="question-text">
                  {question.voteCount > 0 && (
                    <span className="priority-indicator">
                      {question.voteCount === 2 ? '⭐⭐' : '⭐'}
                    </span>
                  )}
                  {question.question_text}
                </div>
                <button
                  className={`vote-question-btn ${question.hasUserVoted ? 'voted' : ''}`}
                  onClick={() => handleToggleQuestionVote(question.id)}
                >
                  <Star size={18} fill={question.hasUserVoted ? '#fbbf24' : 'none'} />
                  {question.voteCount > 0 && <span>{question.voteCount}</span>}
                </button>
              </div>

              {/* Responses */}
              <div className="responses-container">
                {(responses[question.id] || []).map(response => (
                  <div 
                    key={response.id} 
                    className={`response-box ${response.hasFullConsensus ? 'consensus-reached' : ''}`}
                    style={{ backgroundColor: getResponseBackgroundColor(response) }}
                  >
                    {editingResponse === response.id ? (
                      <div className="edit-response">
                        <textarea
                          defaultValue={response.response_text}
                          onBlur={(e) => handleUpdateResponse(response.id, e.target.value, question.id)}
                          autoFocus
                        />
                        <button onClick={() => setEditingResponse(null)}>
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="response-content">
                          <p>{response.response_text}</p>
                          <div className="response-meta">
                            <span className="response-author">
                              {response.profiles?.full_name}
                            </span>
                            <span className="response-time">
                              {getTimeAgo(response.created_at)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="response-actions">
                          <button
                            className={`action-btn upvote ${response.hasUserUpvoted ? 'active' : ''}`}
                            onClick={() => handleToggleInteraction(response.id, 'upvote', question.id)}
                            title="Upvote this response"
                          >
                            <ChevronUp size={16} />
                            {response.upvoteCount > 0 && <span>{response.upvoteCount}</span>}
                            <span className="btn-label">Upvote</span>
                          </button>
                          
                          <button
                            className={`action-btn consensus ${response.hasUserConsensus ? 'active' : ''} ${response.hasFullConsensus ? 'full' : ''}`}
                            onClick={() => handleToggleInteraction(response.id, 'consensus', question.id)}
                            title={response.hasFullConsensus ? 'Both partners agree!' : 'Mark as consensus'}
                          >
                            <HeartHandshake size={16} />
                            {response.hasFullConsensus && <Check size={12} />}
                            <span className="btn-label">Consensus</span>
                          </button>
                          
                          {response.user_id === user.id && (
                            <>
                              <button
                                className="action-btn edit"
                                onClick={() => setEditingResponse(response.id)}
                                title="Edit response"
                              >
                                <Edit2 size={16} />
                                <span className="btn-label">Edit</span>
                              </button>
                              
                              <button
                                className="action-btn delete"
                                onClick={() => handleDeleteResponse(response.id, question.id)}
                                title="Delete response"
                              >
                                <Trash2 size={16} />
                                <span className="btn-label">Delete</span>
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {/* Add Response Input */}
                <div className="add-response">
                  <textarea
                    placeholder="Add your response..."
                    value={newResponse[question.id] || ''}
                    onChange={(e) => setNewResponse(prev => ({
                      ...prev,
                      [question.id]: e.target.value
                    }))}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && newResponse[question.id]?.trim()) {
                        e.preventDefault();
                        handleAddResponse(question.id, newResponse[question.id]);
                      }
                    }}
                  />
                  {newResponse[question.id] && (
                    <button
                      className="submit-response"
                      onClick={() => handleAddResponse(question.id, newResponse[question.id])}
                    >
                      <Save size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="modal-overlay" onClick={() => setShowAddCategory(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Category</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleAddCategory(
                formData.get('name'),
                formData.get('emoji'),
                formData.get('color')
              );
            }}>
              <input 
                name="name" 
                placeholder="Category name" 
                required 
                autoFocus 
              />
              <input 
                name="emoji" 
                placeholder="Emoji (e.g., 🎯)" 
                maxLength="2" 
                required 
              />
              <input 
                name="color" 
                type="color" 
                defaultValue="#FFE4E6" 
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddCategory(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary">
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {showAddQuestion && (
        <div className="modal-overlay" onClick={() => setShowAddQuestion(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Question</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleAddQuestion(
                formData.get('question'),
                formData.get('hints')
              );
            }}>
              <textarea 
                name="question" 
                placeholder="Enter your question..." 
                required 
                autoFocus 
                rows="3"
              />
              <input 
                name="hints" 
                placeholder="Optional hints or prompts" 
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddQuestion(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary">
                  Add Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentingVows;