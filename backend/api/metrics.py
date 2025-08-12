import psutil
import time
import os
import json

LOG_FILE = "logs.json"
CACHE_DIR = "cache"

def get_system_metrics():
    return {
        "cpu": psutil.cpu_percent(interval=0.5),
        "ram": psutil.virtual_memory().percent
    }

def get_cache_metrics():
    rps = 0
    now = time.time()
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE) as f:
            logs = json.load(f)
        last_sec = [l for l in logs if now - l["timestamp"] <= 1]
        rps = len(last_sec)

    cache_hits = 0
    cache_misses = 0
    if os.path.exists(CACHE_DIR):
        cache_hits = len(os.listdir(CACHE_DIR))

    return {
        "total_requests": len(logs) if os.path.exists(LOG_FILE) else 0,
        "cache_hits": cache_hits,
        "cache_misses": cache_misses,
        "rpsSeries": [],  # optional: build time series
        "timeseries": [],
        "heatmap": []
    }
