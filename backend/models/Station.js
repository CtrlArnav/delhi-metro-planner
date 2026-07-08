const mongoose = require('mongoose');

/**
 * Station Schema for MongoDB
 * 
 * Used for caching station data and enabling fast text search.
 * The graph is built from JSON for speed, but MongoDB stores
 * station metadata for search and history features.
 */
const stationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  lines: [String],
  isInterchange: { type: Boolean, default: false },
  coordinates: {
    lat: Number,
    lng: Number
  }
});

// Text index for search
stationSchema.index({ name: 'text' });

module.exports = mongoose.model('Station', stationSchema);
