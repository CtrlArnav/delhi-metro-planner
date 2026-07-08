/**
 * Travel Time Estimator for Delhi Metro
 * 
 * Estimates total journey time based on:
 * 
 * 1. Travel time between stations: varies by segment distance
 *    Average speed: ~45 km/h (including stops) = 0.75 km/min
 *    So time = distance / 0.75 minutes per km
 * 
 * 2. Dwell time at each station: ~25 seconds (actual DMRC standard)
 * 
 * 3. Interchange penalty: ~5 minutes
 *    (walking between platforms + waiting for next train on new line)
 * 
 * 4. Initial wait time: depends on line-specific frequency
 *    Yellow Line peak: every 2-3 min (wait ~1.5 min)
 *    Grey Line off-peak: every 10-15 min (wait ~7 min)
 * 
 * Train frequencies are now per-line from frequencies.js
 */

const { getAverageWaitTime, getFrequency } = require('../data/frequencies');
const { calculateRouteDistance } = require('../data/distances');

const AVG_SPEED_KM_PER_MIN = 0.75; // 45 km/h average including stops
const DWELL_TIME_SECONDS = 25;     // actual DMRC standard: ~20-25 sec
const INTERCHANGE_PENALTY_MINUTES = 5;

/**
 * Estimate total travel time for a route
 * 
 * @param {Array|number} pathOrCount - Route path array OR station count (fallback)
 * @param {number} interchangeCount - Number of line changes
 * @param {number} hour - Hour of day (0-23)
 * @param {Array} linesUsed - Array of line names (used if pathOrCount is a number)
 * @returns {Object} Time breakdown
 */
function estimateTravelTime(pathOrCount, interchangeCount, hour = 10, linesUsed = []) {
  let travelTime;
  let dwellTime;
  let stationCount;

  if (Array.isArray(pathOrCount)) {
    stationCount = pathOrCount.length;
    
    // Calculate actual travel time based on segment distances
    const distanceData = calculateRouteDistance(pathOrCount);
    travelTime = Math.round((distanceData.totalKm / AVG_SPEED_KM_PER_MIN) * 10) / 10;
    
    // Dwell time at intermediate stations (exclude source and destination)
    dwellTime = Math.round(((stationCount - 2) * DWELL_TIME_SECONDS / 60) * 10) / 10;
    
    // Get lines used from path
    linesUsed = [...new Set(pathOrCount.map(p => p.line))];
  } else {
    stationCount = pathOrCount;
    // Fallback: use old estimation
    travelTime = (stationCount - 1) * 2.0;
    dwellTime = Math.round(((stationCount - 2) * DWELL_TIME_SECONDS / 60) * 10) / 10;
  }

  // Get line-specific wait times
  const waitData = getAverageWaitTime(linesUsed.length > 0 ? linesUsed : ['Blue'], hour);
  const initialWait = waitData.initialWait;

  // Interchange time: base 5 min + wait for next train on the new line
  let interchangeTime = interchangeCount * INTERCHANGE_PENALTY_MINUTES;

  // If we know which lines, add the specific wait time for each transfer
  if (linesUsed.length > 1) {
    for (let i = 1; i < linesUsed.length; i++) {
      const lineWait = waitData.interchangeWaits[linesUsed[i]] || 3;
      interchangeTime += lineWait;
    }
    // Remove the base penalty for those interchanges since we added specific ones
    interchangeTime -= interchangeCount * INTERCHANGE_PENALTY_MINUTES;
  }

  const totalMinutes = travelTime + dwellTime + interchangeTime + initialWait;

  // Get frequency label for the primary line
  const primaryFreq = linesUsed.length > 0 
    ? getFrequency(linesUsed[0], hour)
    : { label: 'every 4-8 min' };

  return {
    totalMinutes: Math.round(totalMinutes),
    breakdown: {
      travelTime: Math.round(travelTime * 10) / 10,
      dwellTime: Math.round(dwellTime * 10) / 10,
      interchangeTime: Math.round(interchangeTime * 10) / 10,
      initialWait: Math.round(initialWait * 10) / 10
    },
    isPeakHour: primaryFreq.isPeak,
    trainFrequency: primaryFreq.label,
    lineFrequencies: waitData.frequencies
  };
}

/**
 * Format minutes into human-readable string
 */
function formatTime(minutes) {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
}

module.exports = { estimateTravelTime, formatTime };
