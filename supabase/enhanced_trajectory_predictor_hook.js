// ============================================
// OPTION B: Enhanced Trajectory Predictor Hook
// This version actually uses ons_name_predictions for detailed forecasting
// ============================================

// Enhanced Hook for the Name Trajectory Predictor (Option B)
export const useEnhancedNameTrajectoryPredictor = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const predictTrajectory = useCallback(async (name) => {
    if (!name) return;

    try {
      setLoading(true);

      // Get full trajectory data using the database function
      const { data: trajectory, error: trajectoryError } = await supabase
        .rpc('get_name_trajectory', { name_input: name });

      if (trajectoryError || !trajectory.length) {
        setResult({
          name,
          error: "Name not found in our database. Try names like Raya, Bodhi, Maeve, Muhammad, or Olivia!"
        });
        return;
      }

      // Get detailed predictions using the enhanced function
      const { data: detailedPredictions, error: predictionsError } = await supabase
        .rpc('get_detailed_name_predictions', { name_input: name });

      if (predictionsError) throw predictionsError;

      // Get basic name data
      const { data: nameData, error: nameError } = await supabase
        .from('ons_baby_names')
        .select(`
          *,
          ons_name_trends (*)
        `)
        .ilike('name', name)
        .single();

      if (nameError) throw nameError;

      const trend = nameData.ons_name_trends[0];
      const recentTrajectory = trajectory
        .filter(t => t.year >= 2019)
        .sort((a, b) => a.year - b.year);

      const fiveYearChange = recentTrajectory[0]?.rank - recentTrajectory[recentTrajectory.length - 1]?.rank;

      // Process detailed predictions for enhanced display
      const predictions = detailedPredictions.map(pred => ({
        year: pred.prediction_year,
        rank: pred.predicted_rank,
        confidence: pred.confidence_score,
        type: pred.prediction_type,
        changeFromCurrent: pred.rank_change_from_current,
        direction: pred.rank_change_from_current > 0 ? 'up' : 'down',
        magnitude: Math.abs(pred.rank_change_from_current)
      }));

      setResult({
        name: nameData.name,
        current: trend.current_rank,
        previous: trend.previous_rank,
        change: trend.year_over_year_change,
        trend: trend.trend_category,
        prediction: trend.prediction, // General prediction from trends
        fiveYearChange,
        positions: recentTrajectory.map(t => t.rank),
        origin: nameData.origin,
        meaning: nameData.meaning,
        culturalCategory: nameData.cultural_category,
        // Enhanced predictions array with detailed forecasts
        detailedPredictions: predictions,
        // Summary statistics from predictions
        averageConfidence: predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length,
        projectedTrajectory: predictions.map(p => p.rank), // For chart display
        strongestYear: predictions.reduce((best, current) => 
          current.rank < best.rank ? current : best, predictions[0]
        )
      });

      // Track interaction
      await trackBlogInteraction('enhanced_prediction_tool', name);

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

// Enhanced display component for detailed predictions (Option B)
const EnhancedPredictionDisplay = ({ trajectoryResult }) => {
  if (!trajectoryResult || !trajectoryResult.detailedPredictions) return null;

  return (
    <div style={{ 
      marginTop: '1rem', 
      padding: '1rem', 
      backgroundColor: '#eff6ff', 
      borderRadius: '0.5rem' 
    }}>
      <h4 style={{ 
        fontWeight: 'bold', 
        fontSize: '1.125rem', 
        color: '#1e3a8a',
        marginBottom: '1rem'
      }}>
        {trajectoryResult.name} - Detailed AI Predictions
      </h4>
      
      {/* Current vs Future */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{ 
          padding: '0.5rem', 
          backgroundColor: 'white', 
          borderRadius: '0.375rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Current Rank</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e40af' }}>
            #{trajectoryResult.current}
          </div>
        </div>
        
        {trajectoryResult.detailedPredictions.map(pred => (
          <div key={pred.year} style={{ 
            padding: '0.5rem', 
            backgroundColor: 'white', 
            borderRadius: '0.375rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{pred.year}</div>
            <div style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              color: pred.direction === 'up' ? '#059669' : '#dc2626'
            }}>
              #{pred.rank}
            </div>
            <div style={{ 
              fontSize: '0.625rem', 
              color: pred.direction === 'up' ? '#059669' : '#dc2626'
            }}>
              {pred.direction === 'up' ? '↑' : '↓'} {pred.magnitude}
            </div>
          </div>
        ))}
      </div>

      {/* Confidence and Trajectory Summary */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{ 
          padding: '0.75rem', 
          backgroundColor: 'white', 
          borderRadius: '0.375rem' 
        }}>
          <div style={{ fontWeight: '600', color: '#1e3a8a', marginBottom: '0.25rem' }}>
            AI Confidence
          </div>
          <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {(trajectoryResult.averageConfidence * 100).toFixed(0)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            Average across all predictions
          </div>
        </div>

        <div style={{ 
          padding: '0.75rem', 
          backgroundColor: 'white', 
          borderRadius: '0.375rem' 
        }}>
          <div style={{ fontWeight: '600', color: '#1e3a8a', marginBottom: '0.25rem' }}>
            Peak Projection
          </div>
          <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#059669' }}>
            #{trajectoryResult.strongestYear.rank} in {trajectoryResult.strongestYear.year}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            Highest predicted ranking
          </div>
        </div>
      </div>

      {/* General AI Prediction */}
      <div style={{ 
        padding: '0.75rem', 
        backgroundColor: 'white', 
        borderRadius: '0.375rem',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
          📈 AI Analysis: {trajectoryResult.prediction}
        </div>
        <div style={{ 
          fontSize: '0.75rem', 
          color: '#6b7280' 
        }}>
          Based on {trajectoryResult.detailedPredictions.length} detailed predictions from our live ONS database
        </div>
      </div>
    </div>
  );
};

export { EnhancedPredictionDisplay };
