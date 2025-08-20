import psutil
import time
import os
import json
from datetime import datetime
from pathlib import Path

# Proxy log file path - update if needed
PROXY_LOG_FILE = Path(__file__).resolve().parent.parent / "proxy_server" / "logs" / "proxy.log"

CACHE_DIR = Path(__file__).resolve().parent.parent / "proxy_server" / "cache"

def parse_timestamp(ts):
    if isinstance(ts, str):
        try:
            return datetime.strptime(ts, "%Y-%m-%d %H:%M:%S")
        except Exception:
            return None
    elif isinstance(ts, (int, float)):
        return datetime.fromtimestamp(ts)
    return None

def get_system_metrics():
    return {
        "cpu": psutil.cpu_percent(interval=0.5),
        "ram": psutil.virtual_memory().percent
    }

def get_cache_metrics():
    now_ts = time.time()
    rps_series_length = 60
    heatmap = [[0]*24 for _ in range(7)]

    logs = []
    if PROXY_LOG_FILE.exists():
        with PROXY_LOG_FILE.open("r") as f:
            for line in f:
                try:
                    logs.append(json.loads(line))
                except json.JSONDecodeError:
                    continue

    # Filter recent logs for RPS calculation
    recent_logs = []
    for l in logs:
        ts_obj = parse_timestamp(l.get("timestamp", ""))
        if ts_obj is None:
            continue
        ts_epoch = ts_obj.timestamp()
        if time.time() - ts_epoch <= rps_series_length:
            l["_epoch_ts"] = ts_epoch
            recent_logs.append(l)

    counts_per_sec = {}
    for l in recent_logs:
        ts = int(l["_epoch_ts"])
        counts_per_sec[ts] = counts_per_sec.get(ts, 0) + 1

    rps_series = []
    start_sec = int(time.time() - rps_series_length) + 1
    end_sec = int(time.time()) + 1
    for sec in range(start_sec, end_sec):
        count = counts_per_sec.get(sec, 0)
        rps_series.append({"t": datetime.fromtimestamp(sec).strftime("%H:%M:%S"), "v": count})

    # Build heatmap
    for l in logs:
        ts_obj = parse_timestamp(l.get("timestamp", ""))
        if ts_obj is None:
            continue
        weekday = ts_obj.weekday()
        hour = ts_obj.hour
        heatmap[weekday][hour] += 1

    cache_hits = len(list(CACHE_DIR.iterdir())) if CACHE_DIR.exists() else 0

    return {
        "total_requests": len(logs),
        "cache_hits": cache_hits,
        "cache_misses": 0,
        "rpsSeries": rps_series,
        "heatmap": heatmap
    }

# Optional helper to get recent logs (called from app.py if extracted)
def get_recent_logs(limit=50):
    logs = []
    if PROXY_LOG_FILE.exists():
        with PROXY_LOG_FILE.open("r") as f:
            for line in reversed(f.readlines()):
                try:
                    logs.append(json.loads(line))
                    if len(logs) >= limit:
                        break
                except json.JSONDecodeError:
                    continue
    return logs
