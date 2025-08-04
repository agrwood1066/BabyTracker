// Supabase Hooks for Baby Names Blog Integration
// Custom React hooks to fetch baby names data and track interactions
// Updated to use ONS-prefixed table names

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

// Generate session ID for anonymous analytics
const getSessionId = () => {
  let sessionId = localStorage.getItem('blog_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36);
    localStorage.setItem('blog_session_id', sessionId);
  }
  return sessionId;
};

// Cultural insight mapping
const getCulturalInsight = (category) => {
  const insights = {
    'Cultural': 'Disney princess effect in full force',
    'Spiritual': 'Spiritual wellness trend building',
    'Celtic': 'Irish heritage revival phenomenon',
    'International': 'Italian elegance appeal growing',
    'Islamic': 'Cultural strength and pride',
    'Classic': 'Timeless appeal endures',
    'Vintage': 'Nostalgic sophistication returning',
    'Nature': 'Nature connection trend',
    'Classic Revival': 'Heritage names gaining modern appeal',
    'Modern': 'Contemporary naming trends',
    'Mythological': 'Ancient stories, modern appeal'
  };
  return insights[category] || 'Cultural momentum building';
};

// Generate consistent colors for names
const getNameColor = (name) => {
  const colors = [
    '#ff6b9d', '#4ecdc4', '#ffe66d', '#a8e6cf', 
    '#ff9999', '#87ceeb', '#dda0dd', '#98fb98'
  ];
  const hash = name.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return colors[Math.abs(hash) % colors.length];
};

// Analytics tracking function (using universal blog_analytics table)
const trackBlogInteraction = async (interactionType, nameInvolved = null, pageSection = null) => {
  try {
    await supabase
      .from('blog_analytics')
      .insert({
        interaction_type: interactionType,
        blog_post_slug: 'baby-names-2024-real-time-analysis',
        name_involved: nameInvolved,
        tool_section: pageSection,
        user_session: getSessionId()
      });
  } catch (err) {
    // Silent fail for analytics
    console.log('Analytics tracking failed:', err);
  }
};

