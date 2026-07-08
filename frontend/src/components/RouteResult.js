import React, { useState } from 'react';

function RouteResult({ title, subtitle, data, isRecommended }) {
  const [showFull, setShowFull] = useState(false);

  if (!data || !data.path) return null;

  const lineColors = {
    'Red': '#EF4444',
    'Yellow': '#D4A017',
    'Blue': '#2563EB',
    'Green': '#16A34A',
    'Pink': '#DB2777',
    'Violet': '#7C3AED',
    'Magenta': '#C026D3',
    'Orange': '#EA580C',
    'Grey': '#6B7280',
    'Rapid': '#0891B2',
    'Airport Express': '#D97706',
    'Aqua': '#0284C7'
  };

  const getColor = (line) => lineColors[line] || '#888';

  const visiblePath = showFull ? data.path : data.path.slice(0, 8);
  const hasMore = data.path.length > 8;

  return (
    <div className={`route-result ${isRecommended ? 'recommended' : ''}`}>
      <div className="route-header">
        <div>
          <div className="route-title">{title}</div>
          <div className="route-subtitle">{subtitle}</div>
        </div>
        <div className="route-meta">
          <span className="meta-chip">
            <span className="value">{data.stations}</span> stations
          </span>
          <span className="meta-chip">
            <span className="value">{data.interchanges}</span> interchange{data.interchanges !== 1 ? 's' : ''}
          </span>
          {data.formattedTime && (
            <span className="meta-chip">
              <span className="value">{data.formattedTime}</span>
            </span>
          )}
        </div>
      </div>

      <div className="route-path">
        {visiblePath.map((step, idx) => {
          const isFirst = idx === 0;
          const isLast = showFull
            ? idx === data.path.length - 1
            : idx === visiblePath.length - 1 && !hasMore;

          return (
            <div
              key={idx}
              className={`path-station ${step.isInterchange ? 'interchange' : ''} ${isFirst ? 'start' : ''} ${isLast ? 'end' : ''}`}
            >
              <span className={`station-name ${step.isInterchange ? 'interchange-name' : ''}`}>
                {step.station}
              </span>
              <span className="line-tag" style={{ backgroundColor: getColor(step.line) }}>
                {step.line}
              </span>
              {step.isInterchange && (
                <span className="interchange-label">
                  Transfer from {step.fromLine}
                </span>
              )}
            </div>
          );
        })}

        {!showFull && hasMore && (
          <div className="path-station">
            <span className="station-name" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
              ... {data.path.length - 8} more stations ...
            </span>
          </div>
        )}
      </div>

      {hasMore && (
        <button
          className="toggle-path-btn"
          onClick={() => setShowFull(!showFull)}
        >
          {showFull ? 'Show less' : `Show all ${data.path.length} stations`}
        </button>
      )}
    </div>
  );
}

export default RouteResult;
