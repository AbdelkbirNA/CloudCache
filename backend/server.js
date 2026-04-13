const express = require("express");
const mongoose = require("mongoose");
const redis = require("redis");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ─── Redis Client ──────────────────────────────────────────────────────────────
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("Redis error:", err));
redisClient.connect().then(() => console.log("✅ Redis connected"));

// ─── MongoDB ───────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/cachedb");
mongoose.connection.on("connected", () => console.log("✅ MongoDB connected"));

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  stock: Number,
});
const Product = mongoose.model("Product", ProductSchema);

// ─── Cache Middleware ──────────────────────────────────────────────────────────
const CACHE_TTL = 60; // seconds

async function cacheMiddleware(req, res, next) {
  const key = `cache:${req.originalUrl}`;
  try {
    const cached = await redisClient.get(key);
    if (cached) {
      console.log(`[CACHE HIT] ${key}`);
      return res.json({ source: "cache", data: JSON.parse(cached) });
    }
    console.log(`[CACHE MISS] ${key}`);
    // Attach setter to res so route can store result
    res.setCache = async (data) => {
      await redisClient.setEx(key, CACHE_TTL, JSON.stringify(data));
    };
    next();
  } catch (err) {
    console.error("Cache middleware error:", err);
    next();
  }
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET all products (with cache)
app.get("/api/products", cacheMiddleware, async (req, res) => {
  const products = await Product.find();
  if (res.setCache) await res.setCache(products);
  res.json({ source: "database", data: products });
});

// GET product by category (with cache)
app.get("/api/products/category/:cat", cacheMiddleware, async (req, res) => {
  const products = await Product.find({ category: req.params.cat });
  if (res.setCache) await res.setCache(products);
  res.json({ source: "database", data: products });
});

// GET single product by ID (with cache)
app.get("/api/products/:id", cacheMiddleware, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: "Not found" });
  if (res.setCache) await res.setCache(product);
  res.json({ source: "database", data: product });
});

// POST create product (invalidates cache)
app.post("/api/products", async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  // Invalidate all product-related cache keys
  const keys = await redisClient.keys("cache:/api/products*");
  if (keys.length) await redisClient.del(keys);
  res.status(201).json({ message: "Product created", data: product });
});

// DELETE product (invalidates cache)
app.delete("/api/products/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  const keys = await redisClient.keys("cache:/api/products*");
  if (keys.length) await redisClient.del(keys);
  res.json({ message: "Product deleted" });
});

// ─── Cache Stats ───────────────────────────────────────────────────────────────
app.get("/api/cache/stats", async (req, res) => {
  const info = await redisClient.info("stats");
  const keys = await redisClient.keys("cache:*");
  const lines = info.split("\r\n");
  const hits = lines.find((l) => l.startsWith("keyspace_hits"))?.split(":")[1] || 0;
  const misses = lines.find((l) => l.startsWith("keyspace_misses"))?.split(":")[1] || 0;
  res.json({
    activeKeys: keys.length,
    hits: parseInt(hits),
    misses: parseInt(misses),
    hitRate: hits + misses > 0 ? ((hits / (hits + misses)) * 100).toFixed(1) + "%" : "N/A",
  });
});

// DELETE flush all cache
app.delete("/api/cache/flush", async (req, res) => {
  await redisClient.flushDb();
  res.json({ message: "Cache flushed" });
});

// ─── Seed Data ─────────────────────────────────────────────────────────────────
app.post("/api/seed", async (req, res) => {
  await Product.deleteMany({});
  await Product.insertMany([
    { name: "Laptop Pro", price: 1299, category: "electronics", stock: 45 },
    { name: "Wireless Mouse", price: 29, category: "electronics", stock: 200 },
    { name: "Office Chair", price: 349, category: "furniture", stock: 30 },
    { name: "Standing Desk", price: 599, category: "furniture", stock: 15 },
    { name: "Coffee Maker", price: 89, category: "kitchen", stock: 80 },
    { name: "Notebook Set", price: 19, category: "stationery", stock: 500 },
  ]);
  res.json({ message: "Database seeded with 6 products" });
});

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
