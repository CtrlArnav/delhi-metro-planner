/**
 * API utility - handles all backend communication
 */

const API_BASE = '/api';

export async function fetchStations() {
  const res = await fetch(`${API_BASE}/stations`);
  const data = await res.json();
  return data.stations;
}

export async function searchStations(query) {
  const res = await fetch(`${API_BASE}/stations/search?q=${encodeURIComponent(query)}`);
  const data = await res.json();
  return data.stations;
}

export async function compareRoutes(from, to, hour, day, hasSmartCard) {
  const params = new URLSearchParams({ from, to });
  if (hour !== undefined) params.set('hour', hour);
  if (day !== undefined) params.set('day', day);
  if (hasSmartCard) params.set('smartcard', 'true');
  const res = await fetch(`${API_BASE}/route/compare?${params}`);
  return res.json();
}

export async function fetchLines() {
  const res = await fetch(`${API_BASE}/lines`);
  const data = await res.json();
  return data.lines;
}

export async function fetchFareSlabs() {
  const res = await fetch(`${API_BASE}/fare-slabs`);
  const data = await res.json();
  return data.slabs;
}
