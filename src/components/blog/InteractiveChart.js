import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useEnhancedBlogData } from '../../hooks/useBabyNamesData';

const InteractiveChart = () => {
  const [hoveredName, setHoveredName] = useState(null);
  const [animationComplete, setAnimationComplete] = useState(false);
  
  const { trendingLoading, trackInteraction } = useEnhancedBlogData();

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

  const trendingNames = mockTrendingNames;
  const years = ['2019', '2020', '2021', '2022', '2023', '2024'];
  const maxPosition = 450;
  const chartHeight = 600;
  const chartWidth = 800;

  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const getYPosition = (position) => {
    return 80 + (position / maxPosition) * (chartHeight - 160);
  };

  const getXPosition = (yearIndex) => {
    return 80 + (yearIndex * (chartWidth - 160) / (years.length - 1));
  };

  const handleChartHover = (nameData) => {
    setHoveredName(nameData);
    trackInteraction('chart_hover', nameData.name, 'five_year_trajectory');
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

  if (trendingLoading) {
    return (
      <div className="chart-container">
        <div className="chart-wrapper">
          <div className="chart-loading">
            <div className="loading-content">
              <Loader2 className="loading-spinner" />
              <p className="loading-text">Loading live trending names data from ONS database...</p>
              <p className="loading-subtext">Fetching real-time rankings and trajectories</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes drawLine {
          from { stroke-dashoffset: 1000; }
          to { stroke-dashoffset: 0; }
        }
      ` }} />
      
      <div className="chart-wrapper">
        <div className="chart-header">
          <h3 className="chart-title">
            Watch These Names Go From Zero to Hero
          </h3>
          <p className="chart-description">
            Remember when nobody had heard of Raya, Bodhi, Maeve, or Yahya? This chart shows their incredible glow-up over five years. The grey lines? Those are your Olivers and Amelias doing their usual thing. The colourful lines? Those are the disruptors. <strong style={{ color: '#9333ea' }}>Hover to see the magic happen!</strong>
          </p>
        </div>
        
        <div className="chart-svg-container">
          <svg width={chartWidth} height={chartHeight} className="chart-svg">
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
            {stableNames.map((nameData) => {
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
            
            {/* Dynamic trending names */}
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
                      strokeDasharray: '1000',
                      animation: `drawLine 2.5s ease-in-out forwards`,
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

                  <text 
                    x={getXPosition(years.length - 1) + 15} 
                    y={getYPosition(nameData.positions[nameData.positions.length - 1]) + 6} 
                    fontSize="16" 
                    fontWeight="bold" 
                    fill={nameData.color} 
                    style={{ filter: 'drop-shadow(1px 1px 2px rgba(255,255,255,0.8))' }}
                  >
                    {nameData.name}
                  </text>
                  
                  <text 
                    x={getXPosition(years.length - 1) + 15} 
                    y={getYPosition(nameData.positions[nameData.positions.length - 1]) + 22} 
                    fontSize="14" 
                    fontWeight="600" 
                    fill={nameData.color}
                  >
                    {nameData.change}
                  </text>
                </g>
              );
            })}
          </svg>
          
          {hoveredName && (
            <div 
              className="chart-tooltip"
              style={{
                left: `${getXPosition(hoveredName.yearIndex) + 10}px`,
                top: `${getYPosition(hoveredName.position) - 70}px`,
                transform: hoveredName.yearIndex > 3 ? 'translateX(-100%)' : 'none'
              }}
            >
              <div className="tooltip-name" style={{ color: hoveredName.color }}>
                {hoveredName.name}
              </div>
              <div className="tooltip-year">
                {hoveredName.year}: <span style={{ fontWeight: '600' }}>#{hoveredName.position}</span>
              </div>
              <div className="tooltip-category">
                {hoveredName.category === 'girls' ? '👧 Girls' : '👦 Boys'} • Current #{hoveredName.currentRank}
              </div>
              <div className="tooltip-category">
                {hoveredName.insight}
              </div>
              <div className="tooltip-category">
                Total change: {hoveredName.change}
              </div>
            </div>
          )}
        </div>
        
        <div className="chart-legend-container">
          <div>
            <h4 className="legend-section-title">🚀 The Meteoric Risers</h4>
            <div className="legend-grid">
              {trendingNames.slice(0, 4).map(item => (
                <div key={item.name} className="legend-item">
                  <div 
                    className="legend-color"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <div className="legend-text">
                    <div className="legend-name-row">
                      <span className="legend-name">{item.name}</span>
                      <span className="legend-change">{item.change}</span>
                    </div>
                    <div className="legend-info">
                      <span>{item.name === 'Eden' ? '👧👶' : item.name === 'Jude' ? '👦👶' : item.category === 'girls' ? '👧' : '👦'} {item.insight}</span>
                      <span className="legend-rank">#{item.currentRank} in 2024</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="legend-section-title">📈 The Sweet Spot Names</h4>
            <div className="legend-grid">
              {trendingNames.slice(4, 8).map(item => (
                <div key={item.name} className="legend-item">
                  <div 
                    className="legend-color"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <div className="legend-text">
                    <div className="legend-name-row">
                      <span className="legend-name">{item.name}</span>
                      <span className="legend-change">{item.change}</span>
                    </div>
                    <div className="legend-info">
                      <span>{item.name === 'Eden' ? '👧👶' : item.name === 'Jude' ? '👦👶' : item.category === 'girls' ? '👧' : '👦'} {item.insight}</span>
                      <span className="legend-rank">#{item.currentRank} in 2024</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="chart-info-grid">
          <div className="info-box info-pink">
            <h5 className="info-title">✨ The Raya Effect</h5>
            <p className="info-text">
              Disney dropped a movie. Parents everywhere went "wait, that's actually cute." Boom – 348 position jump. This is literally 
              the biggest naming glow-up in UK history, and we have the receipts.
            </p>
          </div>
          
          <div className="info-box info-blue">
            <h5 className="info-title">📈 Spot the Next Big Thing</h5>
            <p className="info-text">
              Our research doesn't just track names – it spots patterns. Wellness trend? Hello, Bodhi. Heritage revival? Maeve's your girl. 
              Want to get ahead of the curve? This is literally how.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveChart;