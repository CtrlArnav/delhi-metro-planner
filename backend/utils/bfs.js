/**
 * BFS (Breadth-First Search) for Delhi Metro
 * 
 * Finds the route with MINIMUM STATIONS (fewest hops),
 * completely ignoring interchange cost.
 * 
 * Why BFS works here:
 * - Every travel edge represents exactly 1 station hop
 * - BFS guarantees the minimum number of hops
 * - Interchange edges have 0 hops (they're free in this model)
 * 
 * This serves as a baseline comparison against Dijkstra.
 */

/**
 * Find the route with minimum stations using BFS
 * 
 * @param {Map} adjacencyList - The graph's adjacency list
 * @param {string} source - Source station name
 * @param {string} destination - Destination station name
 * @param {Map} stations - Raw station data Map
 * @returns {Object} Route details
 */
function findMinStationsRoute(adjacencyList, source, destination, stations) {
  const sourceData = stations.get(source);
  const destData = stations.get(destination);

  if (!sourceData || !destData) {
    return { error: 'Invalid station name', path: [] };
  }

  const sourceNodes = Object.keys(sourceData.lines).map(l => `${source}|${l}`);
  const destNodes = new Set(Object.keys(destData.lines).map(l => `${destination}|${l}`));

  // BFS uses a simple queue
  const queue = [];
  const visited = new Set();
  const parent = new Map();

  // Initialize
  for (const node of sourceNodes) {
    queue.push(node);
    visited.add(node);
    parent.set(node, null);
  }

  while (queue.length > 0) {
    const current = queue.shift();

    // Check if we reached destination
    if (destNodes.has(current)) {
      return reconstructBFSPath(parent, current, source, destination);
    }

    // Explore neighbors
    const neighbors = adjacencyList.get(current) || [];
    for (const { node: neighbor, type } of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parent.set(neighbor, current);
        
        // For BFS, we prioritize travel edges over interchange edges
        // to find actual station paths
        if (type === 'travel') {
          queue.push(neighbor);
        } else {
          // Interchange edges: add to front of queue (process first)
          queue.unshift(neighbor);
        }
      }
    }
  }

  return { error: 'No route found', path: [] };
}

/**
 * Reconstruct path from BFS parent pointers
 */
function reconstructBFSPath(parent, endNode, source, destination) {
  const rawPath = [];
  let current = endNode;

  while (current !== null) {
    rawPath.unshift(current);
    current = parent.get(current);
  }

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

module.exports = { findMinStationsRoute };
