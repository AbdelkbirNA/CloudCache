# ⚡ CacheMaster Pro — Distributed Cache System

A high-performance **Cloud Computing** demonstration project using **Node.js (Express)**, **Redis**, and **MongoDB**. This system visualizes the massive performance gain provided by in-memory caching in distributed architectures.

---

## 🌐 Live Demo

| Service | URL | Status |
|---------|-----|--------|
| 🖥️ Frontend Dashboard | [https://cloudcache-frontend.onrender.com](https://cloudcache-frontend.onrender.com) | ![Live](https://img.shields.io/badge/status-live-brightgreen) |
| ⚙️ Backend API | [https://cloudcache-backend.onrender.com](https://cloudcache-backend.onrender.com) | ![Live](https://img.shields.io/badge/status-live-brightgreen) |
| 🩺 Health Check | [https://cloudcache-backend.onrender.com/health](https://cloudcache-backend.onrender.com/health) | ![Live](https://img.shields.io/badge/status-live-brightgreen) |
| 📊 Cache Stats | [https://cloudcache-backend.onrender.com/api/cache/stats](https://cloudcache-backend.onrender.com/api/cache/stats) | ![Live](https://img.shields.io/badge/status-live-brightgreen) |

> ⚠️ **Note:** Hosted on Render free tier — the backend may take ~30 seconds to wake up after inactivity. Visit the health check link first to wake it up before the demo.

---

## ☁️ Cloud Infrastructure

| Layer | Service | Plan | Region |
|-------|---------|------|--------|
| 🖥️ Frontend | Render Static/Web Service | Free | AWS eu-central (Frankfurt) |
| ⚙️ Backend | Render Web Service (Node.js) | Free | AWS eu-central (Frankfurt) |
| 🗄️ Database | MongoDB Atlas | M0 Free Tier | AWS eu-west-3 (Paris) |
| ⚡ Cache | Upstash Redis | Serverless Free | AWS eu-central-1 (Frankfurt) |

---

## 🚀 Modern Development Workflow (Hot-Reload)

This project is optimized for an elite developer experience. You can modify code in real-time without ever restarting your containers.

- **Backend (Node.js)**: Uses `nodemon` to watch and restart the server automatically on file changes.
- **Frontend (HTML/JS)**: Uses `live-server` to trigger automatic browser refreshes when you save your HTML, CSS, or JS files.
- **Docker Sync**: Bind mounts ensure your local changes are instantly reflected inside the containers, while anonymous volumes protect `node_modules` from host/container conflicts.

---

## 🛠️ Instant Local Setup

Ensure you have **Docker** and **Docker Compose** installed.

```bash
# 1. Clone the repository
git clone https://github.com/AbdelkbirNA/CloudCache.git
cd CloudCache

# 2. Launch the entire infrastructure
docker-compose up --build
```

- **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **MongoDB**: `localhost:27017`
- **Redis**: `localhost:6379`

---

## 📊 Performance Intelligence Dashboard

The redesigned **Enhanced Classical** dashboard provides deep technical insights into the system's performance:

1. **Latency Analyzer**: Real-time Chart.js visualization of request times over time.
2. **Time to Data**: Precise digital readout (ms) for every request.
3. **Source Efficiency**: Live calculation of the **Speed Multiplier** (e.g., how many times faster Redis was than the last Database query).
4. **Data Pedigree**: Visual tags identifying the origin of every data object (`REDIS` vs `MONGODB`).

---

## 🏗️ Architecture & Strategy

```mermaid
graph TD
    A[Browser Dashboard] -->|API Request| B[Express Backend]
    B --> C{Redis Cache Check}
    C -->|HIT: < 1ms| D[Return Cached Data]
    C -->|MISS: > 50ms| E[Query MongoDB]
    E --> F[Store Result in Redis]
    F --> G[Return Origin Data]
```

### Key Strategies
- **Cache-Aside (Lazy Loading)**: Minimizes database load by keeping frequent data in RAM.
- **Auto-Invalidation**: All write operations (`POST`, `DELETE`) automatically purge related cache keys to ensure data consistency.
- **Time-To-Live (TTL)**: 60-second default expiration for all cache keys.

---

## 🌐 API Reference

| Method | Endpoint | Description | Cache Role |
|--------|----------|-------------|------------|
| GET | `/api/products` | All products | **READ** |
| GET | `/api/products/search?q=` | Key search | **READ** |
| POST | `/api/products` | Create entry | **FLUSH ALL** |
| DELETE | `/api/products/:id` | Purge entry | **FLUSH ALL** |
| GET | `/api/cache/stats` | Redis metrics | **MONITOR** |
| DELETE | `/api/cache/flush` | Manual wipe | **RESET** |

---

## 🚀 Deploy Your Own Instance

1. **MongoDB Atlas** → Create free M0 cluster → copy connection string
2. **Upstash** → Create free Redis DB → copy Redis URL
3. **Render (Backend)** → New Web Service → Root: `backend` → Start: `node server.js` → add env vars:
   ```
   MONGO_URI=mongodb+srv://...
   REDIS_URL=rediss://...
   PORT=10000
   ```
4. **Render (Frontend)** → New Web Service → Root: `frontend` → Runtime: Docker → Port: `8080`
5. Update `const API` in `frontend/index.html` with your backend URL

---

*Created for Cloud Computing Case Studies — Performance Optimization via Distributed Memory.*