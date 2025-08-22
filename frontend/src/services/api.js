// src/services/api.js
const BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5000";

// Helper function to safely fetch API data with fallback
async function safeGet(path) {
  try {
    const res = await fetch(`${BASE}${path}`);
    if (!res.ok) throw new Error("Network error");
    return await res.json();
  } catch (e) {
    console.warn("API fallback for", path, e.message);
    return null;
  }
}

export async function getMetrics() {
  const data = await safeGet("/api/metrics");
  if (data) return data;

  // fallback mock data if API fails
  return {
    total_requests: 1200,
    cache_hits: 900,
    cache_misses: 300,
    rpsSeries: Array.from({ length: 12 }).map((_, i) => ({
      t: `${i}`,
      v: Math.floor(5 + Math.random() * 20),
    })),
    timeseries: Array.from({ length: 12 }).map((_, i) => ({
      t: `${i}:00`,
      rtt: (0.05 + Math.random() * 0.5).toFixed(3),
    })),
    cpu: 34,
    ram: 62,
    heatmap: Array.from({ length: 7 }).map(() =>
      Array.from({ length: 24 }).map(() => Math.floor(Math.random() * 5))
    ),
  };
}

export async function getLogs(limit = 50) {
  const data = await safeGet(`/api/logs?limit=${limit}`);
  if (data) return data;
  return []; // fallback empty list
}

export async function getBlacklist() {
  const data = await safeGet("/api/blacklist");
  if (data) return data;
  return ["facebook.com", "example.org"]; // fallback blacklist
}

export async function addBlacklist(domain) {
  try {
    const res = await fetch(`${BASE}/api/blacklist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host: domain }),
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export async function removeBlacklist(domain) {
  try {
    const res = await fetch(`${BASE}/api/blacklist`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host: domain }),
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export async function clearCache() {
  try {
    const res = await fetch(`${BASE}/api/cache/clear`, { method: "POST" });
    return res.ok;
  } catch (e) {
    return false;
  }
}
