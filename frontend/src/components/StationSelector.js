import React, { useState, useEffect, useRef } from 'react';
import { fetchStations } from '../utils/api';

function StationSelector({ value, onChange, placeholder }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [allStations, setAllStations] = useState([]);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    fetchStations()
      .then(stations => setAllStations(stations))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (text) => {
    setQuery(text);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.length === 0) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      const lower = text.toLowerCase();
      const filtered = allStations
        .filter(s => s.name.toLowerCase().includes(lower))
        .slice(0, 15);
      setSuggestions(filtered);
      setIsOpen(filtered.length > 0);
      setHighlightIdx(-1);
    }, 150);
  };

  const handleSelect = (station) => {
    setQuery(station.name);
    onChange(station.name);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightIdx >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightIdx]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="station-selector" ref={wrapperRef}>
      <input
        type="text"
        className="station-input"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => query.length > 0 && suggestions.length > 0 && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
      />

      {isOpen && suggestions.length > 0 && (
        <div className="dropdown">
          {suggestions.map((station, idx) => (
            <div
              key={station.name}
              className="dropdown-item"
              style={{
                background: idx === highlightIdx ? 'var(--bg-subtle)' : 'transparent'
              }}
              onClick={() => handleSelect(station)}
              onMouseEnter={() => setHighlightIdx(idx)}
            >
              {station.isInterchange && <span className="interchange-dot" />}
              <span>{station.name}</span>
              {station.isInterchange && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  {station.lines.length} lines
                </span>
              )}
            </div>
          ))}
          <div className="dropdown-footer">
            {suggestions.length} results
          </div>
        </div>
      )}
    </div>
  );
}

export default StationSelector;
