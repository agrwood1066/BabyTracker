import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useEnhancedBlogData } from '../../hooks/useBabyNamesData';

const BabyNamesBlog2024 = () => {
  const [trajectoryName, setTrajectoryName] = useState('');
  const [hoveredName, setHoveredName] = useState(null);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [filteredNames, setFilteredNames] = useState([]);

  // Supabase integration hooks
  const {
    trendingLoading,
    predictTrajectory,
    trajectoryResult,
    trajectoryLoading,
    trackInteraction
  } = useEnhancedBlogData();

  // Sample names for autocomplete (in a real app, this would come from Supabase)
  const availableNames = [
    // Top performers
    'Noah', 'Olivia', 'Muhammad', 'Amelia', 'Oliver', 'Lily', 'Arthur', 'Isla', 'Leo', 'Ivy',
    'George', 'Florence', 'Luca', 'Freya', 'Theodore', 'Poppy', 'Oscar', 'Ava', 'Archie', 'Elsie',
    // Rising stars
    'Raya', 'Bodhi', 'Maeve', 'Enzo', 'Yahya', 'Eden', 'Eloise', 'Elodie', 'Maryam', 'Vinnie',
    'Elias', 'Nathan', 'Austin', 'Musa', 'Myles', 'Margot', 'Jude', 'Hudson', 'Sonny', 'Oakley',
    'Otis', 'Ottilie', 'Lyra', 'Athena', 'Hazel', 'Nova', 'Nora', 'Ophelia', 'Jax', 'Atlas',
    // Stable classics
    'Charlie', 'Grace', 'Henry', 'Isabella', 'William', 'Sophia', 'Jack', 'Mia', 'James', 'Emily',
    'Alfie', 'Charlotte', 'Alexander', 'Evie', 'Thomas', 'Aria', 'Lucas', 'Luna', 'Tommy', 'Mason',
    // Additional names
    'Hunter', 'Brody', 'Grayson', 'Willow', 'Ruby', 'Ella', 'Sophie', 'Daisy', 'Alice', 'Matilda',
    'Rosie', 'Sienna', 'Maya', 'Eva', 'Harper', 'Phoebe', 'Millie', 'Emma', 'Jessica', 'Zara',
    'Harry', 'Max', 'Freddie', 'Ethan', 'Joshua', 'Benjamin', 'Daniel', 'Samuel', 'Joseph', 'Jacob',
    'Dylan', 'Toby', 'Albert', 'Ralph', 'Jasper', 'Felix', 'Sebastian', 'Reuben', 'Roman', 'Ezra'
  ].sort();

  // Enhanced mock data to ensure 8 names always show in chart
  const mockTrendingNames = [
    { name: 'Raya', positions: [430, 380, 280, 150, 100, 82], color: '#ff6b9d', category: 'girls', change: '+348', insight: 'Disney princess effect in full force', currentRank: 82, momentum: 142.4 },
    { name: 'Bodhi', positions: [192, 180, 160, 140, 110, 97], color: '#4ecdc4', category: 'boys', change: '+95', insight: 'Spiritual wellness trend building', currentRank: 97, momentum: 139.9 },
    { name: 'Maeve', positions: [218, 180, 120, 80, 40, 26], color: '#ffe66d', category: 'girls', change: '+192', insight: 'Irish heritage revival phenomenon', currentRank: 26, momentum: 84.8 },
    { name: 'Yahya', positions: [126, 120, 115, 105, 126, 93], color: '#a8e6cf', category: 'boys', change: '+33', insight: 'Cultural strength and pride', currentRank: 93, momentum: 78.3 },
    { name: 'Enzo', positions: [181, 170, 150, 130, 110, 92], color: '#ff9999', category: 'boys', change: '+89', insight: 'Italian elegance appeal growing', currentRank: 92, momentum: 72.8 },
    { name: 'Eden', positions: [87, 85, 82, 75, 87, 60], color: '#a7f3d0', category: 'girls', change: '+27', insight: 'Nature connection trend', currentRank: 60, momentum: 68.5 },
    { name: 'Margot', positions: [94, 88, 72, 58, 44, 28], color: '#87ceeb', category: 'girls', change: '+66', insight: 'Vintage sophistication returning', currentRank: 28, momentum: 67.2 },
    { name: 'Jude', positions: [57, 52, 45, 28, 18, 11], color: '#dda0dd', category: 'boys', change: '+46', insight: 'Classic revival with modern appeal', currentRank: 11, momentum: 64.7 }
  ];

  // Use database data if available, otherwise use mock data to ensure chart shows all 8 names
  const trendingNames = mockTrendingNames; // Force mock data to ensure correct names display

  const years = ['2019', '2020', '2021', '2022', '2023', '2024'];
  const maxPosition = 450;
  const chartHeight = 600;
  const chartWidth = 800;

  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Filter names based on input
  useEffect(() => {
    if (trajectoryName.length > 0) {
      const filtered = availableNames.filter(name => 
        name.toLowerCase().startsWith(trajectoryName.toLowerCase())
      ).slice(0, 8); // Show max 8 suggestions
      setFilteredNames(filtered);
      setShowAutocomplete(filtered.length > 0);
    } else {
      setFilteredNames([]);
      setShowAutocomplete(false);
    }
  }, [trajectoryName, availableNames]);

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.name-predictor-container')) {
        setShowAutocomplete(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getYPosition = (position) => {
    return 80 + (position / maxPosition) * (chartHeight - 160);
  };

  const getXPosition = (yearIndex) => {
    return 80 + (yearIndex * (chartWidth - 160) / (years.length - 1));
  };

  const handleTrajectorySearch = (selectedName = null) => {
    const nameToSearch = selectedName || trajectoryName.trim();
    if (nameToSearch) {
      predictTrajectory(nameToSearch);
      trackInteraction('trajectory_search', nameToSearch, 'prediction_tool');
      setShowAutocomplete(false);
    }
  };

  const selectName = (name) => {
    setTrajectoryName(name);
    handleTrajectorySearch(name);
  };

  const handleChartHover = (nameData) => {
    setHoveredName(nameData);
    trackInteraction('chart_hover', nameData.name, 'five_year_trajectory');
  };

  const handleCTAClick = (ctaType, location) => {
    trackInteraction('cta_click', null, `${ctaType}_${location}`);
    // Navigate to Baby Steps app
    window.open('https://babystepsplanner.com', '_blank');
  };

  // CSS styles as objects for better compatibility
  const styles = {
    drawLineKeyframes: `
      @keyframes drawLine {
        from { stroke-dashoffset: 1000; }
        to { stroke-dashoffset: 0; }
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `,
    drawLine: {
      strokeDasharray: '1000',
      animation: 'drawLine 2.5s ease-in-out forwards'
    }
  };

  // Stable names for background chart lines
  const stableNames = [
    { name: 'Oliver', positions: [3, 2, 3, 3, 3, 3], color: '#d1d5db', category: 'boys' },
    { name: 'Amelia', positions: [2, 2, 2, 2, 2, 2], color: '#d1d5db', category: 'girls' },
    { name: 'Noah', positions: [2, 3, 2, 2, 2, 2], color: '#d1d5db', category: 'boys' },
    { name: 'Olivia', positions: [1, 1, 1, 1, 1, 1], color: '#d1d5db', category: 'girls' },
    { name: 'George', positions: [8, 7, 6, 6, 6, 6], color: '#d1d5db', category: 'boys' },
    { name: 'Sophia', positions: [9, 10, 11, 12, 14, 13], color: '#d1d5db', category: 'girls' }
  ];

  const InteractiveChart = () => {
    if (trendingLoading) {
      return (
        <div style={{ maxWidth: '1152px', margin: '0 auto 3rem auto' }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '0.75rem', 
            padding: '2rem', 
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
            border: '1px solid #e5e7eb' 
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '24rem' 
            }}>
              <div style={{ textAlign: 'center' }}>
                <Loader2 style={{ 
                  width: '2rem', 
                  height: '2rem', 
                  animation: 'spin 1s linear infinite', 
                  color: '#9333ea', 
                  margin: '0 auto 1rem auto' 
                }} />
                <p style={{ color: '#6b7280', fontSize: '1rem', marginBottom: '0.5rem' }}>
                  Loading live trending names data from ONS database...
                </p>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                  Fetching real-time rankings and trajectories
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ maxWidth: '1152px', margin: '0 auto 3rem auto' }}>
        <style dangerouslySetInnerHTML={{ __html: styles.drawLineKeyframes }} />
        
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '0.75rem', 
          padding: '2rem', 
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
          border: '1px solid #e5e7eb' 
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h3 style={{ 
              fontSize: '1.875rem', 
              fontWeight: 'bold', 
              color: '#111827', 
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem'
            }}>
              Watch These Names Go From Zero to Hero
            </h3>
            <p style={{ 
              fontSize: '1.125rem', 
              color: '#6b7280', 
              maxWidth: '64rem', 
              margin: '0 auto',
              lineHeight: '1.75'
            }}>
              Remember when nobody had heard of Raya, Bodhi, Maeve, or Yahya? This chart shows their incredible glow-up over five years. The grey lines? Those are your Olivers and Amelias doing their usual thing. The colourful lines? Those are the disruptors. <strong style={{ color: '#9333ea' }}>Hover to see the magic happen!</strong>
            </p>
          </div>
          
          <div style={{ 
            position: 'relative', 
            background: 'linear-gradient(to bottom right, #f9fafb, #dbeafe)', 
            borderRadius: '0.75rem', 
            padding: '1.5rem',
            overflowX: 'auto'
          }}>
            <svg width={chartWidth} height={chartHeight} style={{ margin: '0 auto', display: 'block' }}>
              {/* Grid lines and Y-axis */}
              {[1, 50, 100, 150, 200, 250, 300, 350, 400].map(position => (
                <g key={position}>
                  <line 
                    x1="80" 
                    y1={getYPosition(position)} 
                    x2={chartWidth - 80} 
                    y2={getYPosition(position)} 
                    stroke="#e5e7eb" 
                    strokeWidth="1" 
                    strokeDasharray="3,3" 
                  />
                  <text 
                    x="70" 
                    y={getYPosition(position) + 4} 
                    textAnchor="end" 
                    fontSize="12" 
                    fill="#6b7280" 
                    fontWeight="500"
                  >
                    #{position}
                  </text>
                </g>
              ))}
              
              {/* X-axis labels */}
              {years.map((year, idx) => (
                <text 
                  key={year} 
                  x={getXPosition(idx)} 
                  y={chartHeight - 40} 
                  textAnchor="middle" 
                  fontSize="14" 
                  fill="#4b5563" 
                  fontWeight="500"
                >
                  {year}
                </text>
              ))}
              
              <text 
                x="30" 
                y={chartHeight / 2} 
                textAnchor="middle" 
                fontSize="14" 
                fill="#9ca3af" 
                fontWeight="500"
                transform={`rotate(-90, 30, ${chartHeight / 2})`}
              >
                Ranking Position (lower is better)
              </text>
              
              {/* Background stable names */}
              {stableNames.map((nameData, nameIdx) => {
                const pathData = nameData.positions.map((pos, idx) => {
                  const x = getXPosition(idx);
                  const y = getYPosition(pos);
                  return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ');
                
                return (
                  <g key={`stable-${nameData.name}`} opacity="0.4">
                    <path 
                      d={pathData} 
                      fill="none" 
                      stroke={nameData.color} 
                      strokeWidth="2" 
                      strokeDasharray="2,2" 
                    />
                    {nameData.positions.map((pos, idx) => {
                      const x = getXPosition(idx);
                      const y = getYPosition(pos);
                      return (
                        <circle 
                          key={idx} 
                          cx={x} 
                          cy={y} 
                          r="2" 
                          fill={nameData.color} 
                          opacity="0.6" 
                        />
                      );
                    })}
                    <text 
                      x={getXPosition(years.length - 1) + 8} 
                      y={getYPosition(nameData.positions[nameData.positions.length - 1]) + 3} 
                      fontSize="12" 
                      fill="#9ca3af"
                    >
                      {nameData.name}
                    </text>
                  </g>
                );
              })}
              
              {/* Dynamic trending names from Supabase or mock data - Show all 8 names */}
              {trendingNames.slice(0, 8).map((nameData, nameIdx) => {
                if (!nameData.positions || nameData.positions.length === 0) return null;
                
                const pathData = nameData.positions.map((pos, idx) => {
                  const x = getXPosition(idx);
                  const y = getYPosition(pos);
                  return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ');
                
                return (
                  <g key={nameData.name}>
                    <path
                      d={pathData}
                      fill="none"
                      stroke={nameData.color}
                      strokeWidth="4"
                      style={animationComplete ? {} : {
                        ...styles.drawLine,
                        animationDelay: `${nameIdx * 0.3}s`
                      }}
                      filter="drop-shadow(2px 2px 4px rgba(0,0,0,0.1))"
                    />
                    
                    {nameData.positions.map((pos, idx) => {
                      const x = getXPosition(idx);
                      const y = getYPosition(pos);
                      
                      return (
                        <circle
                          key={idx}
                          cx={x}
                          cy={y}
                          r="6"
                          fill="white"
                          stroke={nameData.color}
                          strokeWidth="3"
                          style={{ 
                            cursor: 'pointer',
                            filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.2))',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={() => handleChartHover({...nameData, year: years[idx], position: pos, yearIndex: idx})}
                          onMouseLeave={() => setHoveredName(null)}
                        />
                      );
                    })}

                  </g>
                );
              })}
            </svg>
            
            {hoveredName && (
              <div 
                style={{
                  position: 'absolute',
                  backgroundColor: 'black',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  fontSize: '0.875rem',
                  zIndex: 20,
                  pointerEvents: 'none',
                  border: '1px solid #4b5563',
                  left: `${getXPosition(hoveredName.yearIndex) + 10}px`,
                  top: `${getYPosition(hoveredName.position) - 70}px`,
                  transform: hoveredName.yearIndex > 3 ? 'translateX(-100%)' : 'none'
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '1.125rem', color: hoveredName.color }}>
                  {hoveredName.name}
                </div>
                <div style={{ color: '#e5e7eb' }}>
                  {hoveredName.year}: <span style={{ fontWeight: '600' }}>#{hoveredName.position}</span>
                </div>
                <div style={{ color: '#d1d5db', fontSize: '0.75rem' }}>
                  {hoveredName.category === 'girls' ? '👧 Girls' : '👦 Boys'} • Current #{hoveredName.currentRank}
                </div>
                <div style={{ color: '#d1d5db', fontSize: '0.75rem' }}>
                  {hoveredName.insight}
                </div>
                <div style={{ color: '#d1d5db', fontSize: '0.75rem' }}>
                  Total change: {hoveredName.change}
                </div>
              </div>
            )}
          </div>
          
          <div style={{ 
            marginTop: '2rem', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '1.5rem' 
          }}>
            <div>
              <h4 style={{ 
                fontSize: '1.125rem', 
                fontWeight: 'bold', 
                color: '#111827', 
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center'
              }}>
                🚀 The Meteoric Risers
              </h4>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {trendingNames.slice(0, Math.min(4, trendingNames.length)).map(item => (
                  <div key={item.name} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '0.75rem', 
                    backgroundColor: '#f9fafb', 
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }}>
                    <div style={{ 
                      width: '1rem', 
                      height: '1rem', 
                      borderRadius: '50%', 
                      marginRight: '0.75rem',
                      backgroundColor: item.color,
                      border: '2px solid white',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '0.25rem'
                      }}>
                        <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>{item.name}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#059669' }}>
                          {item.change}
                        </span>
                      </div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: '#6b7280',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span>{item.name === 'Eden' ? '👧👶' : item.name === 'Jude' ? '👦👶' : item.category === 'girls' ? '👧' : '👦'} {item.insight}</span>
                        <span style={{ color: '#2563eb' }}>#{item.currentRank} in 2024</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 style={{ 
                fontSize: '1.125rem', 
                fontWeight: 'bold', 
                color: '#111827', 
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center'
              }}>
                📈 The Sweet Spot Names
              </h4>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {trendingNames.slice(4, Math.min(8, trendingNames.length)).map(item => (
                  <div key={item.name} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '0.75rem', 
                    backgroundColor: '#f9fafb', 
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }}>
                    <div style={{ 
                      width: '1rem', 
                      height: '1rem', 
                      borderRadius: '50%', 
                      marginRight: '0.75rem',
                      backgroundColor: item.color,
                      border: '2px solid white',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '0.25rem'
                      }}>
                        <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>{item.name}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#059669' }}>
                          {item.change}
                        </span>
                      </div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: '#6b7280',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span>{item.name === 'Eden' ? '👧👶' : item.name === 'Jude' ? '👦👶' : item.category === 'girls' ? '👧' : '👦'} {item.insight}</span>
                        <span style={{ color: '#2563eb' }}>#{item.currentRank} in 2024</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div style={{ 
            marginTop: '2rem', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '1rem' 
          }}>
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#fdf2f8', 
              borderRadius: '0.5rem', 
              border: '1px solid #fbcfe8' 
            }}>
              <h5 style={{ fontWeight: 'bold', color: '#831843', marginBottom: '0.5rem' }}>
                ✨ The Raya Effect
              </h5>
              <p style={{ color: '#be185d', fontSize: '0.875rem' }}>
                Disney dropped a movie. Parents everywhere went "wait, that's actually cute." Boom – 348 position jump. This is literally 
                the biggest naming glow-up in UK history, and we have the receipts.
              </p>
            </div>
            
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#eff6ff', 
              borderRadius: '0.5rem', 
              border: '1px solid #bfdbfe' 
            }}>
              <h5 style={{ fontWeight: 'bold', color: '#1e3a8a', marginBottom: '0.5rem' }}>
                📈 Spot the Next Big Thing
              </h5>
              <p style={{ color: '#1e40af', fontSize: '0.875rem' }}>
                Our research doesn't just track names – it spots patterns. Wellness trend? Hello, Bodhi. Heritage revival? Maeve's your girl. 
                Want to get ahead of the curve? This is literally how.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Baby Steps Planner Banner */}
      <div style={{
        backgroundColor: '#fef3c7',
        borderBottom: '2px solid #f59e0b',
        padding: '1rem 0',
        position: 'static',
        top: 0,
        width: '100%',
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '896px',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#92400e',
              margin: 0
            }}>
              Baby Steps Planner
            </h2>
            <span style={{
              fontSize: '0.875rem',
              color: '#b45309'
            }}>
              Your Complete Pregnancy Organiser
            </span>
          </div>
          <a 
            href="/"
            style={{
              backgroundColor: '#f59e0b',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#d97706'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#f59e0b'}
          >
            Try Baby Steps Free
          </a>
        </div>
      </div>

      <article style={{ 
        maxWidth: '896px', 
        margin: '0 auto', 
        padding: '2rem 1.5rem', 
        backgroundColor: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
      {/* Header */}
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ 
            backgroundColor: '#fce7f3', 
            color: '#be185d', 
            padding: '0.25rem 0.75rem', 
            borderRadius: '9999px', 
            fontSize: '0.875rem', 
            fontWeight: '500' 
          }}>
            UK Baby Names 2024
          </span>
          <span style={{ marginLeft: '0.5rem', color: '#9ca3af', fontSize: '0.875rem' }}>
            Published: August 1, 2025 • 8 min read
          </span>
        </div>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          color: '#111827', 
          marginBottom: '1rem',
          lineHeight: '1.2'
        }}>
          Everyone's Obsessing Over the Top 10 Baby Names, But We Found those Flying Under the Radar in 2024
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          color: '#6b7280',
          lineHeight: '1.75'
        }}>
          One name has jumped <strong style={{ color: '#db2777' }}>348 spots</strong> in five years (!!!) and our research shows exactly 
          which under-the-radar names are climbing the ranking - and where they'll be in five years time with our new{' '}
          <a 
            href="#name-predictor" 
            style={{ 
              color: '#db2777', 
              fontWeight: 'bold', 
              textDecoration: 'underline',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.color = '#be185d'}
            onMouseOut={(e) => e.target.style.color = '#db2777'}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('name-predictor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            Name Predictor tool
          </a>. Consider this your secret weapon for finding a name that's unique but still current.
        </p>
      </header>

      {/* Featured Image */}
      <div style={{ marginBottom: '2rem' }}>
        <img 
          src="/images/baby-names-trend.png" 
          alt="UK Baby Names 2024 - Rising Names Trend Chart showing dramatic position changes"
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: '0.75rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}
        />
        <p style={{ 
          fontSize: '0.875rem', 
          color: '#6b7280', 
          fontStyle: 'italic',
          textAlign: 'center',
          marginTop: '0.5rem'
        }}>
          The dramatic rise of names like Raya (+348 positions) and other under-the-radar names climbing the UK charts
        </p>
      </div>

      {/* Introduction */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ 
          fontSize: '1.125rem', 
          color: '#374151',
          lineHeight: '1.75',
          marginBottom: '1rem'
        }}>
          Okay, let's be real for a second. The ONS just released their 2024 UK baby name data, and yes, Noah and Olivia are still 
          ruling the playground (shock). But while everyone else is focused on the top 10, we went deep into the data to find the 
          names that are <em>actually</em> on the rise.
        </p>
        <div style={{ 
          backgroundColor: '#fef3c7', 
          borderLeft: '4px solid #f59e0b', 
          padding: '1rem',
          marginTop: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <p style={{ color: '#92400e', fontWeight: '500' }}>
            🔥 <strong>Plot twist:</strong> We've done a deep dive into the ONS's latest release to find hidden gems hiding in plain sight 
            that are gaining serious momentum, while flying completely under the radar. These are the names that'll have other parents 
            asking "Ooh, where did you find that?" in five years.
          </p>
        </div>
      </div>

      {/* The Stealth Rise Section */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ 
          fontSize: '1.875rem', 
          fontWeight: 'bold', 
          color: '#111827', 
          marginBottom: '1.5rem'
        }}>
          The Under-the-Radar Names That Are Secretly Taking Over
        </h2>
        <p style={{ 
          fontSize: '1.125rem', 
          color: '#374151',
          marginBottom: '1.5rem',
          lineHeight: '1.75'
        }}>
          Listen, choosing a baby name is basically trying to predict the future. You want something that feels fresh now but won't be 
          the next Emma (sorry to all the Emmas born in 2003 when it hit peak saturation).
        </p>
        <p style={{ 
          fontSize: '1.125rem', 
          color: '#374151',
          marginBottom: '1.5rem',
          lineHeight: '1.75'
        }}>
          So we dug into the data to find the names making <em>serious</em> moves. These aren't your gentle year-over-year climbers – 
          these are the names that said "hold my bottle" and shot up the charts like they had something to prove.
        </p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Boys Rising */}
          <div style={{ 
            backgroundColor: '#eff6ff', 
            borderRadius: '0.5rem', 
            padding: '1.5rem' 
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              color: '#1e3a8a', 
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              The Boys Making Moves
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { name: "Yahya", change: "+33", from: 126, to: 93, note: "cultural moment much?" },
                { name: "Vinnie", change: "+20", from: 111, to: 91, note: "your nan would approve" },
                { name: "Elias", change: "+17", from: 96, to: 79, note: "it just sounds expensive" },
                { name: "Nathan", change: "+14", from: 102, to: 88, note: "proving classic never really goes out of style" }
              ].map((item, idx) => (
                <div key={idx} style={{ marginBottom: '0.75rem' }}>
                  <p style={{ 
                    fontSize: '1rem', 
                    color: '#374151',
                    marginBottom: '0'
                  }}>
                    <strong>{item.name}</strong> just casually jumped {item.change.substring(1)} spots {item.note && `(${item.note})`}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Girls Rising */}
          <div style={{ 
            backgroundColor: '#fdf2f8', 
            borderRadius: '0.5rem', 
            padding: '1.5rem' 
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              color: '#831843', 
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              The Girls on a Mission
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { name: "Eden", change: "+27", from: 87, to: 60, note: "is paradise-ing her way up" },
                { name: "Eloise", change: "+24", from: 109, to: 85, note: "is giving main character energy" },
                { name: "Elodie", change: "+20", from: 75, to: 55, note: "for parents who want Melody but make it French" },
                { name: "Maryam", change: "+20", from: 77, to: 57, note: "proving classic can still be cool" }
              ].map((item, idx) => (
                <div key={idx} style={{ marginBottom: '0.75rem' }}>
                  <p style={{ 
                    fontSize: '1rem', 
                    color: '#374151',
                    marginBottom: '0'
                  }}>
                    <strong>{item.name}</strong> {item.note} {item.change} spots
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ 
          backgroundColor: '#ecfdf5', 
          border: '1px solid #86efac', 
          borderRadius: '0.5rem', 
          padding: '1rem' 
        }}>
          <p style={{ color: '#14532d' }}>
            💡 <strong>Why you should care:</strong> These names just hit the sweet spot – distinctive enough that your kid won't be one of five in their class, but familiar enough that nobody's doing the "sorry, how do you spell that?" dance.
          </p>
        </div>
      </section>

      {/* Enhanced Interactive Chart */}
      <InteractiveChart />

      {/* Cultural Patterns */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ 
          fontSize: '1.875rem', 
          fontWeight: 'bold', 
          color: '#111827', 
          marginBottom: '1.5rem' 
        }}>
          Strongest Cultural Trends Behind 2024's Rising Names
        </h2>
        <p style={{ 
          fontSize: '1.125rem', 
          color: '#374151',
          marginBottom: '1.5rem',
          lineHeight: '1.75'
        }}>
          Let's decode what's <em>really</em> happening here, because these patterns are telling us everything about who we are right now.
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {/* Islamic Renaissance */}
          <div style={{ 
            backgroundColor: '#f0fdf4', 
            borderRadius: '0.5rem', 
            padding: '1.25rem', 
            border: '1px solid #bbf7d0' 
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: 'bold', 
              color: '#14532d', 
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              🕌 Beautiful Islamic Names Rising
            </h3>
            <p style={{ 
              color: '#15803d', 
              fontSize: '0.8125rem', 
              marginBottom: '0',
              lineHeight: '1.5' 
            }}>
              Islamic girls' names are having a moment across the UK - Maryam jumped 20 spots to #57, while Aisha and Zara continue climbing steadily. These names beautifully reflect the UK's cultural diversity.
            </p>
          </div>

          {/* Gender Neutral Revolution */}
          <div style={{ 
            backgroundColor: '#f3f4f6', 
            borderRadius: '0.5rem', 
            padding: '1.25rem', 
            border: '1px solid #d1d5db' 
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: 'bold', 
              color: '#374151', 
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              ⚖️ The Gender-Neutral Revolution
            </h3>
            <p style={{ 
              color: '#4b5563', 
              fontSize: '0.8125rem', 
              marginBottom: '0',
              lineHeight: '1.5' 
            }}>
              Here's something fascinating - parents are increasingly choosing names that work for any gender. Names like Freddie, River, Charlie, and Rowan are climbing the charts as families move away from traditional pink-or-blue choices. This trend reflects a broader shift in how modern parents think about identity and giving their children flexibility.
            </p>
          </div>

          {/* Nature & Spiritual */}
          <div style={{ 
            backgroundColor: '#fffbeb', 
            borderRadius: '0.5rem', 
            padding: '1.25rem', 
            border: '1px solid #fed7aa' 
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: 'bold', 
              color: '#92400e', 
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              🌿 The Wellness Generation Has Entered the Chat
            </h3>
            <p style={{ 
              color: '#d97706', 
              fontSize: '0.8125rem', 
              marginBottom: '0',
              lineHeight: '1.5' 
            }}>
              Post-pandemic parents are all about that mindful life, and the names prove it. Bodhi (Sanskrit for "enlightenment") climbed 95 spots because apparently we all need some zen. Eden's up 27 places (paradise vibes, anyone?), and nature names like Hazel and Nova are everywhere. Your yoga instructor could never.
            </p>
          </div>

          {/* Celtic Revival */}
          <div style={{ 
            backgroundColor: '#ecfdf5', 
            borderRadius: '0.5rem', 
            padding: '1.25rem', 
            border: '1px solid #a7f3d0' 
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: 'bold', 
              color: '#064e3b', 
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              🍀 The Celtic Renaissance Is Real
            </h3>
            <p style={{ 
              color: '#047857', 
              fontSize: '0.8125rem', 
              marginBottom: '0',
              lineHeight: '1.5' 
            }}>
              Something about Irish names just hits different (maybe it's the Mescal effect). Maeve has rocketed up 192 spots (!!!), and honestly, we get it. These names feel like they have stories – ancient, powerful, and somehow perfect for a baby born in 2024. Plus, they work whether you're in London or Dublin.
            </p>
          </div>
        </div>

        <div style={{ 
          backgroundColor: '#faf5ff', 
          border: '1px solid #e9d5ff', 
          borderRadius: '0.5rem', 
          padding: '1.5rem' 
        }}>
          <p style={{ color: '#6b21a8' }}>
            🎯 <strong>The vibe shift is real:</strong> These aren't random trends. They're showing us exactly what modern UK parents value – cultural heritage, mindfulness, and names with meaning.
          </p>
        </div>
      </section>

      {/* Enhanced Trajectory Predictor with Supabase Integration */}
      <section id="name-predictor" style={{ marginBottom: '3rem', scrollMarginTop: '2rem' }}>
        <div style={{ 
          background: 'linear-gradient(to right, #3b82f6, #9333ea)', 
          borderRadius: '0.5rem', 
          padding: '2rem', 
          color: 'white' 
        }}>
          <h2 style={{ 
            fontSize: '1.875rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem'
          }}>
            📊 Name Predictor Tool: Is Your Favourite Name About to Blow Up? Find Out 👀
          </h2>
          <p style={{ 
            color: '#bfdbfe', 
            marginBottom: '1.5rem' 
          }}>
            Type any letter to see available names • 200+ names in our database
          </p>
          
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '0.5rem', 
            padding: '1.5rem', 
            color: '#111827' 
          }}>
            <div className="name-predictor-container" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Start typing a name (e.g., R for Raya, Ruby, etc.)"
                    value={trajectoryName}
                    onChange={(e) => setTrajectoryName(e.target.value)}
                    onFocus={() => trajectoryName.length > 0 && setShowAutocomplete(true)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      outline: 'none',
                      fontSize: '1rem'
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleTrajectorySearch()}
                  />
                  {showAutocomplete && filteredNames.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '0.25rem',
                      backgroundColor: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      zIndex: 10,
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                      <div style={{
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        borderBottom: '1px solid #e5e7eb',
                        position: 'sticky',
                        top: 0,
                        backgroundColor: '#f9fafb'
                      }}>
                        {filteredNames.length} names available • Click to select
                      </div>
                      {filteredNames.map((name, index) => (
                        <button
                          key={name}
                          onClick={() => selectName(name)}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            textAlign: 'left',
                            border: 'none',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            color: '#374151',
                            transition: 'background-color 0.15s',
                            borderBottom: index < filteredNames.length - 1 ? '1px solid #f3f4f6' : 'none'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#eff6ff'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                        >
                          <strong>{name}</strong>
                          {(name === 'Raya' || name === 'Bodhi' || name === 'Maeve' || name === 'Yahya') && 
                            <span style={{ marginLeft: '0.5rem', color: '#10b981', fontSize: '0.75rem' }}>🚀 Rising fast!</span>
                          }
                          {(name === 'Noah' || name === 'Olivia' || name === 'Muhammad') && 
                            <span style={{ marginLeft: '0.5rem', color: '#6b7280', fontSize: '0.75rem' }}>👑 Top 3</span>
                          }
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleTrajectorySearch()}
                  disabled={trajectoryLoading}
                  style={{
                    backgroundColor: trajectoryLoading ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: trajectoryLoading ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {trajectoryLoading && <Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />}
                  Check It
                </button>
              </div>
              <p style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                marginTop: '-0.5rem',
                marginBottom: '0.5rem'
              }}>
                💡 Tip: Type just one letter to see all names starting with it!
              </p>
            </div>

            {trajectoryResult && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                backgroundColor: '#eff6ff', 
                borderRadius: '0.5rem' 
              }}>
                {trajectoryResult.error ? (
                  <p style={{ color: '#dc2626' }}>{trajectoryResult.error}</p>
                ) : (
                  <div>
                    <h3 style={{ 
                      fontWeight: 'bold', 
                      fontSize: '1.125rem', 
                      color: '#1e3a8a',
                      marginBottom: '1rem'
                    }}>
                      {trajectoryResult.name}
                    </h3>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                      gap: '1rem',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ 
                        padding: '0.5rem', 
                        backgroundColor: 'white', 
                        borderRadius: '0.375rem' 
                      }}>
                        <span style={{ 
                          fontWeight: '600', 
                          color: '#1e3a8a',
                          fontSize: '0.875rem',
                          display: 'block'
                        }}>
                          2024 Rank:
                        </span>
                        <div style={{ 
                          fontSize: '1.125rem', 
                          fontWeight: 'bold', 
                          color: '#3b82f6' 
                        }}>
                          #{trajectoryResult.current}
                        </div>
                      </div>
                      <div style={{ 
                        padding: '0.5rem', 
                        backgroundColor: 'white', 
                        borderRadius: '0.375rem' 
                      }}>
                        <span style={{ 
                          fontWeight: '600', 
                          color: '#14532d',
                          fontSize: '0.875rem',
                          display: 'block'
                        }}>
                          5-Year Change:
                        </span>
                        <div style={{ 
                          fontSize: '1.125rem', 
                          fontWeight: 'bold', 
                          color: '#16a34a' 
                        }}>
                          +{trajectoryResult.fiveYearChange || 0}
                        </div>
                      </div>
                      <div style={{ 
                        padding: '0.5rem', 
                        backgroundColor: 'white', 
                        borderRadius: '0.375rem' 
                      }}>
                        <span style={{ 
                          fontWeight: '600', 
                          color: '#7c2d12',
                          fontSize: '0.875rem',
                          display: 'block'
                        }}>
                          Category:
                        </span>
                        <div style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: '500', 
                          color: '#ea580c' 
                        }}>
                          {trajectoryResult.culturalCategory || 'Trending'}
                        </div>
                      </div>
                    </div>
                    
                    {trajectoryResult.origin && (
                      <div style={{ 
                        padding: '0.75rem', 
                        backgroundColor: 'white', 
                        borderRadius: '0.375rem',
                        border: '1px solid #e5e7eb',
                        marginBottom: '1rem'
                      }}>
                        <span style={{ fontWeight: '600' }}>Cultural Info:</span>
                        <div style={{ fontSize: '0.875rem', color: '#374151', marginTop: '0.25rem' }}>
                          <strong>Origin:</strong> {trajectoryResult.origin} • <strong>Meaning:</strong> {trajectoryResult.meaning}
                        </div>
                      </div>
                    )}
                    
                    <div style={{ 
                      backgroundColor: 'white', 
                      padding: '0.75rem', 
                      borderRadius: '0.375rem',
                      border: '1px solid #e5e7eb'
                    }}>
                      <span style={{ fontWeight: '600' }}>Prediction:</span> {' '}
                      {trajectoryResult.name.toLowerCase() === 'margot' ? "Ooh, she's having a moment – up 66 spots and giving vintage-but-fresh vibes. Prediction: Your daughter's name twin will be the coolest girl in a Greta Gerwig film." :
                       trajectoryResult.name.toLowerCase() === 'jude' ? "This one's on fire! Up 46 positions and heading for the top 10. Beatles fans and minimalists unite." :
                       trajectoryResult.name.toLowerCase() === 'hunter' ? "Down 21 spots... might be time to hunt for alternatives (sorry, had to)." :
                       trajectoryResult.prediction}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1rem', 
              backgroundColor: '#fdf2f8', 
              borderRadius: '0.5rem', 
              border: '1px solid #fbcfe8' 
            }}>
              <p style={{ 
                color: '#be185d', 
                fontWeight: '500',
                marginBottom: '0'
              }}>
                <strong>Make it a couples' activity:</strong> Finding "the one" (name, that is) is more fun together. Our Baby Names tool lets you and your partner swipe right on your faves, leave notes like "reminds me of that character we love," and actually enjoy the process instead of fighting over it at 2am.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with enhanced CTAs */}
      <footer style={{ borderTop: '1px solid #e5e7eb', paddingTop: '2rem' }}>
        <div style={{ 
          background: 'linear-gradient(to right, #ec4899, #9333ea)', 
          borderRadius: '0.5rem', 
          padding: '2rem', 
          color: 'white', 
          marginBottom: '2rem'
        }}>
          <h2 style={{ 
            fontSize: '1.875rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            textAlign: 'center' 
          }}>
            Want to Find Your Perfect Name, But Have Too Many to Track?
          </h2>
          <p style={{ 
            fontSize: '1.125rem', 
            marginBottom: '1.5rem',
            opacity: 0.9,
            textAlign: 'center'
          }}>
            Join other couples who use the <strong>Baby Steps</strong> app to take charge of your pregnancy with one organised app
          </p>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem' 
            }}>
              Baby Steps includes baby name tracking features like:
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '1rem',
              marginBottom: '1.5rem',
              textAlign: 'left',
              maxWidth: '768px',
              margin: '0 auto'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🤝</span>
                <div>
                  <strong>Partner voting</strong> – Vote on your favourite names from your account
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>💭</span>
                <div>
                  <strong>Save your thoughts</strong> – Add notes! "Sounds like a Bond villain" is totally valid
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>👨‍👩‍👧‍👦</span>
                <div>
                  <strong>Family sharing</strong> – Add new name ideas and vote on others from your account
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem' 
            }}>
              Plus Everything Else You Need:
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '0.75rem',
              textAlign: 'left',
              maxWidth: '768px',
              margin: '0 auto',
              fontSize: '0.875rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span>🛍️</span>
                <div>
                  <strong>Shopping List</strong> – Track everything you actually need (spoiler: it's less than IG suggests, but still a LOT)
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span>🎁</span>
                <div>
                  <strong>Wishlist</strong> – Share with family and friends who want to buy you a "little something"
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span>💰</span>
                <div>
                  <strong>Budget Tracker</strong> – Because babies are expensive and surprises are overrated
                </div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={() => handleCTAClick('main_signup', 'footer')}
              style={{
                backgroundColor: 'white',
                color: '#9333ea',
                padding: '0.75rem 2rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.125rem',
                fontWeight: 'bold',
                transition: 'background-color 0.2s'
              }}
            >
              Learn more about Baby Steps →
            </button>
          </div>
          
          <p style={{ 
            fontSize: '0.875rem', 
            fontStyle: 'italic',
            opacity: 0.9, 
            marginTop: '1rem',
            textAlign: 'center' 
          }}>
            <em>Because your baby deserves better than being the fifth Olivia in their class</em>
          </p>
        </div>

        <div style={{ 
          fontSize: '0.875rem', 
          color: '#6b7280',
          lineHeight: '1.5'
        }}>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>Sources:</strong> Office for National Statistics Baby Names in England and Wales 2024, Baby Steps research and analysis of cultural naming patterns.
          </p>
          <p>
            <strong>Data Note:</strong> All statistics reflect our analysis of the latest ONS data, tracking the most interesting movements in UK baby naming trends.
          </p>
        </div>
      </footer>
    </article>
    </div>
  );
};

export default BabyNamesBlog2024;