# backend/proxy_server/server.py
import sys
import time
import re
import threading
import traceback
import socket
import select
from socket import gaierror, timeout as SocketTimeout
from pathlib import Path
import json

BASE_DIR = Path(__file__).resolve().parent
LOG_DIR = BASE_DIR / "logs"
CACHE_DIR = BASE_DIR / "cache"
BLACKLIST_FILE = BASE_DIR / "blacklist.txt"

LOG_DIR.mkdir(parents=True, exist_ok=True)
CACHE_DIR.mkdir(parents=True, exist_ok=True)
if not BLACKLIST_FILE.exists():
    BLACKLIST_FILE.write_text("")  # create empty blacklist

logger_file_name = LOG_DIR / "proxy.log"

# stats for Flask API integration (thread-safe update using stats_lock)
stats_lock = threading.Lock()
stats = {
    "total_requests": 0,
    "cache_hits": 0,
    "cache_misses": 0,
    "errors": 0,
}

class Server:
    def __init__(self, port=8080):
        self.server_port = port
        try:
            self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        except Exception as e:
            print(f"Socket creation error: {e}")
            self.log_info({"event":"socket_error","error":str(e)})
            raise
        try:
            self.server_socket.bind(('', self.server_port))
        except OSError as e:
            # handle "port in use" on Windows (10048) and unix (98)
            if getattr(e, "errno", None) in (10048, 98):
                print(f"Port {self.server_port} in use; binding to ephemeral port")
                self.server_socket.bind(('', 0))
                self.server_port = self.server_socket.getsockname()[1]
            else:
                raise
        self.server_socket.listen(50)
        self.log_info({"event":"server_start","port":self.server_port})
        print(f"Proxy server listening on 0.0.0.0:{self.server_port}")

    def listen_to_client(self):
        while True:
            client_socket, client_address = self.server_socket.accept()
            self.log_info({"event":"client_connect","client":client_address})
            thread = threading.Thread(target=self.proxy_thread, args=(client_socket, client_address))
            thread.daemon = True
            thread.start()

    def proxy_thread(self, client_socket, client_address):
        start_time = time.time()
        try:
            client_request_bytes = client_socket.recv(8192)
            if not client_request_bytes:
                client_socket.close()
                return
            try:
                client_request = client_request_bytes.decode('utf-8',errors='ignore')
            except:
                client_request = ""

            with stats_lock:
                stats["total_requests"] += 1

            if client_request.startswith("CONNECT"):
                self.handle_https(client_socket, client_request, client_address, start_time)
                return

            self.handle_http(client_socket, client_address, start_time, client_request_bytes)
        except Exception as e:
            self.log_info({"event":"thread_error","error":str(e),"trace":traceback.format_exc()})
        finally:
            try:
                client_socket.close()
            except:
                pass

    def is_blocked(self, hostname):
        try:
            entries = BLACKLIST_FILE.read_text().splitlines()
            for line in entries:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                # simple substring match for blacklist rules
                if line.lower() in hostname.lower():
                    return True
            return False
        except Exception:
            return False

    def handle_http(self, client_socket, client_address, start_time, request_bytes):
        try:
            request_str = request_bytes.decode('utf-8',errors='ignore')
            method = request_str.split(' ')[0]
            if method != "GET":
                client_socket.send(b"HTTP/1.1 405 Method Not Allowed\r\n\r\n")
                self.log_info({"event":"non_get","client":client_address,"method":method})
                return
            url_part = request_str.split(' ')[1]
            if '//' in url_part:
                url_clean = url_part.split('//')[1].split('/')[0]
            else:
                url_clean = url_part.split('/')[0]
            if ':' in url_clean:
                host, port_str = url_clean.split(':')
                port = int(port_str)
            else:
                host = url_clean
                port = 80

            if self.is_blocked(host):
                client_socket.send(b"HTTP/1.1 403 Forbidden\r\n\r\nBlocked by proxy")
                self.log_info({"event":"blocked","host":host,"client":client_address})
                return

            cache_filename = re.sub('[^0-9a-zA-Z]+','_',host)+".cache"
            cache_path = CACHE_DIR / cache_filename
            if cache_path.exists():
                response = cache_path.read_bytes()
                client_socket.send(response)
                end_time = time.time()
                with stats_lock:
                    stats["cache_hits"] += 1
                self.log_info({"event":"cache_hit","host":host,"client":client_address,"rtt":end_time-start_time,"size":len(response)})
                return
            else:
                with stats_lock:
                    stats["cache_misses"] += 1
                self.log_info({"event":"cache_miss","host":host,"client":client_address})
                self.fetch_from_web(client_socket, client_address, start_time, host, port, cache_path, request_bytes)
        except Exception as e:
            with stats_lock:
                stats["errors"] += 1
            self.log_info({"event":"http_error","error":str(e),"trace":traceback.format_exc()})
            try:
                client_socket.send(b"HTTP/1.1 500 Internal Server Error\r\n\r\n")
            except:
                pass

    def fetch_from_web(self, client_socket, client_address, start_time, host, port, cache_path, request_bytes):
        web_socket = None
        try:
            web_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            web_socket.settimeout(20)
            self.log_info({"event":"connect_target","host":host,"port":port})
            web_socket.connect((host,port))
            web_socket.sendall(request_bytes)
            response = bytearray()
            while True:
                chunk = web_socket.recv(4096)
                if not chunk:
                    break
                response.extend(chunk)
            cache_path.write_bytes(response)
            client_socket.sendall(response)
            end_time = time.time()
            self.log_info({"event":"fetched","host":host,"client":client_address,"rtt":end_time-start_time,"size":len(response)})
        except SocketTimeout:
            try:
                client_socket.send(b"HTTP/1.1 504 Gateway Timeout\r\n\r\n")
            except:
                pass
            self.log_info({"event":"timeout","host":host})
        except gaierror:
            try:
                client_socket.send(b"HTTP/1.1 502 Bad Gateway\r\n\r\n")
            except:
                pass
            self.log_info({"event":"dns_fail","host":host})
        except Exception as e:
            try:
                client_socket.send(b"HTTP/1.1 500 Internal Server Error\r\n\r\n")
            except:
                pass
            self.log_info({"event":"fetch_error","host":host,"error":str(e)})
        finally:
            if web_socket:
                web_socket.close()

    def handle_https(self, client_socket, request, client_address, start_time):
        try:
            host_port = request.split(' ')[1]
            if ':' in host_port:
                host, port = host_port.split(':')
                port = int(port)
            else:
                host = host_port
                port = 443
            if self.is_blocked(host):
                client_socket.send(b"HTTP/1.1 403 Forbidden\r\n\r\nBlocked by proxy")
                self.log_info({"event":"blocked_https","host":host,"client":client_address})
                return
            remote_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            remote_socket.settimeout(10)
            remote_socket.connect((host,port))
            client_socket.send(b"HTTP/1.1 200 Connection Established\r\nProxy-Agent: PyProxy/1.0\r\n\r\n")
            self.tunnel(client_socket,remote_socket)
        except Exception as e:
            self.log_info({"event":"https_error","error":str(e),"trace":traceback.format_exc()})
            try:
                client_socket.send(b"HTTP/1.1 502 Bad Gateway\r\n\r\n")
            except:
                pass

    def tunnel(self, client_sock, remote_sock):
        sockets = [client_sock, remote_sock]
        while True:
            try:
                readable, _, _ = select.select(sockets, [], [], 30)
            except Exception as e:
                self.log_info({"event":"tunnel_select_error","error":str(e)})
                break
            if not readable:
                break
            for s in readable:
                try:
                    data = s.recv(4096)
                    if not data:
                        return
                    if s is client_sock:
                        remote_sock.sendall(data)
                    else:
                        client_sock.sendall(data)
                except (ConnectionResetError, BrokenPipeError):
                    return
                except Exception as e:
                    self.log_info({"event":"tunnel_error","error":str(e)})
                    return

    def log_info(self, message):
        # message is a dict for structured logging; we store JSON lines in logs/proxy.log
        try:
            if not isinstance(message, dict):
                message = {"msg": str(message)}
            message["timestamp"] = time.strftime("%Y-%m-%d %H:%M:%S")
            with open(logger_file_name, "a") as f:
                f.write(json.dumps(message) + "\n")
        except Exception:
            pass

if __name__ == "__main__":
    port = 8080
    if len(sys.argv) >= 2:
        try:
            port = int(sys.argv[1])
        except:
            pass
    server = Server(port=port)
    try:
        server.listen_to_client()
    except KeyboardInterrupt:
        print("Shutting down")