// Hook for getting trending names for the main chart
export const useTrendingNames = (limit = 8) => {
  const [trendingNames, setTrendingNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrendingNames = async () => {
      try {
        setLoading(true);
        
        // Get trending names directly from tables
        const { data: namesWithTrends, error: trendsError } = await supabase
          .from('ons_name_trends')
          .select(`
            *,
            ons_baby_names!inner (
              name,
              gender,
              origin,
              meaning,
              cultural_category
            )
          `)
          .in('trend_category', ['RISING FAST', 'STRONG MOMENTUM'])
          .order('momentum_score', { ascending: false })
          .limit(limit);

        if (trendsError) throw trendsError;

        // Transform data for chart
        const chartData = namesWithTrends.map(trend => {
          const nameData = trend.ons_baby_names;
          
          // Generate mock historical positions based on current rank and 5-year change
          // This creates a smooth trajectory for visualization
          const currentRank = trend.current_rank || 100;
          const fiveYearChange = trend.five_year_change || 0;
          const startRank = currentRank + fiveYearChange;
          
          // Create positions array for 2019-2024
          const positions = [];
          for (let i = 0; i < 6; i++) {
            const yearProgress = i / 5;
            const rank = Math.round(startRank - (fiveYearChange * yearProgress));
            positions.push(rank);
          }

          return {
            name: nameData.name,
            positions,
            category: nameData.gender === 'girls' ? 'girls' : 'boys',
            change: fiveYearChange > 0 ? `+${fiveYearChange}` : `${fiveYearChange}`,
            insight: getCulturalInsight(nameData.cultural_category),
            color: getNameColor(nameData.name),
            trend: trend.trend_category,
            currentRank: trend.current_rank,
            momentum: trend.momentum_score || 0
          };
        });
        
        setTrendingNames(chartData);

      } catch (err) {
        setError(err.message);
        console.error('Error fetching trending names:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingNames();
  }, [limit]);

  return { trendingNames, loading, error };
};

// Hook for the Name Trend Checker tool
export const useNameTrendChecker = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkNameTrend = useCallback(async (name) => {
    if (!name) return;

    try {
      setLoading(true);
      
      // Track the search for analytics (using ONS table)
      await supabase
        .from('ons_name_searches')
        .insert({ 
          searched_name: name,
          found: false, // Will update if found
          user_session: getSessionId(),
          blog_post_slug: 'baby-names-2024-real-time-analysis'
        });

      // Get name data with trend (using ONS tables)
      const { data: nameData, error: nameError } = await supabase
        .from('ons_baby_names')
        .select(`
          *,
          ons_name_trends (
            current_rank,
            previous_rank,
            year_over_year_change,
            trend_category,
            prediction,
            five_year_change
          )
        `)
        .ilike('name', name)
        .single();

      if (nameError || !nameData) {
        setResult({
          name,
          error: "Name not found in our database. Try popular names like Raya, Bodhi, Maeve, Muhammad, or Olivia!"
        });
        return;
      }

      // Update search record as found
      await supabase
        .from('ons_name_searches')
        .update({ found: true })
        .eq('searched_name', name)
        .eq('user_session', getSessionId());

      const trend = nameData.ons_name_trends[0];
      setResult({
        name: nameData.name,
        current: trend.current_rank,
        change: trend.year_over_year_change,
        trend: trend.trend_category,
        prediction: trend.prediction,
        origin: nameData.origin,
        meaning: nameData.meaning,
        fiveYearChange: trend.five_year_change
      });

    } catch (err) {
      setResult({
        name,
        error: `Error checking name trend: ${err.message}`
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return { result, loading, checkNameTrend };
};

// Hook for the Name Trajectory Predictor
export const useNameTrajectoryPredictor = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const predictTrajectory = useCallback(async (name) => {
    if (!name) return;

    try {
      setLoading(true);

      // Get name data with trend directly from tables
      const { data: nameData, error: nameError } = await supabase
        .from('ons_baby_names')
        .select(`
          *,
          ons_name_trends (*)
        `)
        .ilike('name', name)
        .single();

      if (nameError || !nameData || !nameData.ons_name_trends?.length) {
        setResult({
          name,
          error: "Name not found in our database. Try names like Raya, Bodhi, Maeve, Muhammad, or Olivia!"
        });
        return;
      }

      const trend = nameData.ons_name_trends[0];
      
      // Generate trajectory positions based on trend data
      const currentRank = trend.current_rank || 100;
      const fiveYearChange = trend.five_year_change || 0;
      const startRank = currentRank + fiveYearChange;
      
      // Create positions array for visualization
      const positions = [];
      for (let i = 0; i < 6; i++) {
        const yearProgress = i / 5;
        const rank = Math.round(startRank - (fiveYearChange * yearProgress));
        positions.push(rank);
      }

      setResult({
        name: nameData.name,
        current: trend.current_rank,
        previous: trend.previous_rank,
        change: trend.year_over_year_change,
        trend: trend.trend_category,
        prediction: trend.prediction,
        fiveYearChange: trend.five_year_change,
        positions,
        origin: nameData.origin,
        meaning: nameData.meaning,
        culturalCategory: nameData.cultural_category
      });

      // Track interaction
      await trackBlogInteraction('prediction_tool', name);

    } catch (err) {
      setResult({
        name,
        error: `Error predicting trajectory: ${err.message}`
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return { result, loading, predictTrajectory };
};

// Hook for getting cultural patterns
export const useCulturalPatterns = () => {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatterns = async () => {
      try {
        // Get names grouped by cultural category with trends (using ONS tables)
        const { data: culturalTrends, error: trendsError } = await supabase
          .from('ons_baby_names')
          .select(`
            cultural_category,
            name,
            ons_name_trends (
              current_rank,
              trend_category,
              year_over_year_change,
              momentum_score
            )
          `)
          .not('cultural_category', 'is', null)
          .order('cultural_category');

        if (trendsError) throw trendsError;

        // Group and analyze patterns
        const groupedPatterns = culturalTrends.reduce((acc, item) => {
          const category = item.cultural_category;
          if (!acc[category]) {
            acc[category] = {
              category,
              names: [],
              totalMomentum: 0,
              risingCount: 0
            };
          }

          const trend = item.ons_name_trends[0];
          if (trend) {
            acc[category].names.push({
              name: item.name,
              rank: trend.current_rank,
              change: trend.year_over_year_change,
              trend: trend.trend_category,
              momentum: trend.momentum_score || 0
            });

            if (trend.year_over_year_change > 0) {
              acc[category].totalMomentum += trend.year_over_year_change;
              acc[category].risingCount++;
            }
          }

          return acc;
        }, {});

        // Sort names within each category by momentum
        Object.values(groupedPatterns).forEach(pattern => {
          pattern.names.sort((a, b) => (b.momentum || 0) - (a.momentum || 0));
        });

        setPatterns(Object.values(groupedPatterns));

      } catch (err) {
        console.error('Error fetching cultural patterns:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatterns();
  }, []);

  return { patterns, loading };
};

// Main hook that combines all blog data functionality
export const useEnhancedBlogData = () => {
  const { trendingNames, loading: trendingLoading } = useTrendingNames(8);
  const { patterns, loading: patternsLoading } = useCulturalPatterns();
  const { checkNameTrend, result: trendResult, loading: trendLoading } = useNameTrendChecker();
  const { predictTrajectory, result: trajectoryResult, loading: trajectoryLoading } = useNameTrajectoryPredictor();

  // Track page view on mount
  useEffect(() => {
    trackBlogInteraction('page_view', null, 'baby_names_blog_2024');
  }, []);

  return {
    // Chart data
    trendingNames,
    trendingLoading,
    
    // Cultural patterns
    patterns,
    patternsLoading,
    
    // Tools
    checkNameTrend,
    trendResult,
    trendLoading,
    
    predictTrajectory,
    trajectoryResult,
    trajectoryLoading,
    
    // Analytics helper
    trackInteraction: trackBlogInteraction
  };
};

// Utility function to format trend changes for display
export const formatTrendChange = (change, trend) => {
  if (change === 0) return { text: 'No change', color: 'text-gray-600' };
  if (change > 0) return { 
    text: `+${change} positions`, 
    color: 'text-green-600',
    badge: trend === 'RISING FAST' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
  };
  return { 
    text: `${change} positions`, 
    color: 'text-red-600',
    badge: 'bg-red-100 text-red-800'
  };
};

// Utility function to get trend emoji
export const getTrendEmoji = (trend) => {
  const emojis = {
    'RISING FAST': '🚀',
    'STRONG MOMENTUM': '📈',
    'STABLE': '📊',
    'COOLING': '📉',
    'FALLING': '⬇️',
    'NEW ENTRY': '✨'
  };
  return emojis[trend] || '📊';
};

const babyNamesDataExports = {
  useTrendingNames,
  useNameTrendChecker,
  useNameTrajectoryPredictor,
  useCulturalPatterns,
  useEnhancedBlogData,
  formatTrendChange,
  getTrendEmoji,
  trackBlogInteraction
};

export default babyNamesDataExports;