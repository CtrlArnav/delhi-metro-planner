/**
 * Graph Builder for Delhi Metro
 * 
 * Converts the dmrc.json data into an adjacency list graph.
 * 
 * KEY CONCEPT: State Expansion
 * Instead of just "Rajiv Chowk", we represent nodes as:
 *   "Rajiv Chowk|Yellow" and "Rajiv Chowk|Blue"
 * 
 * This lets us track which LINE a passenger is on,
 * and properly penalize interchanges.
 */

const fs = require('fs');
const path = require('path');

class MetroGraph {
  constructor() {
    // adjacency list: Map<string, Array<{node: string, weight: number, type: string}>>
    this.adjacencyList = new Map();
    this.stations = new Map(); // raw station data
    this.stationList = [];     // list of all station names
    this.lineColors = {};      // line name -> color mapping
  }

  /**
   * Load data from dmrc.json and build the graph
   */
  buildFromJSON() {
    const dataPath = path.join(__dirname, '..', 'data', 'dmrc.json');
    const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    this.stations = new Map(Object.entries(rawData));
    this.stationList = Object.keys(rawData);

    // Define line colors for the UI
    this.lineColors = {
      'Red': '#EF4444',
      'Yellow': '#EAB308',
      'Blue': '#3B82F6',
      'Green': '#22C55E',
      'Pink': '#EC4899',
      'Violet': '#8B5CF6',
      'Magenta': '#D946EF',
      'Orange': '#F97316',
      'Grey': '#6B7280',
      'Rapid': '#06B6D4',
      'Airport Express': '#F59E0B',
      'Aqua': '#0EA5E9'
    };

    // Build adjacency list using state expansion
    for (const [stationName, stationData] of this.stations) {
      const lines = stationData.lines;

      for (const [lineName, connections] of Object.entries(lines)) {
        const currentNode = `${stationName}|${lineName}`;

        // Initialize this node in adjacency list if not exists
        if (!this.adjacencyList.has(currentNode)) {
          this.adjacencyList.set(currentNode, []);
        }

        // Add edge to previous station on same line
        if (connections.prev) {
          const prevNode = `${connections.prev}|${lineName}`;
          this.addEdge(currentNode, prevNode, 1, 'travel');
        }

        // Add edge to next station on same line
        if (connections.next) {
          const nextNode = `${connections.next}|${lineName}`;
          this.addEdge(currentNode, nextNode, 1, 'travel');
        }
      }

      // Add interchange edges (same station, different lines)
      const lineNames = Object.keys(lines);
      if (lineNames.length > 1) {
        for (let i = 0; i < lineNames.length; i++) {
          for (let j = i + 1; j < lineNames.length; j++) {
            const nodeA = `${stationName}|${lineNames[i]}`;
            const nodeB = `${stationName}|${lineNames[j]}`;
            // Interchange has weight 0 for stations but we track it separately
            this.addEdge(nodeA, nodeB, 0, 'interchange');
            this.addEdge(nodeB, nodeA, 0, 'interchange');
          }
        }
      }
    }

    console.log(`✅ Graph built: ${this.adjacencyList.size} nodes, ${this.stationList.length} stations`);
    return this;
  }

  /**
   * Add a bidirectional edge to the adjacency list
   */
  addEdge(from, to, weight, type) {
    if (!this.adjacencyList.has(from)) {
      this.adjacencyList.set(from, []);
    }
    this.adjacencyList.get(from).push({ node: to, weight, type });
  }

  /**
   * Get all stations as a simple list
   */
  getStationList() {
    return this.stationList.map(name => {
      const data = this.stations.get(name);
      return {
        name,
        lines: Object.keys(data.lines),
        isInterchange: data.interchange.length > 1
      };
    });
  }

  /**
   * Get line color for a given line name
   */
  getLineColor(lineName) {
    return this.lineColors[lineName] || '#888888';
  }

  /**
   * Get all lines in the network
   */
  getLines() {
    const lines = new Set();
    for (const [, stationData] of this.stations) {
      Object.keys(stationData.lines).forEach(l => lines.add(l));
    }
    return Array.from(lines).map(name => ({
      name,
      color: this.getLineColor(name)
    }));
  }
}

module.exports = MetroGraph;
