from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from metrics import get_system_metrics, get_cache_metrics


app = Flask(__name__)
CORS(app)

LOG_FILE = "logs.json"
BLACKLIST_FILE = "blacklist.json"

@app.route("/api/logs")
def get_logs():
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE) as f:
            logs = json.load(f)
    else:
        logs = []
    return jsonify(logs[-50:])  # last 50 entries

@app.route("/api/metrics")
def get_metrics():
    metrics = get_system_metrics()
    metrics.update(get_cache_metrics())
    return jsonify(metrics)

@app.route("/api/blacklist", methods=["GET", "POST", "DELETE"])
def manage_blacklist():
    if os.path.exists(BLACKLIST_FILE):
        with open(BLACKLIST_FILE) as f:
            blacklist = json.load(f)
    else:
        blacklist = []

    if request.method == "POST":
        domain = request.json.get("host")
        if domain and domain not in blacklist:
            blacklist.append(domain)
    elif request.method == "DELETE":
        domain = request.json.get("host")
        blacklist = [d for d in blacklist if d != domain]

    with open(BLACKLIST_FILE, "w") as f:
        json.dump(blacklist, f)

    return jsonify(blacklist)

@app.route("/api/cache/clear", methods=["POST"])
def clear_cache():
    cache_dir = "cache"
    for f in os.listdir(cache_dir):
        os.remove(os.path.join(cache_dir, f))
    return jsonify({"status": "cleared"})
