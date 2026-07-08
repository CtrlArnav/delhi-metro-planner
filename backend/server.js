/**
 * Delhi Metro Route Planner - Express Server
 * 
 * This is the main entry point for the backend.
 * It initializes the graph, connects to MongoDB, and sets up API routes.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const MetroGraph = require('./utils/graphBuilder');
const createRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// Build the Metro Graph on server start
// ============================================
const graph = new MetroGraph();
graph.buildFromJSON();

// ============================================
// API Routes
// ============================================
const apiRouter = createRouter(graph);
app.use('/api', apiRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    stations: graph.stationList.length,
    graphNodes: graph.adjacencyList.size,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// MongoDB Connection (optional - used for caching/search history)
// ============================================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.log('⚠️  MongoDB not available (running without DB):', err.message);
    console.log('   The app works fine without MongoDB — it uses in-memory graph data.');
  });

// ============================================
// Search History Model (stores user queries)
// ============================================
const searchHistorySchema = new mongoose.Schema({
  from: String,
  to: String,
  algorithm: String,
  timestamp: { type: Date, default: Date.now }
});

let SearchHistory;
try {
  SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);
} catch (e) {
  // Model already compiled or mongoose not connected
  SearchHistory = null;
}

// Save search history endpoint
app.post('/api/history', async (req, res) => {
  if (!SearchHistory) {
    return res.json({ saved: false, reason: 'MongoDB not connected' });
  }
  try {
    const entry = new SearchHistory(req.body);
    await entry.save();
    res.json({ saved: true, entry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get recent searches
app.get('/api/history', async (req, res) => {
  if (!SearchHistory) {
    return res.json({ history: [] });
  }
  try {
    const history = await SearchHistory.find()
      .sort({ timestamp: -1 })
      .limit(10);
    res.json({ history });
  } catch (err) {
    res.json({ history: [] });
  }
});

// ============================================
// Start Server
// ============================================
app.listen(PORT, () => {
  console.log(`\n🚇 Delhi Metro Route Planner API`);
  console.log(`   Server running on http://localhost:${PORT}`);
  console.log(`   API base: http://localhost:${PORT}/api`);
  console.log(`\n   Try: http://localhost:${PORT}/api/route/compare?from=Rajiv Chowk&to=Hauz Khas\n`);
});
