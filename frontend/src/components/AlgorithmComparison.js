import React from 'react';

function AlgorithmComparison({ result }) {
  if (!result) return null;

  const { dijkstra, bfs, recommendation } = result;

  return (
    <section className="comparison-section">
      <div className="comparison-grid">
        <ComparisonCard
          title="Dijkstra (Min Interchanges)"
          data={dijkstra}
          isRecommended={recommendation.algorithm === 'dijkstra'}
        />
        <ComparisonCard
          title="BFS (Min Stations)"
          data={bfs}
          isRecommended={recommendation.algorithm === 'bfs'}
        />
      </div>
    </section>
  );
}

function ComparisonCard({ title, data, isRecommended }) {
  return (
    <div className={`comparison-card ${isRecommended ? 'recommended' : ''}`}>
      <div className="comp-header">
        <span className="comp-title">{title}</span>
        {isRecommended && <span className="comp-badge">Recommended</span>}
      </div>

      <div className="comp-stats">
        <div className="comp-stat">
          <div className="comp-stat-value">{data.stations}</div>
          <div className="comp-stat-label">Stations</div>
        </div>
        <div className="comp-stat">
          <div className="comp-stat-value">{data.interchanges}</div>
          <div className="comp-stat-label">Interchanges</div>
        </div>
        <div className="comp-stat">
          <div className="comp-stat-value">{data.formattedTime || '--'}</div>
          <div className="comp-stat-label">Travel Time</div>
        </div>
        <div className="comp-stat">
          <div className="comp-stat-value">{data.fare ? `₹${data.fare.fare}` : '--'}</div>
          <div className="comp-stat-label">Fare</div>
        </div>
      </div>

      {data.crowd && (
        <div className="crowd-section">
          <div className="crowd-level">
            <div className="crowd-bar">
              <div
                className="crowd-fill"
                style={{
                  width: `${(data.crowd.overall.level / 5) * 100}%`,
                  backgroundColor: data.crowd.overall.color
                }}
              />
            </div>
            <span className="crowd-text">{data.crowd.overall.label}</span>
          </div>
          <div className="crowd-text" style={{ fontSize: '0.6875rem', marginTop: '0.25rem' }}>
            {data.crowd.suggestion}
          </div>

          {data.crowd.perLine && data.crowd.perLine.length > 1 && (
            <div style={{ marginTop: '0.5rem' }}>
              {data.crowd.perLine.map((lc, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', minWidth: '80px' }}>{lc.line}</span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>{lc.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Lines:</span>
        {data.lines?.map(line => (
          <span key={line} style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.625rem',
            padding: '0.125rem 0.375rem',
            borderRadius: '3px',
            backgroundColor: getLineColor(line),
            color: 'white',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {line}
          </span>
        ))}
      </div>
    </div>
  );
}

function getLineColor(line) {
  const colors = {
    'Red': '#EF4444', 'Yellow': '#D4A017', 'Blue': '#2563EB',
    'Green': '#16A34A', 'Pink': '#DB2777', 'Violet': '#7C3AED',
    'Magenta': '#C026D3', 'Orange': '#EA580C', 'Grey': '#6B7280',
    'Rapid': '#0891B2', 'Airport Express': '#D97706', 'Aqua': '#0284C7'
  };
  return colors[line] || '#888';
}

export default AlgorithmComparison;
