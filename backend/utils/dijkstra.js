/**
 * Modified Dijkstra's Algorithm for Delhi Metro
 * 
 * Optimization goal (lexicographic):
 *   1. Minimize interchanges (primary)
 *   2. Minimize stations travelled (secondary)
 * 
 * This means: (0 interchanges, 15 stations) is BETTER than (1 interchange, 5 stations)
 * Because real passengers hate switching lines!
 * 
 * Each node's cost is tracked as: [interchanges, stationsTravelled]
 */

class PriorityQueue {
  constructor() {
    this.heap = [];
  }

  push(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    const min = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return min;
  }

  get size() {
    return this.heap.length;
  }

  // Compare costs lexicographically: [interchanges, stations]
  _isLess(a, b) {
    if (a.cost[0] !== b.cost[0]) return a.cost[0] < b.cost[0];
    return a.cost[1] < b.cost[1];
  }

  _bubbleUp(idx) {
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      if (this._isLess(this.heap[idx], this.heap[parent])) {
        [this.heap[idx], this.heap[parent]] = [this.heap[parent], this.heap[idx]];
        idx = parent;
      } else break;
    }
  }

  _sinkDown(idx) {
    const length = this.heap.length;
    while (true) {
      let smallest = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;

      if (left < length && this._isLess(this.heap[left], this.heap[smallest])) {
        smallest = left;
      }
      if (right < length && this._isLess(this.heap[right], this.heap[smallest])) {
        smallest = right;
      }
      if (smallest !== idx) {
        [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
        idx = smallest;
      } else break;
    }
  }
}

/**
 * Find the route with minimum interchanges (and minimum stations as tiebreaker)
 * 
 * @param {Map} adjacencyList - The graph's adjacency list
 * @param {string} source - Source station name
 * @param {string} destination - Destination station name
 * @param {Map} stations - Raw station data Map
 * @returns {Object} Route details
 */
function findMinInterchangeRoute(adjacencyList, source, destination, stations) {
  const sourceData = stations.get(source);
  const destData = stations.get(destination);

  if (!sourceData || !destData) {
    return { error: 'Invalid station name', path: [] };
  }

  // Get all possible start and end nodes (one per line the station is on)
  const sourceNodes = Object.keys(sourceData.lines).map(l => `${source}|${l}`);
  const destNodes = new Set(Object.keys(destData.lines).map(l => `${destination}|${l}`));

  // Distance map: node -> [interchanges, stations]
  const dist = new Map();
  const parent = new Map();
  const pq = new PriorityQueue();

  // Initialize all source nodes
  for (const node of sourceNodes) {
    dist.set(node, [0, 0]);
    parent.set(node, null);
    pq.push({ node, cost: [0, 0] });
  }

  while (pq.size > 0) {
    const { node: current, cost: currentCost } = pq.pop();

    // Check if we reached any destination node
    if (destNodes.has(current)) {
      return reconstructPath(parent, current, source, destination);
    }

    // Skip if we already found a better path to this node
    const recorded = dist.get(current);
    if (recorded && (recorded[0] < currentCost[0] || 
        (recorded[0] === currentCost[0] && recorded[1] < currentCost[1]))) {
      continue;
    }

    // Explore neighbors
    const neighbors = adjacencyList.get(current) || [];
    for (const { node: neighbor, type } of neighbors) {
      let newCost;

      if (type === 'interchange') {
        // Switching lines: +1 interchange, +0 stations
        newCost = [currentCost[0] + 1, currentCost[1]];
      } else {
        // Travelling to next station: +0 interchanges, +1 station
        newCost = [currentCost[0], currentCost[1] + 1];
      }

      const existing = dist.get(neighbor);
      const isBetter = !existing ||
        newCost[0] < existing[0] ||
        (newCost[0] === existing[0] && newCost[1] < existing[1]);

      if (isBetter) {
        dist.set(neighbor, newCost);
        parent.set(neighbor, current);
        pq.push({ node: neighbor, cost: newCost });
      }
    }
  }

  return { error: 'No route found', path: [] };
}

/**
 * Reconstruct the path from parent pointers
 */
function reconstructPath(parent, endNode, source, destination) {
  const rawPath = [];
  let current = endNode;

  while (current !== null) {
    rawPath.unshift(current);
    current = parent.get(current);
  }

  // Convert "Station|Line" format into structured path
  const path = [];
  let interchanges = 0;
  let currentLine = null;

  for (const node of rawPath) {
    const [stationName, lineName] = node.split('|');

    if (currentLine && lineName !== currentLine) {
      interchanges++;
      path.push({
        station: stationName,
        line: lineName,
        fromLine: currentLine,
        isInterchange: true
      });
    } else {
      path.push({
        station: stationName,
        line: lineName,
        isInterchange: false
      });
    }
    currentLine = lineName;
  }

  return {
    path,
    interchanges,
    stations: path.length,
    lines: [...new Set(path.map(p => p.line))]
  };
}

module.exports = { findMinInterchangeRoute };
