import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Heart, Plus, User, Users, Star, Trash2, Edit2 } from 'lucide-react';
import './BabyNames.css';

function BabyNames() {
  const [names, setNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddName, setShowAddName] = useState(false);
  const [showEditName, setShowEditName] = useState(false);
  const [editingName, setEditingName] = useState(null);
  const [filterGender, setFilterGender] = useState('all');
  const [sortBy, setSortBy] = useState('votes');
  const [newName, setNewName] = useState({
    name: '',
    gender: 'neutral',
    notes: ''
  });
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    getCurrentUser();
    fetchNames();
  }, []);

  async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id);
  }

  async function fetchNames() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('family_id')
        .eq('id', user.id)
        .single();

      const { data: namesData, error: namesError } = await supabase
        .from('baby_names')
        .select(`
          *,
          profiles!suggested_by (
            full_name,
            email
          ),
          baby_name_votes (
            user_id,
            vote
          )
        `)
        .eq('family_id', profile.family_id)
        .order('created_at', { ascending: false });

      if (!namesError && namesData) {
        // Calculate average votes
        const namesWithScores = namesData.map(name => {
          const votes = name.baby_name_votes || [];
          const avgVote = votes.length > 0 
            ? votes.reduce((sum, v) => sum + v.vote, 0) / votes.length 
            : 0;
          const userVote = votes.find(v => v.user_id === user.id)?.vote || 0;
          
          return {
            ...name,
            avgVote: avgVote,
            userVote: userVote,
            voteCount: votes.length
          };
        });
        
        setNames(namesWithScores);
      }
    } catch (error) {
      console.error('Error fetching names:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addName() {
    if (!newName.name) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('family_id')
        .eq('id', user.id)
        .single();

      const { error } = await supabase
        .from('baby_names')
        .insert({
          ...newName,
          family_id: profile.family_id,
          suggested_by: user.id
        });

      if (error) throw error;

      setNewName({
        name: '',
        gender: 'neutral',
        notes: ''
      });
      setShowAddName(false);
      fetchNames();
    } catch (error) {
      console.error('Error adding name:', error);
      alert('Error adding name');
    }
  }

  async function editName(name) {
    setEditingName(name);
    setNewName({
      name: name.name,
      gender: name.gender,
      notes: name.notes || ''
    });
    setShowEditName(true);
  }

  async function updateName() {
    if (!newName.name || !editingName) return;

    try {
      const { error } = await supabase
        .from('baby_names')
        .update({
          name: newName.name,
          gender: newName.gender,
          notes: newName.notes
        })
        .eq('id', editingName.id);

      if (error) throw error;

      setNewName({
        name: '',
        gender: 'neutral',
        notes: ''
      });
      setShowEditName(false);
      setEditingName(null);
      fetchNames();
    } catch (error) {
      console.error('Error updating name:', error);
      alert('Error updating name');
    }
  }

  async function voteName(nameId, vote) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Check if user has already voted
      const { data: existingVote } = await supabase
        .from('baby_name_votes')
        .select('id')
        .eq('name_id', nameId)
        .eq('user_id', user.id)
        .single();

      if (existingVote) {
        // Update existing vote
        const { error } = await supabase
          .from('baby_name_votes')
          .update({ vote })
          .eq('name_id', nameId)
          .eq('user_id', user.id);
          
        if (error) throw error;
      } else {
        // Create new vote
        const { error } = await supabase
          .from('baby_name_votes')
          .insert({
            name_id: nameId,
            user_id: user.id,
            vote
          });
          
        if (error) throw error;
      }

      fetchNames();
    } catch (error) {
      console.error('Error voting:', error);
    }
  }

  async function deleteName(id) {
    if (!window.confirm('Are you sure you want to delete this name?')) return;

    try {
      const { error } = await supabase
        .from('baby_names')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchNames();
    } catch (error) {
      console.error('Error deleting name:', error);
    }
  }

  const filteredNames = names
    .filter(name => filterGender === 'all' || name.gender === filterGender)
    .sort((a, b) => {
      if (sortBy === 'votes') {
        return b.avgVote - a.avgVote;
      } else if (sortBy === 'alphabetical') {
        return a.name.localeCompare(b.name);
      } else {
        return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  const getGenderIcon = (gender) => {
    switch (gender) {
      case 'boy': return <User size={16} color="#9cc6e8" />;
      case 'girl': return <User size={16} color="#f5c2c7" />;
      default: return <Users size={16} color="#d4a5d4" />;
    }
  };

  const renderStars = (nameId, userVote) => {
    return [1, 2, 3, 4, 5].map(star => (
      <button
        key={star}
        className={`star-button ${userVote >= star ? 'filled' : ''}`}
        onClick={() => voteName(nameId, star)}
      >
        <Star size={20} />
      </button>
    ));
  };

  if (loading) {
    return <div className="loading">Loading names...</div>;
  }

  return (
    <div className="baby-names-container">
      <div className="names-header">
        <h1>Baby Names</h1>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Filter by Gender:</label>
          <select 
            value={filterGender} 
            onChange={(e) => setFilterGender(e.target.value)}
          >
            <option value="all">All</option>
            <option value="boy">Boys</option>
            <option value="girl">Girls</option>
            <option value="neutral">Neutral</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="votes">Highest Rated</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="recent">Most Recent</option>
          </select>
        </div>
      </div>

      <div className="names-grid">
        {filteredNames.length > 0 ? (
          filteredNames.map(name => (
            <div key={name.id} className="name-card">
              <div className="name-header">
                <h3>
                  {name.name}
                  {getGenderIcon(name.gender)}
                </h3>
                <div className="name-actions">
                  {name.suggested_by === currentUserId && (
                    <>
                      <button 
                        className="edit-button"
                        onClick={() => editName(name)}
                        title="Edit name"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => deleteName(name.id)}
                        title="Delete name"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {name.notes && (
                <p className="name-notes">{name.notes}</p>
              )}
              
              <div className="voting-section">
                <div className="stars">
                  {renderStars(name.id, name.userVote)}
                </div>
                <div className="vote-info">
                  <span className="average-rating">
                    Average: {name.avgVote.toFixed(1)} ★
                  </span>
                  <span className="vote-count">
                    ({name.voteCount} {name.voteCount === 1 ? 'vote' : 'votes'})
                  </span>
                </div>
              </div>
              
              <div className="name-footer">
                Suggested by {name.profiles?.full_name || name.profiles?.email}
              </div>
            </div>
          ))
        ) : (
          <div className="no-names">
            <Heart size={48} color="#ccc" />
            <p>No baby names suggested yet!</p>
            <p>Start adding names you love for your little one.</p>
          </div>
        )}
      </div>

      {showAddName && (
        <div className="modal-overlay" onClick={() => setShowAddName(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Baby Name</h2>
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={newName.name}
                onChange={(e) => setNewName({ ...newName, name: e.target.value })}
                placeholder="e.g., Emma"
              />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select
                value={newName.gender}
                onChange={(e) => setNewName({ ...newName, gender: e.target.value })}
              >
                <option value="neutral">Neutral</option>
                <option value="boy">Boy</option>
                <option value="girl">Girl</option>
              </select>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={newName.notes}
                onChange={(e) => setNewName({ ...newName, notes: e.target.value })}
                placeholder="Why do you love this name? Any special meaning?"
                rows="3"
              />
            </div>
            <div className="modal-actions">
              <button className="cancel-button" onClick={() => setShowAddName(false)}>
                Cancel
              </button>
              <button className="save-button" onClick={addName}>
                Add Name
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditName && (
        <div className="modal-overlay" onClick={() => setShowEditName(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Baby Name</h2>
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={newName.name}
                onChange={(e) => setNewName({ ...newName, name: e.target.value })}
                placeholder="e.g., Emma"
              />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select
                value={newName.gender}
                onChange={(e) => setNewName({ ...newName, gender: e.target.value })}
              >
                <option value="neutral">Neutral</option>
                <option value="boy">Boy</option>
                <option value="girl">Girl</option>
              </select>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={newName.notes}
                onChange={(e) => setNewName({ ...newName, notes: e.target.value })}
                placeholder="Why do you love this name? Any special meaning?"
                rows="3"
              />
            </div>
            <div className="modal-actions">
              <button className="cancel-button" onClick={() => {
                setShowEditName(false);
                setEditingName(null);
              }}>
                Cancel
              </button>
              <button className="save-button" onClick={updateName}>
                Update Name
              </button>
            </div>
          </div>
        </div>
      )}

      <button 
        className="fab-add" 
        onClick={() => setShowAddName(true)}
        title="Add Name"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}

export default BabyNames;
