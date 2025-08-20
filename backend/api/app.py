from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from pathlib import Path
from metrics import get_system_metrics, get_cache_metrics

app = Flask(__name__)
CORS(app)

# Update paths to point to your proxy logs and blacklist files
BASE_DIR = Path(__file__).resolve().parent.parent
PROXY_LOG_FILE = BASE_DIR / "proxy_server" / "logs" / "proxy.log"
BLACKLIST_FILE = BASE_DIR / "proxy_server" / "blacklist.txt"  # or .json if that fits

@app.route("/api/logs")
def get_logs():
    logs = []
    if PROXY_LOG_FILE.exists():
        try:
            with PROXY_LOG_FILE.open("r") as f:
                # Read lines reversed to get recent logs first
                for line in reversed(f.readlines()):
                    try:
                        logs.append(json.loads(line))
                        if len(logs) >= 50:
                            break
                    except json.JSONDecodeError:
                        continue
        except Exception as e:
            print(f"Error reading proxy log file: {e}")
    return jsonify(logs)

@app.route("/api/metrics")
def get_metrics():
    metrics = get_system_metrics()
    metrics.update(get_cache_metrics())
    return jsonify(metrics)

@app.route("/api/blacklist", methods=["GET", "POST", "DELETE"])
def manage_blacklist():
    if BLACKLIST_FILE.exists():
        try:
            with BLACKLIST_FILE.open() as f:
                blacklist = f.read().splitlines()
        except Exception:
            blacklist = []
    else:
        blacklist = []

    if request.method == "POST":
        domain = request.json.get("host")
        if domain and domain not in blacklist:
            blacklist.append(domain)
    elif request.method == "DELETE":
        domain = request.json.get("host")
        blacklist = [d for d in blacklist if d != domain]

    try:
        with BLACKLIST_FILE.open("w") as f:
            f.write("\n".join(blacklist) + "\n")
    except Exception as e:
        print(f"Error writing blacklist file: {e}")

    return jsonify(blacklist)

@app.route("/api/cache/clear", methods=["POST"])
def clear_cache():
    cache_dir = BASE_DIR / "proxy_server" / "cache"
    if cache_dir.exists():
        try:
            for f in cache_dir.iterdir():
                f.unlink()
        except Exception as e:
            print(f"Failed clearing cache: {e}")
            return jsonify({"status": "error"}), 500
    return jsonify({"status": "cleared"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
