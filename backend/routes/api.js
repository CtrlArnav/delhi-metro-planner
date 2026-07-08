/**
 * API Routes for Delhi Metro Route Planner
 */

const express = require('express');
const { findMinInterchangeRoute } = require('../utils/dijkstra');
const { findMinStationsRoute } = require('../utils/bfs');
const { calculateFare, getFareSlabs } = require('../utils/fareCalculator');
const { estimateTravelTime, formatTime } = require('../utils/timeEstimator');
const { getRouteCrowdEstimate, findLeastCrowdedRoute } = require('../utils/crowdModel');

function createRouter(graph) {
  const router = express.Router();

  // GET /api/stations
  router.get('/stations', (req, res) => {
    const stations = graph.getStationList();
    res.json({ count: stations.length, stations });
  });

  // GET /api/stations/search?q=keyword
  router.get('/stations/search', (req, res) => {
    const query = (req.query.q || '').toLowerCase();
    if (!query) return res.json({ stations: [] });

    const allStations = graph.getStationList();
    const results = allStations.filter(s =>
      s.name.toLowerCase().includes(query)
    ).slice(0, 10);

    res.json({ stations: results });
  });

  // GET /api/lines
  router.get('/lines', (req, res) => {
    const lines = graph.getLines();
    res.json({ count: lines.length, lines });
  });

  // GET /api/route?from=X&to=Y&hour=10&day=1&smartcard=true
  router.get('/route', (req, res) => {
    const { from, to } = req.query;
    const hour = parseInt(req.query.hour) || new Date().getHours();
    const day = parseInt(req.query.day) ?? new Date().getDay();
    const hasSmartCard = req.query.smartcard === 'true';

    if (!from || !to) {
      return res.status(400).json({ error: 'Please provide "from" and "to" query params' });
    }
    if (from === to) {
      return res.status(400).json({ error: 'Source and destination cannot be the same' });
    }

    const result = findMinInterchangeRoute(graph.adjacencyList, from, to, graph.stations);
    if (result.error) return res.status(404).json({ error: result.error });

    const fare = calculateFare(result.path, day, hour, hasSmartCard);
    const time = estimateTravelTime(result.path, result.interchanges, hour, result.lines);

    res.json({
      algorithm: 'Dijkstra (Min Interchanges)',
      from, to,
      ...result,
      fare,
      time,
      formattedTime: formatTime(time.totalMinutes)
    });
  });

  // GET /api/route/shortest?from=X&to=Y&hour=10&day=1&smartcard=true
  router.get('/route/shortest', (req, res) => {
    const { from, to } = req.query;
    const hour = parseInt(req.query.hour) || new Date().getHours();
    const day = parseInt(req.query.day) ?? new Date().getDay();
    const hasSmartCard = req.query.smartcard === 'true';

    if (!from || !to) {
      return res.status(400).json({ error: 'Please provide "from" and "to" query params' });
    }

    const result = findMinStationsRoute(graph.adjacencyList, from, to, graph.stations);
    if (result.error) return res.status(404).json({ error: result.error });

    const fare = calculateFare(result.path, day, hour, hasSmartCard);
    const time = estimateTravelTime(result.path, result.interchanges, hour, result.lines);

    res.json({
      algorithm: 'BFS (Min Stations)',
      from, to,
      ...result,
      fare,
      time,
      formattedTime: formatTime(time.totalMinutes)
    });
  });

  // GET /api/route/compare?from=X&to=Y&hour=10&day=1&smartcard=true
  router.get('/route/compare', (req, res) => {
    const { from, to } = req.query;
    const hour = parseInt(req.query.hour) || new Date().getHours();
    const day = parseInt(req.query.day) ?? new Date().getDay();
    const hasSmartCard = req.query.smartcard === 'true';

    if (!from || !to) {
      return res.status(400).json({ error: 'Please provide "from" and "to" query params' });
    }
    if (from === to) {
      return res.status(400).json({ error: 'Source and destination cannot be the same' });
    }

    const dijkstraResult = findMinInterchangeRoute(graph.adjacencyList, from, to, graph.stations);
    const bfsResult = findMinStationsRoute(graph.adjacencyList, from, to, graph.stations);

    if (dijkstraResult.error || bfsResult.error) {
      return res.status(404).json({ error: 'Route not found' });
    }

    const dijkstraFare = calculateFare(dijkstraResult.path, day, hour, hasSmartCard);
    const bfsFare = calculateFare(bfsResult.path, day, hour, hasSmartCard);
    const dijkstraTime = estimateTravelTime(dijkstraResult.path, dijkstraResult.interchanges, hour, dijkstraResult.lines);
    const bfsTime = estimateTravelTime(bfsResult.path, bfsResult.interchanges, hour, bfsResult.lines);

    const crowdComparison = findLeastCrowdedRoute(dijkstraResult, bfsResult, hour, day);

    res.json({
      from, to, hour, dayOfWeek: day,
      dijkstra: {
        ...dijkstraResult,
        fare: dijkstraFare,
        time: dijkstraTime,
        formattedTime: formatTime(dijkstraTime.totalMinutes),
        crowd: crowdComparison.dijkstraCrowd
      },
      bfs: {
        ...bfsResult,
        fare: bfsFare,
        time: bfsTime,
        formattedTime: formatTime(bfsTime.totalMinutes),
        crowd: crowdComparison.bfsCrowd
      },
      recommendation: {
        algorithm: crowdComparison.recommended,
        reason: crowdComparison.reason
      }
    });
  });

  // GET /api/crowd?line=Yellow&hour=10
  router.get('/crowd', (req, res) => {
    const { line } = req.query;
    const hour = parseInt(req.query.hour) || new Date().getHours();
    const dayOfWeek = parseInt(req.query.day) || new Date().getDay();

    if (!line) return res.status(400).json({ error: 'Please provide "line" query param' });

    const { getCrowdLevel } = require('../utils/crowdModel');
    res.json(getCrowdLevel(line, hour, dayOfWeek));
  });

  // GET /api/fare-slabs
  router.get('/fare-slabs', (req, res) => {
    res.json({ slabs: getFareSlabs() });
  });

  return router;
}

module.exports = createRouter;
