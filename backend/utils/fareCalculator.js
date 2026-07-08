/**
 * Delhi Metro Fare Calculator
 * 
 * Based on DMRC revised fare slabs effective August 25, 2025
 * (first revision in 8 years, previous was 2017)
 * 
 * Source: Official DMRC announcement, Aug 25 2025
 * 
 * Weekday Fares (Mon-Sat):
 * Distance       | Fare
 * ---------------|--------
 * 0 - 2 km       | ₹11
 * 2 - 5 km       | ₹21
 * 5 - 12 km      | ₹32
 * 12 - 21 km     | ₹43
 * 21 - 32 km     | ₹54
 * 32+ km         | ₹64
 * 
 * Sunday & National Holiday Fares (discounted):
 * 0 - 2 km       | ₹11
 * 2 - 5 km       | ₹11
 * 5 - 12 km      | ₹21
 * 12 - 21 km     | ₹32
 * 21 - 32 km     | ₹43
 * 32+ km         | ₹54
 * 
 * Additional discounts:
 * - Smart Card: 10% off on every journey
 * - Off-peak hours (before 8 AM, 12-5 PM, after 9 PM): extra 10% off with smart card
 * 
 * Airport Express Line has separate fares (₹11 to ₹75) — not included here.
 * 
 * Distance calculation now uses actual inter-station distances per line.
 */

const { calculateRouteDistance } = require('../data/distances');

// Weekday fares (Mon-Sat)
const WEEKDAY_FARES = [
  { maxKm: 2,  fare: 11 },
  { maxKm: 5,  fare: 21 },
  { maxKm: 12, fare: 32 },
  { maxKm: 21, fare: 43 },
  { maxKm: 32, fare: 54 },
  { maxKm: Infinity, fare: 64 }
];

// Sunday & National Holiday fares (discounted)
const HOLIDAY_FARES = [
  { maxKm: 2,  fare: 11 },
  { maxKm: 5,  fare: 11 },
  { maxKm: 12, fare: 21 },
  { maxKm: 21, fare: 32 },
  { maxKm: 32, fare: 43 },
  { maxKm: Infinity, fare: 54 }
];

// Off-peak hours for smart card discount
const OFF_PEAK_HOURS = [
  { start: 0, end: 8 },    // before 8 AM
  { start: 12, end: 17 },  // 12 PM to 5 PM
  { start: 21, end: 24 }   // after 9 PM
];

/**
 * Calculate fare based on route path, day, and time
 * 
 * @param {Array|number} pathOrCount - Route path array [{station, line, ...}] OR station count (fallback)
 * @param {number} dayOfWeek - 0=Sunday, 6=Saturday
 * @param {number} hour - Hour of day (0-23)
 * @param {boolean} hasSmartCard - Whether user has a DMRC smart card
 * @returns {Object} Fare details
 */
function calculateFare(pathOrCount, dayOfWeek = 1, hour = 10, hasSmartCard = false) {
  let estimatedDistanceKm;
  let stationCount;

  if (Array.isArray(pathOrCount)) {
    // Use actual inter-station distances
    const distanceData = calculateRouteDistance(pathOrCount);
    estimatedDistanceKm = distanceData.totalKm;
    stationCount = pathOrCount.length;
  } else {
    // Fallback: use line-specific average (1.4 km if no line info)
    stationCount = pathOrCount;
    estimatedDistanceKm = (stationCount - 1) * 1.4;
  }

  // Determine if Sunday or National Holiday
  const isHoliday = dayOfWeek === 0;
  const fareSlabs = isHoliday ? HOLIDAY_FARES : WEEKDAY_FARES;

  // Find the matching slab
  let fare = 64; // default max
  let slab = '';

  const slabLabels = ['0-2 km', '2-5 km', '5-12 km', '12-21 km', '21-32 km', '32+ km'];

  for (let i = 0; i < fareSlabs.length; i++) {
    if (estimatedDistanceKm <= fareSlabs[i].maxKm) {
      fare = fareSlabs[i].fare;
      slab = slabLabels[i];
      break;
    }
  }

  // Apply smart card discount (10%)
  let smartCardDiscount = 0;
  if (hasSmartCard) {
    smartCardDiscount = Math.round(fare * 0.10);
  }

  // Apply off-peak discount (additional 10% with smart card)
  let offPeakDiscount = 0;
  const isOffPeak = OFF_PEAK_HOURS.some(
    ({ start, end }) => hour >= start && hour < end
  );
  if (hasSmartCard && isOffPeak) {
    offPeakDiscount = Math.round(fare * 0.10);
  }

  const finalFare = fare - smartCardDiscount - offPeakDiscount;

  return {
    fare: finalFare,
    baseFare: fare,
    currency: 'INR',
    estimatedDistanceKm: Math.round(estimatedDistanceKm * 10) / 10,
    slab,
    stations: stationCount,
    isHoliday,
    isOffPeak,
    smartCardDiscount,
    offPeakDiscount,
    discountInfo: hasSmartCard
      ? `Smart card: -₹${smartCardDiscount}${offPeakDiscount > 0 ? ` + Off-peak: -₹${offPeakDiscount}` : ''}`
      : null
  };
}

/**
 * Get all fare slabs for display
 */
function getFareSlabs() {
  return {
    weekday: [
      { range: '0 - 2 km', fare: 11 },
      { range: '2 - 5 km', fare: 21 },
      { range: '5 - 12 km', fare: 32 },
      { range: '12 - 21 km', fare: 43 },
      { range: '21 - 32 km', fare: 54 },
      { range: '32+ km', fare: 64 }
    ],
    holiday: [
      { range: '0 - 2 km', fare: 11 },
      { range: '2 - 5 km', fare: 11 },
      { range: '5 - 12 km', fare: 21 },
      { range: '12 - 21 km', fare: 32 },
      { range: '21 - 32 km', fare: 43 },
      { range: '32+ km', fare: 54 }
    ]
  };
}

module.exports = { calculateFare, getFareSlabs };
