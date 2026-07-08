import React, { useState, useEffect } from 'react';
import StationSelector from './components/StationSelector';
import RouteResult from './components/RouteResult';
import AlgorithmComparison from './components/AlgorithmComparison';
import FareCard from './components/FareCard';
import { compareRoutes, fetchLines } from './utils/api';
import './App.css';

// Delhi Metro operates roughly 5:30 AM to 11:30 PM
// We show 5 AM to 11 PM for simplicity
const OPERATING_HOURS = Array.from({ length: 19 }, (_, i) => i + 5); // 5,6,...,23

function App() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay();

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [hour, setHour] = useState(
    OPERATING_HOURS.includes(currentHour) ? currentHour : 10
  );
  const [day, setDay] = useState(currentDay); // 0=Sun, 1=Mon, ..., 6=Sat
  const [hasSmartCard, setHasSmartCard] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lines, setLines] = useState([]);

  useEffect(() => {
    fetchLines().then(setLines).catch(console.error);
  }, []);

  const handleFindRoute = async () => {
    if (!from || !to) {
      setError('Select both source and destination stations.');
      return;
    }
    if (from === to) {
      setError('Source and destination cannot be the same.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await compareRoutes(from, to, hour, day, hasSmartCard);
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError('Could not connect to server. Make sure backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const formatHour = (h) => {
    if (h === 0) return '12 AM';
    if (h < 12) return `${h} AM`;
    if (h === 12) return '12 PM';
    return `${h - 12} PM`;
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const isSunday = day === 0;

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-mark">DMRC</span>
            <span className="brand-text">Route Planner</span>
          </div>
          <p className="tagline">
            Shortest and least crowded routes using Dijkstra and BFS
          </p>
        </div>
      </header>

      <main className="main">
        {/* Search */}
        <section className="search-section">
          <div className="search-card">
            <div className="search-fields">
              <div className="field">
                <label className="field-label">From</label>
                <StationSelector
                  value={from}
                  onChange={setFrom}
                  placeholder="Source station"
                />
              </div>

              <button className="swap-btn" onClick={handleSwap} title="Swap stations">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="17 1 21 5 17 9"></polyline>
                  <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                  <polyline points="7 23 3 19 7 15"></polyline>
                  <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                </svg>
              </button>

              <div className="field">
                <label className="field-label">To</label>
                <StationSelector
                  value={to}
                  onChange={setTo}
                  placeholder="Destination station"
                />
              </div>
            </div>

            {/* Travel options row */}
            <div className="options-row">
              <div className="option-group">
                <label className="field-label">Day</label>
                <div className="day-picker">
                  {dayLabels.map((label, idx) => (
                    <button
                      key={idx}
                      className={`day-btn ${day === idx ? 'active' : ''} ${idx === 0 ? 'sunday' : ''}`}
                      onClick={() => setDay(idx)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="option-group time-group">
                <label className="field-label">Time</label>
                <select
                  className="time-select"
                  value={hour}
                  onChange={(e) => setHour(parseInt(e.target.value))}
                >
                  {OPERATING_HOURS.map(h => (
                    <option key={h} value={h}>{formatHour(h)}</option>
                  ))}
                </select>
              </div>

              <div className="option-group">
                <label className="field-label">Smart Card</label>
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={hasSmartCard}
                    onChange={(e) => setHasSmartCard(e.target.checked)}
                  />
                  <span className="toggle-text">
                    {hasSmartCard ? 'Yes (10% off)' : 'No'}
                  </span>
                </label>
              </div>
            </div>

            {isSunday && (
              <div className="info-note">
                Sunday fares are discounted on most slabs.
              </div>
            )}

            <button
              className="search-btn"
              onClick={handleFindRoute}
              disabled={loading}
            >
              {loading ? 'Computing routes...' : 'Find Route'}
            </button>

            {error && <p className="error">{error}</p>}
          </div>
        </section>

        {/* Line Legend */}
        {lines.length > 0 && (
          <div className="line-legend">
            {lines.map(line => (
              <span key={line.name} className="line-chip">
                <span className="line-dot" style={{ backgroundColor: line.color }} />
                {line.name}
              </span>
            ))}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="results">
            <div className="recommendation">
              <strong>Recommended:</strong>{' '}
              {result.recommendation.algorithm === 'dijkstra'
                ? 'Dijkstra (min interchanges)'
                : 'BFS (min stations)'}
              {' — '}{result.recommendation.reason}
            </div>

            <AlgorithmComparison result={result} />
            <FareCard dijkstra={result.dijkstra} bfs={result.bfs} />

            <RouteResult
              title="Dijkstra — Min Interchanges"
              subtitle="Prefers staying on the same line even if more stops"
              data={result.dijkstra}
              isRecommended={result.recommendation.algorithm === 'dijkstra'}
            />

            <RouteResult
              title="BFS — Min Stations"
              subtitle="Fewest stops regardless of interchange count"
              data={result.bfs}
              isRecommended={result.recommendation.algorithm === 'bfs'}
            />
          </div>
        )}

        {/* Info (shown when no results) */}
        {!result && !loading && (
          <section className="info">
            <h2>How It Works</h2>
            <div className="info-grid">
              <div className="info-item">
                <h3>Dijkstra's Algorithm</h3>
                <p>
                  Finds the route with minimum interchanges using a priority queue.
                  Cost is compared lexicographically: (interchanges, stations).
                  A route with 0 interchanges and 15 stations beats 1 interchange and 5 stations.
                </p>
              </div>
              <div className="info-item">
                <h3>Breadth-First Search</h3>
                <p>
                  Finds the route with minimum stations by exploring level-by-level.
                  Guarantees fewest hops. May require more interchanges
                  compared to Dijkstra's output.
                </p>
              </div>
              <div className="info-item">
                <h3>State Expansion</h3>
                <p>
                  Nodes are represented as (station, line) pairs instead of just stations.
                  This allows the graph to track which line the passenger is on
                  and properly model interchange costs.
                </p>
              </div>
              <div className="info-item">
                <h3>Crowd Estimation</h3>
                <p>
                  Heuristic model based on time of day, line popularity, and day of week.
                  Rush hours (8-11 AM, 5-8 PM) increase crowd scores.
                  Uses known ridership patterns, not real-time data.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>Delhi Metro Route Planner — Built with MERN Stack and Graph Algorithms</p>
        <p className="footer-sub">
          Dataset: DMRC (235 stations) | Fares as of Aug 25, 2025 | Metro hours: ~5:30 AM – 11:30 PM
        </p>
      </footer>
    </div>
  );
}

export default App;
