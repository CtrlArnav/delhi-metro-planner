/**
 * Delhi Metro Train Frequency Data (per line)
 * 
 * Source: stopie.com, delhimetrorail.co.in, metroeasy.com (2025 data)
 * 
 * Peak hours: 8:30-10:30 AM and 5:00-8:00 PM
 * Off-peak: all other operating hours
 * 
 * Frequencies are in minutes (headway between trains)
 */

const LINE_FREQUENCIES = {
  'Red': {
    peak: { min: 3, max: 5, avg: 4 },
    offPeak: { min: 6, max: 8, avg: 7 },
    note: 'One of the 3 busiest corridors, ~700k daily riders'
  },
  'Yellow': {
    peak: { min: 2, max: 3, avg: 2.5 },
    offPeak: { min: 5, max: 7, avg: 6 },
    note: 'Busiest line, highest frequency in the network'
  },
  'Blue': {
    peak: { min: 3, max: 4, avg: 3.5 },
    offPeak: { min: 6, max: 8, avg: 7 },
    note: 'Major east-west corridor, high ridership'
  },
  'Green': {
    peak: { min: 4, max: 6, avg: 5 },
    offPeak: { min: 7, max: 9, avg: 8 },
    note: 'Connects to Haryana'
  },
  'Violet': {
    peak: { min: 4, max: 6, avg: 5 },
    offPeak: { min: 7, max: 9, avg: 8 },
    note: 'North-south corridor through Central Delhi'
  },
  'Pink': {
    peak: { min: 5, max: 7, avg: 6 },
    offPeak: { min: 7, max: 13, avg: 10 },
    note: 'Ring road line, longest line by length'
  },
  'Magenta': {
    peak: { min: 5, max: 7, avg: 6 },
    offPeak: { min: 7, max: 9, avg: 8 },
    note: 'Connects to South Delhi and Botanical Garden'
  },
  'Grey': {
    peak: { min: 8, max: 12, avg: 10 },
    offPeak: { min: 10, max: 15, avg: 12 },
    note: 'Shortest line, lowest frequency'
  },
  'Airport Express': {
    peak: { min: 10, max: 10, avg: 10 },
    offPeak: { min: 15, max: 20, avg: 17 },
    note: 'Premium service, fixed schedule'
  },
  'Orange': {
    peak: { min: 10, max: 10, avg: 10 },
    offPeak: { min: 15, max: 20, avg: 17 },
    note: 'Same as Airport Express'
  },
  'Aqua': {
    peak: { min: 6, max: 10, avg: 8 },
    offPeak: { min: 10, max: 15, avg: 12 },
    note: 'Noida Metro, operated by NMRC'
  },
  'Rapid': {
    peak: { min: 5, max: 7, avg: 6 },
    offPeak: { min: 10, max: 15, avg: 12 },
    note: 'Gurugram Rapid Metro'
  }
};

/**
 * Get train frequency for a specific line at a given time
 * 
 * @param {string} lineName - Metro line name
 * @param {number} hour - Hour of day (0-23)
 * @returns {Object} Frequency details
 */
function getFrequency(lineName, hour) {
  const lineData = LINE_FREQUENCIES[lineName];
  if (!lineData) {
    return { avg: 6, min: 4, max: 8, isPeak: false, label: 'every 4-8 min' };
  }

  // Peak hours: 8:30-10:30 AM and 5-8 PM
  const isPeak = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20);

  const freq = isPeak ? lineData.peak : lineData.offPeak;

  return {
    avg: freq.avg,
    min: freq.min,
    max: freq.max,
    isPeak,
    label: `every ${freq.min}-${freq.max} min`,
    note: lineData.note
  };
}

/**
 * Get average wait time for a route (based on lines used)
 * Wait time is approximately half the headway on average
 * 
 * @param {Array} linesUsed - Array of line names used in route
 * @param {number} hour - Hour of day
 * @returns {Object} Wait time details
 */
function getAverageWaitTime(linesUsed, hour) {
  // For the initial wait, use the first line's frequency
  const firstLine = linesUsed[0];
  const firstFreq = getFrequency(firstLine, hour);
  const initialWait = Math.round(firstFreq.avg / 2 * 10) / 10; // avg wait = half headway

  // For interchange waits, use the frequency of the line being transferred TO
  const interchangeWaits = {};
  for (const line of linesUsed) {
    const freq = getFrequency(line, hour);
    interchangeWaits[line] = Math.round(freq.avg / 2 * 10) / 10;
  }

  return {
    initialWait,
    interchangeWaits,
    frequencies: linesUsed.map(line => ({
      line,
      ...getFrequency(line, hour)
    }))
  };
}

module.exports = { getFrequency, getAverageWaitTime, LINE_FREQUENCIES };
