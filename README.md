# Distributed Cache System — Cloud Computing Project

A Node.js + Redis + MongoDB web application demonstrating distributed caching for performance optimization.

---

## Architecture

```
Browser (Frontend)
       │
       ▼
  Express Backend (Node.js)
       │
       ├──► Redis Cache (check first)
       │         │
       │     [HIT] ──► return cached data instantly
       │     [MISS]
       │         │
       └──► MongoDB (query DB, then store in Redis)
```

---

## Local Development

### Prerequisites
- Node.js 18+
- Redis (local or Docker)
- MongoDB (local or Atlas)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd project/backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your MongoDB and Redis URLs
```

### 3. Start services (Docker way — easiest)

```bash
# From project root
docker-compose up -d
```

This starts MongoDB, Redis, and the backend all at once.

### 4. Serve the frontend

Open `frontend/index.html` directly in your browser, or use a simple server:

```bash
cd frontend
npx serve .
# Visit http://localhost:3000
```

---

## Deployment on Render (Free Tier)

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

### Step 2 — Create a MongoDB Atlas database

1. Go to https://mongodb.com/atlas → Create free cluster
2. Create a database user (username + password)
3. Allow network access from anywhere (0.0.0.0/0)
4. Copy your connection string: `mongodb+srv://user:password@cluster.mongodb.net/cachedb`

### Step 3 — Create a Redis instance (Upstash — free)

1. Go to https://upstash.com → Create free Redis database
2. Copy the **Redis URL** (starts with `rediss://`)

### Step 4 — Deploy backend on Render

1. Go to https://render.com → New → Web Service
2. Connect your GitHub repo
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add Environment Variables:
   - `MONGO_URI` → your Atlas connection string
   - `REDIS_URL` → your Upstash Redis URL
   - `PORT` → `5000`
5. Click **Deploy**
6. Copy your Render URL: `https://your-app.onrender.com`

### Step 5 — Deploy frontend on Render (Static Site)

1. New → Static Site
2. Connect same GitHub repo
3. Settings:
   - **Root Directory**: `frontend`
   - **Publish Directory**: `.`
4. In `frontend/index.html`, update the `API` variable at line ~163:
   ```js
   const API = 'https://your-backend.onrender.com';
   ```
5. Deploy → get your frontend URL

---

## API Endpoints

| Method | Endpoint | Description | Cached? |
|--------|----------|-------------|---------|
| GET | `/api/products` | All products | ✅ Yes |
| GET | `/api/products/:id` | Single product | ✅ Yes |
| GET | `/api/products/category/:cat` | By category | ✅ Yes |
| POST | `/api/products` | Create product | ❌ Invalidates cache |
| DELETE | `/api/products/:id` | Delete product | ❌ Invalidates cache |
| GET | `/api/cache/stats` | Cache statistics | — |
| DELETE | `/api/cache/flush` | Clear all cache | — |
| POST | `/api/seed` | Seed test data | — |
| GET | `/health` | Health check | — |

---

## Cache Strategy

- **Cache-Aside (Lazy Loading)**: Backend checks Redis first; on miss, fetches from MongoDB and stores in Redis
- **TTL**: 60 seconds per key (configurable via `CACHE_TTL` in server.js)
- **Invalidation**: Write operations (POST/DELETE) flush related cache keys automatically

---

## Performance Testing

To measure before/after:

```bash
# Without cache (first request — cache miss)
curl -w "@curl-format.txt" http://localhost:5000/api/products

# With cache (second request — cache hit)
curl -w "@curl-format.txt" http://localhost:5000/api/products
```

Or use the dashboard's built-in timing display.
