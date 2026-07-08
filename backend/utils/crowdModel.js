/**
 * Crowd Level Estimator for Delhi Metro
 * 
 * Simulates crowd levels based on:
 * 
 * 1. Time of day (rush hour patterns)
 * 2. Line-specific crowding (some lines are always busier)
 * 3. Day of week (weekdays vs weekends)
 * 
 * This is a heuristic model - not real-time data.
 * In production, you'd use actual ridership data from DMRC.
 * 
 * Crowd levels: 1 (Empty) to 5 (Extremely Crowded)
 */

// Base crowd levels for each line (1-5)
// These reflect real-world observations of Delhi Metro
const LINE_CROWD_BASE = {
  'Red': 4,            // Very crowded - connects densely populated areas
  'Yellow': 5,         // Most crowded - major north-south corridor
  'Blue': 5,           // Most crowded - major east-west corridor  
  'Green': 3,          // Moderate - fewer passengers
  'Pink': 3,           // Moderate - ring road line
  'Violet': 3,         // Moderate - connects to South Delhi
  'Magenta': 2,        // Less crowded - newer line
  'Orange': 2,         // Less crowded - airport express
  'Grey': 1,           // Least crowded - small line
  'Rapid': 2,          // Moderate - NCR rapid metro
  'Airport Express': 2, // Less crowded - premium service
  'Aqua': 1            // Least crowded - Noida
};

// Time-of-day multiplier (rush hour multiplier)
function getTimeMultiplier(hour) {
  // Morning rush: 8 AM - 11 AM
  if (hour >= 8 && hour <= 10) return 1.5;
  if (hour === 11) return 1.3;
  
  // Evening rush: 5 PM - 8 PM (even worse than morning!)
  if (hour >= 17 && hour <= 19) return 1.6;
  if (hour === 20) return 1.3;
  
  // Moderate hours
  if (hour >= 12 && hour <= 16) return 1.1;
  if (hour >= 6 && hour <= 7) return 1.2;
  if (hour === 21) return 1.1;
  
  // Off-peak (early morning, late night)
  return 0.6;
}

/**
 * Get crowd level for a specific line at a given time
 * 
 * @param {string} lineName - Name of the metro line
 * @param {number} hour - Hour of day (0-23)
 * @param {number} dayOfWeek - 0=Sunday, 6=Saturday
 * @returns {Object} Crowd level details
 */
function getCrowdLevel(lineName, hour, dayOfWeek = 1) {
  const baseCrowd = LINE_CROWD_BASE[lineName] || 3;
  const timeMultiplier = getTimeMultiplier(hour);
  
  // Weekend adjustment (less crowded)
  const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1.0;
  
  // Calculate raw score
  const rawScore = baseCrowd * timeMultiplier * weekendMultiplier;
  
  // Clamp to 1-5 range
  const level = Math.min(5, Math.max(1, Math.round(rawScore)));
  
  return {
    level,
    label: getCrowdLabel(level),
    emoji: getCrowdEmoji(level),
    color: getCrowdColor(level),
    line: lineName,
    hour,
    suggestion: getCrowdSuggestion(level)
  };
}

/**
 * Estimate crowd for an entire route
 */
function getRouteCrowdEstimate(linesUsed, hour, dayOfWeek = 1) {
  const lineCrowds = linesUsed.map(line => getCrowdLevel(line, hour, dayOfWeek));
  
  // Route crowd is the average of all lines used
  const avgLevel = Math.round(
    lineCrowds.reduce((sum, c) => sum + c.level, 0) / lineCrowds.length
  );
  
  return {
    overall: {
      level: avgLevel,
      label: getCrowdLabel(avgLevel),
      emoji: getCrowdEmoji(avgLevel),
      color: getCrowdColor(avgLevel)
    },
    perLine: lineCrowds,
    timeOfDay: getTimePeriod(hour),
    suggestion: getRouteSuggestion(avgLevel, hour)
  };
}

/**
 * Find the least crowded alternative route
 * Compares Dijkstra route vs BFS route and picks the less crowded one
 */
function findLeastCrowdedRoute(dijkstraResult, bfsResult, hour, dayOfWeek = 1) {
  const dijkstraCrowd = getRouteCrowdEstimate(dijkstraResult.lines, hour, dayOfWeek);
  const bfsCrowd = getRouteCrowdEstimate(bfsResult.lines, hour, dayOfWeek);
  
  // Pick the one with lower overall crowd level
  if (dijkstraCrowd.overall.level <= bfsCrowd.overall.level) {
    return {
      recommended: 'dijkstra',
      reason: 'Fewer interchanges and less crowded lines',
      dijkstraCrowd,
      bfsCrowd
    };
  } else {
    return {
      recommended: 'bfs',
      reason: 'Fewer stations means less time in crowded trains',
      dijkstraCrowd,
      bfsCrowd
    };
  }
}

// Helper functions
function getCrowdLabel(level) {
  const labels = { 1: 'Very Low', 2: 'Low', 3: 'Moderate', 4: 'High', 5: 'Very High' };
  return labels[level];
}

function getCrowdEmoji(level) {
  const emojis = { 1: '🟢', 2: '🟡', 3: '🟠', 4: '🔴', 5: '🔴🔴' };
  return emojis[level];
}

function getCrowdColor(level) {
  const colors = { 1: '#22c55e', 2: '#eab308', 3: '#f97316', 4: '#ef4444', 5: '#dc2626' };
  return colors[level];
}

function getCrowdSuggestion(level) {
  if (level <= 2) return 'Good time to travel! Plenty of seats available.';
  if (level === 3) return 'Moderate crowd. You might need to stand.';
  if (level === 4) return 'Heavy crowd. Consider traveling at a different time.';
  return 'Extremely crowded! Avoid if possible or travel off-peak.';
}

function getRouteSuggestion(level, hour) {
  if (level >= 4) {
    if (hour >= 8 && hour <= 11) return 'Morning rush hour — try leaving after 11 AM for a comfortable ride.';
    if (hour >= 17 && hour <= 20) return 'Evening rush hour — try leaving after 8 PM for a comfortable ride.';
    return 'This route is very crowded right now. Consider an alternative route.';
  }
  return 'This route looks comfortable for your travel time!';
}

function getTimePeriod(hour) {
  if (hour >= 6 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Afternoon';
  if (hour >= 17 && hour < 21) return 'Evening';
  return 'Night';
}

module.exports = { getCrowdLevel, getRouteCrowdEstimate, findLeastCrowdedRoute };
