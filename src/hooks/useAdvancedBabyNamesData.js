// Enhanced Baby Names Database Integration with Analytics
// Complete Supabase integration with historical data, analytics, and robust error handling

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// Analytics tracking function
const trackInteraction = async (interactionType, nameInvolved = null, toolSection = null, additionalData = {}) => {
  try {
    const sessionId = sessionStorage.getItem('blog_session_id') || 
      (() => {
        const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('blog_session_id', id);
        return id;
      })();

    await supabase
      .from('blog_analytics')
      .insert({
        interaction_type: interactionType,
        blog_post_slug: 'baby-names-2024-real-time-analysis',
        name_involved: nameInvolved,
        tool_section: toolSection,
        user_session: sessionId,
        additional_data: additionalData
      });

    console.log('📊 Analytics tracked:', { interactionType, nameInvolved, toolSection });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Track name searches for analytics
const trackNameSearch = async (searchedName, found = false) => {
  try {
    const sessionId = sessionStorage.getItem('blog_session_id');
    
    await supabase
      .from('ons_name_searches')
      .insert({
        searched_name: searchedName,
        found: found,
        user_session: sessionId,
        blog_post_slug: 'baby-names-2024-real-time-analysis'
      });
  } catch (error) {
    console.error('Name search tracking error:', error);
  }
};

// Enhanced name trajectory predictor with historical data
export const useNameTrajectoryPredictor = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const predictTrajectory = useCallback(async (searchName) => {
    if (!searchName?.trim()) return;

    try {
      setLoading(true);
      setResult(null);
      setError(null);

      console.log('🔍 Enhanced search for name:', searchName);

      // Track the search
      trackInteraction('name_search', searchName, 'trajectory_predictor');

      // First, get the basic name info and trends
      const { data: nameData, error: nameError } = await supabase
        .from('ons_baby_names')
        .select(`
          id,
          name,
          gender,
          origin,
          meaning,
          cultural_category,
          ons_name_trends (
            current_rank,
            previous_rank,
            year_over_year_change,
            five_year_change,
            trend_category,
            prediction,
            momentum_score,
            cultural_influence_score
          )
        `)
        .ilike('name', searchName.trim())
        .single();

      if (nameError || !nameData) {
        console.log('❌ Name not found, tracking search...');
        await trackNameSearch(searchName, false);
        
        setResult({
          name: searchName,
          error: `"${searchName}" not found in the ONS 2024 database. Try popular names like Muhammad, Olivia, Noah, Raya, or Bodhi! Search our database of ${await getNameCount()} verified names.`
        });
        return;
      }

      // Track successful search
      await trackNameSearch(searchName, true);

      if (!nameData?.ons_name_trends?.length) {
        setResult({
          name: nameData.name,
          error: `Found "${nameData.name}" but no trend data available.`
        });
        return;
      }

      // Get historical rankings for the chart
      const { data: historicalData } = await supabase
        .from('ons_name_rankings')
        .select('year, rank')
        .eq('name_id', nameData.id)
        .order('year', { ascending: true });

      const trend = nameData.ons_name_trends[0];
      
      console.log('✅ Enhanced name data found:', nameData);
      console.log('📊 Historical data:', historicalData);

      // Create positions array for chart (last 6 years)
      const currentYear = 2024;
      const positions = [];
      for (let i = 5; i >= 0; i--) {
        const year = currentYear - i;
        const historical = historicalData?.find(h => h.year === year);
        positions.push(historical?.rank || trend.current_rank + (i * 5)); // Fallback estimation
      }

      setResult({
        name: nameData.name,
        gender: nameData.gender,
        origin: nameData.origin,
        meaning: nameData.meaning,
        culturalCategory: nameData.cultural_category,
        current: trend.current_rank,
        previous: trend.previous_rank,
        change: trend.year_over_year_change,
        fiveYearChange: trend.five_year_change,
        trend: trend.trend_category,
        prediction: trend.prediction,
        momentumScore: trend.momentum_score,
        culturalInfluenceScore: trend.cultural_influence_score,
        positions: positions,
        historicalData: historicalData || []
      });

      // Track successful prediction
      trackInteraction('prediction_tool', nameData.name, 'trajectory_results', {
        rank: trend.current_rank,
        trend: trend.trend_category,
        change: trend.year_over_year_change
      });

    } catch (error) {
      console.error('Enhanced trajectory prediction error:', error);
      setError(`Database error: ${error.message}`);
      setResult({
        name: searchName,
        error: `Database connection error. Please try again later.`
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    result,
    loading,
    error,
    predictTrajectory
  };
};

// Enhanced trending names with better chart data
export const useTrendingNames = (limit = 8) => {
  const [trendingNames, setTrendingNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrendingNames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📈 Fetching enhanced trending names...');

      // Get trending names with historical context
      const { data: trendingData, error: trendingError } = await supabase
        .from('ons_name_trends')
        .select(`
          current_rank,
          previous_rank,
          trend_category,
          year_over_year_change,
          five_year_change,
          momentum_score,
          cultural_influence_score,
          ons_baby_names!inner (
            id,
            name,
            gender,
            cultural_category,
            origin
          )
        `)
        .in('trend_category', ['RISING FAST', 'STRONG MOMENTUM'])
        .order('momentum_score', { ascending: false })
        .limit(limit * 2); // Get more to filter better ones

      if (trendingError) {
        console.error('Trending names error:', trendingError);
        setError('Failed to load trending names');
        return;
      }

      console.log('✅ Fetched enhanced trending data:', trendingData);

      // Get historical data for top trending names
      const topNames = trendingData.slice(0, limit);
      const chartDataPromises = topNames.map(async (item) => {
        // Get 6-year historical data
        const { data: historical } = await supabase
          .from('ons_name_rankings')
          .select('year, rank')
          .eq('name_id', item.ons_baby_names.id)
          .gte('year', 2019)
          .order('year', { ascending: true });

        // Create positions array for chart
        const positions = [];
        for (let year = 2019; year <= 2024; year++) {
          const historical_rank = historical?.find(h => h.year === year)?.rank;
          if (historical_rank) {
            positions.push(historical_rank);
          } else {
            // Estimate based on current rank and changes
            const yearDiff = 2024 - year;
            const estimated = item.current_rank + (yearDiff * 10); // Simple estimation
            positions.push(Math.min(estimated, 450));
          }
        }

        return {
          name: item.ons_baby_names.name,
          category: item.ons_baby_names.gender,
          origin: item.ons_baby_names.origin,
          change: item.five_year_change > 0 ? `+${item.five_year_change}` : `${item.five_year_change}`,
          trend: item.trend_category,
          currentRank: item.current_rank,
          previousRank: item.previous_rank,
          yearOverYearChange: item.year_over_year_change,
          momentum: item.momentum_score || 0,
          culturalInfluence: item.cultural_influence_score || 0,
          positions: positions,
          color: getNameColor(item.ons_baby_names.name),
          insight: getCulturalInsight(item.ons_baby_names.cultural_category, item.trend_category)
        };
      });

      const chartData = await Promise.all(chartDataPromises);
      
      // Sort by momentum and cultural influence
      chartData.sort((a, b) => {
        const scoreA = (a.momentum || 0) + (a.culturalInfluence || 0);
        const scoreB = (b.momentum || 0) + (b.culturalInfluence || 0);
        return scoreB - scoreA;
      });

      setTrendingNames(chartData);

      // Track successful fetch
      trackInteraction('page_view', null, 'trending_chart', {
        names_count: chartData.length,
        top_name: chartData[0]?.name
      });

    } catch (error) {
      console.error('Error fetching enhanced trending names:', error);
      setError('Database connection error');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  return {
    trendingNames,
    loading,
    error,
    fetchTrendingNames
  };
};

// Enhanced cultural patterns analysis
export const useCulturalPatterns = () => {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [influences, setInfluences] = useState([]);

  const fetchPatterns = useCallback(async () => {
    try {
      setLoading(true);
      
      console.log('🌍 Fetching enhanced cultural patterns...');

      // Get cultural influences from the new table
      const { data: influenceData } = await supabase
        .from('ons_cultural_influences')
        .select('*')
        .gte('year', 2020)
        .order('influence_strength', { ascending: false });

      setInfluences(influenceData || []);

      // Get names grouped by cultural category with trends
      const { data: culturalData, error: culturalError } = await supabase
        .from('ons_baby_names')
        .select(`
          cultural_category,
          name,
          gender,
          origin,
          ons_name_trends!inner (
            current_rank,
            trend_category,
            year_over_year_change,
            five_year_change,
            momentum_score,
            cultural_influence_score
          )
        `)
        .not('cultural_category', 'is', null)
        .order('cultural_category');

      if (culturalError) {
        console.error('Cultural patterns error:', culturalError);
        return;
      }

      console.log('✅ Fetched enhanced cultural data:', culturalData);

      // Enhanced grouping with statistics
      const groupedPatterns = culturalData.reduce((acc, item) => {
        const category = item.cultural_category;
        if (!acc[category]) {
          acc[category] = {
            category,
            names: [],
            totalMomentum: 0,
            risingCount: 0,
            averageRank: 0,
            totalInfluence: 0
          };
        }

        const trend = item.ons_name_trends[0];
        if (trend) {
          acc[category].names.push({
            name: item.name,
            gender: item.gender,
            origin: item.origin,
            rank: trend.current_rank,
            change: trend.year_over_year_change,
            fiveYearChange: trend.five_year_change,
            trend: trend.trend_category,
            momentum: trend.momentum_score || 0,
            culturalInfluence: trend.cultural_influence_score || 0
          });

          if (trend.year_over_year_change > 0) {
            acc[category].totalMomentum += trend.year_over_year_change;
            acc[category].risingCount++;
          }

          acc[category].totalInfluence += trend.cultural_influence_score || 0;
        }

        return acc;
      }, {});

      // Calculate averages and sort
      Object.values(groupedPatterns).forEach(pattern => {
        if (pattern.names.length > 0) {
          pattern.averageRank = Math.round(
            pattern.names.reduce((sum, name) => sum + name.rank, 0) / pattern.names.length
          );
        }
        
        // Sort names within each category by momentum and cultural influence
        pattern.names.sort((a, b) => {
          const scoreA = (a.momentum || 0) + (a.culturalInfluence || 0);
          const scoreB = (b.momentum || 0) + (b.culturalInfluence || 0);
          return scoreB - scoreA;
        });
        
        pattern.names = pattern.names.slice(0, 6); // Top 6 per category
      });

      // Sort patterns by total influence
      const sortedPatterns = Object.values(groupedPatterns)
        .sort((a, b) => b.totalInfluence - a.totalInfluence);

      setPatterns(sortedPatterns);

    } catch (error) {
      console.error('Error fetching enhanced cultural patterns:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    patterns,
    influences,
    loading,
    fetchPatterns
  };
};

// Utility function to get total name count
const getNameCount = async () => {
  try {
    const { count } = await supabase
      .from('ons_baby_names')
      .select('*', { count: 'exact', head: true });
    return count || 'thousands of';
  } catch (error) {
    return 'thousands of';
  }
};

// Enhanced color generation with better distribution
const getNameColor = (name) => {
  const colors = [
    '#ff6b9d', '#4ecdc4', '#ffe66d', '#a8e6cf', 
    '#ff9999', '#87ceeb', '#dda0dd', '#98fb98',
    '#ffa07a', '#20b2aa', '#9370db', '#32cd32',
    '#ff69b4', '#40e0d0', '#ee82ee', '#90ee90',
    '#ffa500', '#6495ed', '#daa520', '#00ced1'
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return colors[Math.abs(hash) % colors.length];
};

// Get cultural insight based on category and trend
const getCulturalInsight = (category, trend) => {
  const insights = {
    'Disney/Media': 'Pop culture influence',
    'Celtic/Irish': 'Heritage revival',
    'Islamic': 'Cultural renaissance', 
    'Nature/Spiritual': 'Wellness movement',
    'Vintage/Classic': 'Timeless appeal',
    'Modern/Invented': 'Creative innovation',
    'Biblical/Religious': 'Traditional values'
  };
  
  const baseInsight = insights[category] || 'Cultural significance';
  const trendModifier = trend === 'RISING FAST' ? ' (exploding)' : 
                       trend === 'STRONG MOMENTUM' ? ' (growing)' : '';
  
  return baseInsight + trendModifier;
};

// Enhanced utility functions
export const formatTrendChange = (change, trend) => {
  if (change === 0) return { text: 'No change', color: '#6b7280', emoji: '📊' };
  if (change > 0) return { 
    text: `+${change} positions`, 
    color: '#059669',
    emoji: trend === 'RISING FAST' ? '🚀' : '📈',
    badge: trend === 'RISING FAST' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
  };
  return { 
    text: `${change} positions`, 
    color: '#dc2626',
    emoji: '📉',
    badge: 'bg-red-100 text-red-800'
  };
};

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

// Test database connection with comprehensive checks
export const testDatabaseConnection = async () => {
  try {
    console.log('🧪 Testing enhanced database connection...');
    
    // Test main tables
    const tests = await Promise.all([
      supabase.from('ons_baby_names').select('name').limit(1),
      supabase.from('ons_name_trends').select('current_rank').limit(1),
      supabase.from('ons_name_rankings').select('year').limit(1),
      supabase.from('blog_analytics').select('id').limit(1)
    ]);
    
    const [namesTest, trendsTest, rankingsTest, analyticsTest] = tests;
    
    const results = {
      names: !namesTest.error,
      trends: !trendsTest.error,
      rankings: !rankingsTest.error,
      analytics: !analyticsTest.error
    };
    
    const allWorking = Object.values(results).every(Boolean);
    
    console.log('✅ Database connection test results:', results);
    
    if (allWorking) {
      // Track successful connection
      trackInteraction('page_view', null, 'database_connection', { 
        all_tables_working: true,
        test_time: new Date().toISOString()
      });
    }
    
    return { 
      success: allWorking, 
      results,
      message: allWorking ? 'All database tables accessible' : 'Some tables missing'
    };
    
  } catch (error) {
    console.error('❌ Enhanced database test failed:', error);
    return { success: false, error, message: 'Database connection failed' };
  }
};

// Export analytics tracking for use in components
export { trackInteraction };

// Main export
export default {
  useNameTrajectoryPredictor,
  useTrendingNames,
  useCulturalPatterns,
  formatTrendChange,
  getTrendEmoji,
  testDatabaseConnection,
  trackInteraction
};