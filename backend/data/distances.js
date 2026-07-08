/**
 * Delhi Metro Inter-Station Distance Data
 * 
 * Sources:
 * - Red Line: delhimetrorail.info (cumulative distances from Shaheed Sthal)
 * - Other lines: Line total length / number of stations
 * 
 * Line totals (from DMRC):
 * - Red Line:       34.55 km, 29 stations
 * - Yellow Line:    49.02 km, 27 stations
 * - Blue Line:      56.11 km, 50 stations
 * - Blue Branch:     8.51 km,  8 stations
 * - Green Line:     28.79 km, 23 stations
 * - Violet Line:    46.34 km, 34 stations
 * - Pink Line:      59.24 km, 38 stations
 * - Magenta Line:   37.46 km, 25 stations
 * - Grey Line:       5.19 km,  4 stations
 * - Airport Express: 22.91 km, 6 stations
 * - Aqua Line:      29.17 km, 21 stations
 * - Rapid Metro:    12.85 km, 11 stations
 * 
 * For lines where we have explicit station-to-station data, we use it.
 * For others, we fall back to the line-specific average.
 */

// Red Line cumulative distances from Shaheed Sthal (in km)
const RED_LINE_DISTANCES = {
  'Shaheed Sthal': 0.0,
  'Hindon River': 1.0,
  'Arthala': 2.5,
  'Mohan Nagar': 3.2,
  'Shyam Park': 4.5,
  'Major Mohit Sharma Rajendra Nagar': 5.7,
  'Raj Bagh': 6.9,
  'Shaheed Nagar': 8.2,
  'Dilshad Garden': 9.4,
  'Jhilmil': 10.3,
  'Mansarovar Park': 11.4,
  'Shahdara': 12.5,
  'Welcome': 13.7,
  'Seelampur': 14.8,
  'Shastri Park': 16.4,
  'Kashmere Gate': 18.5,
  'Tis Hazari': 19.7,
  'Pul Bangash': 20.6,
  'Pratap Nagar': 21.4,
  'Shastri Nagar': 23.1,
  'Inderlok': 24.3,
  'Kanhaiya Nagar': 25.5,
  'Keshav Puram': 26.2,
  'Netaji Subhash Place': 27.4,
  'Kohat Enclave': 28.6,
  'Pitam Pura': 29.6,
  'Rohini East': 30.4,
  'Rohini West': 31.7,
  'Rithala': 32.7
};

// Per-line average inter-station distance (km)
// Calculated from: total line length / (number of stations - 1)
const LINE_AVG_DISTANCE = {
  'Red': 1.16,           // 34.55 / 28 segments
  'Yellow': 1.89,        // 49.02 / 26 segments
  'Blue': 1.15,          // 56.11 / 49 segments
  'Green': 1.31,         // 28.79 / 22 segments
  'Violet': 1.40,        // 46.34 / 33 segments
  'Pink': 1.60,          // 59.24 / 37 segments
  'Magenta': 1.56,       // 37.46 / 24 segments
  'Grey': 1.73,          // 5.19 / 3 segments
  'Airport Express': 4.58, // 22.91 / 5 segments (much larger gaps!)
  'Orange': 4.58,        // Same as Airport Express
  'Aqua': 1.46,          // 29.17 / 20 segments
  'Rapid': 1.29          // 12.85 / 10 segments
};

/**
 * Get distance between two consecutive stations on the same line
 * 
 * @param {string} stationA - First station name
 * @param {string} stationB - Second station name
 * @param {string} lineName - Line they're both on
 * @returns {number} Distance in km
 */
function getSegmentDistance(stationA, stationB, lineName) {
  // For Red Line, we have exact data
  if (lineName === 'Red') {
    const distA = RED_LINE_DISTANCES[stationA];
    const distB = RED_LINE_DISTANCES[stationB];
    if (distA !== undefined && distB !== undefined) {
      return Math.abs(distB - distA);
    }
  }

  // For other lines, use the line-specific average
  return LINE_AVG_DISTANCE[lineName] || 1.4; // fallback: 1.4 km
}

/**
 * Calculate total distance for a route path
 * 
 * @param {Array} path - Array of {station, line} objects
 * @returns {Object} Distance details
 */
function calculateRouteDistance(path) {
  let totalDistance = 0;
  const segments = [];

  for (let i = 0; i < path.length - 1; i++) {
    const current = path[i];
    const next = path[i + 1];

    // Skip interchange steps (same station, different line)
    if (current.station === next.station) continue;

    const distance = getSegmentDistance(current.station, next.station, current.line);
    totalDistance += distance;

    segments.push({
      from: current.station,
      to: next.station,
      line: current.line,
      distanceKm: Math.round(distance * 100) / 100
    });
  }

  return {
    totalKm: Math.round(totalDistance * 10) / 10,
    segments
  };
}

module.exports = {
  getSegmentDistance,
  calculateRouteDistance,
  RED_LINE_DISTANCES,
  LINE_AVG_DISTANCE
};
