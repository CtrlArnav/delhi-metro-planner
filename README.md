# 🚇 Delhi Metro Route Planner

A full-stack web application that finds the **shortest**, **least crowded**, and **most optimal** route between any two Delhi Metro stations using graph algorithms.

![Tech Stack](https://img.shields.io/badge/Stack-MERN-green)
![Algorithms](https://img.shields.io/badge/Algorithms-Dijkstra%20%7C%20BFS-blue)
![Dataset](https://img.shields.io/badge/Dataset-DMRC%20Delhi%20Metro-orange)

## ✨ Features

- **🔍 Smart Station Search** — Autocomplete with interchange indicators
- **📊 Algorithm Comparison** — Dijkstra vs BFS side-by-side
- **💰 Fare Calculator** — Real DMRC fare slabs (₹10–₹60)
- **⏱️ Time Estimation** — Travel time breakdown (travel + dwell + interchange + wait)
- **👥 Crowd Estimation** — Time-of-day based crowd levels per line
- **🔄 Interchange Awareness** — Penalizes line switches (passengers prefer direct routes)
- **🗺️ Visual Route Display** — Station-by-station path with line colors

## 🧠 Algorithms Explained

### Dijkstra's Algorithm (Modified)
- **Goal:** Minimize interchanges first, then minimize stations
- **Cost:** `(interchanges, stations)` — compared lexicographically
- **Why:** Real passengers prefer staying on the same line even if it means more stops
- **Data Structure:** Min-heap priority queue

### BFS (Breadth-First Search)
- **Goal:** Minimize total stations (fewest hops)
- **Why:** Guarantees shortest path in unweighted graph
- **Trade-off:** May require more interchanges

### State Expansion (Key Technique)
Instead of representing nodes as just stations:
```
Node = "Rajiv Chowk"
```
We use **station-line states**:
```
Node = "Rajiv Chowk|Yellow"
Node = "Rajiv Chowk|Blue"
```
This lets the graph properly track which line you're on and penalize interchanges.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, CSS3 (custom dark theme) |
| Backend | Node.js, Express.js |
| Database | MongoDB (optional, for search history) |
| Algorithms | Dijkstra, BFS (implemented from scratch in JS) |
| Dataset | [DMRC JSON Dataset](https://github.com/AkshatJMe/DMRC-Dataset-Algorithm) |

## 📁 Project Structure

```
delhi-metro-planner/
├── backend/
│   ├── server.js              # Express server entry point
│   ├── data/
│   │   └── dmrc.json          # Delhi Metro network data (280+ stations)
│   ├── models/
│   │   └── Station.js         # MongoDB station schema
│   ├── routes/
│   │   └── api.js             # All API endpoints
│   ├── utils/
│   │   ├── graphBuilder.js    # Builds adjacency list from JSON
│   │   ├── dijkstra.js        # Modified Dijkstra (min interchanges)
│   │   ├── bfs.js             # BFS (min stations)
│   │   ├── fareCalculator.js  # DMRC fare slab calculator
│   │   ├── timeEstimator.js   # Travel time estimation
│   │   └── crowdModel.js      # Crowd level prediction
│   ├── .env                   # Environment variables
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js             # Main app component
│   │   ├── App.css            # Styles (dark theme)
│   │   ├── index.js           # React entry point
│   │   ├── components/
│   │   │   ├── StationSelector.js     # Autocomplete search
│   │   │   ├── RouteResult.js         # Detailed route display
│   │   │   ├── AlgorithmComparison.js # Side-by-side comparison
│   │   │   └── FareCard.js           # Fare & time breakdown
│   │   └── utils/
│   │       └── api.js                # API communication
│   └── package.json
└── README.md
```

## 🚀 Local Setup Guide

### Prerequisites

Make sure you have these installed on your machine:

| Software | Version | Check Command |
|----------|---------|--------------|
| **Node.js** | 16+ | `node --version` |
| **npm** | 8+ | `npm --version` |
| **MongoDB** | 6+ (Optional) | `mongod --version` |
| **Git** | 2+ | `git --version` |

> **Note:** MongoDB is **optional**. The app works fully with in-memory data. MongoDB is only used for search history.

### Step-by-Step Setup

#### 1. Clone / Download the Project
```bash
cd delhi-metro-planner
```

#### 2. Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Start the backend server
npm run dev    # with nodemon (auto-restart on changes)
# OR
npm start      # normal start
```

You should see:
```
✅ Graph built: 850+ nodes, 280+ stations
✅ MongoDB connected (or ⚠️ MongoDB not available - works fine without it)

🚇 Delhi Metro Route Planner API
   Server running on http://localhost:5000
   API base: http://localhost:5000/api
```

#### 3. Setup Frontend (in a NEW terminal)
```bash
cd frontend

# Install dependencies (uses Vite — fast and lightweight)
npm install

# Start dev server
npm run dev
```

The app will open at **http://localhost:3000**

#### 4. Test the API
Open in browser to verify backend is working:
```
http://localhost:5000/api/health
http://localhost:5000/api/stations
http://localhost:5000/api/route/compare?from=Rajiv Chowk&to=Hauz Khas
```

### Optional: Setup MongoDB

If you want search history to work:

**Windows:**
1. Download from https://www.mongodb.com/try/download/community
2. Install and start MongoDB service

**Mac (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt install mongodb
sudo systemctl start mongodb
```

The `.env` file already has the connection string:
```
MONGODB_URI=mongodb://localhost:27017/delhi-metro
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| GET | `/api/stations` | List all 280+ stations |
| GET | `/api/stations/search?q=rajiv` | Search stations |
| GET | `/api/lines` | List all metro lines with colors |
| GET | `/api/route?from=X&to=Y` | Dijkstra route (min interchanges) |
| GET | `/api/route/shortest?from=X&to=Y` | BFS route (min stations) |
| GET | `/api/route/compare?from=X&to=Y&hour=10` | Compare both algorithms |
| GET | `/api/crowd?line=Yellow&hour=10` | Crowd level for a line |
| GET | `/api/fare-slabs` | DMRC fare slab info |
| POST | `/api/history` | Save search (requires MongoDB) |
| GET | `/api/history` | Get recent searches (requires MongoDB) |

## 🎯 What This Project Demonstrates (For Interviews)

1. **Data Structures & Algorithms** — Graph modeling, Dijkstra, BFS, Priority Queue
2. **System Design** — State expansion, separation of data and logic
3. **Full-Stack Development** — MERN stack, REST APIs, component-based UI
4. **Real-World Problem Solving** — Multi-criteria optimization (interchanges + stations + crowd)
5. **Clean Code** — Modular utilities, well-commented algorithms
6. **Data Modeling** — Graph representation, JSON data structures

## 📝 License

This project uses the [DMRC Dataset by Akshat Jain](https://github.com/AkshatJMe/DMRC-Dataset-Algorithm) for metro network data.
