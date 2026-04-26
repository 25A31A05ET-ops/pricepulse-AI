# Simple HTTP Server for PricePluse AI
# Run this to serve the application

import http.server
import socketserver
import webbrowser
import os

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

print(f"""
╔══════════════════════════════════════════════════════════╗
║           PricePluse AI - Starting Server                ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Opening http://localhost:{PORT} in your browser...      ║
║                                                          ║
║  Press Ctrl+C to stop the server                        ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
""")

# Change to the directory containing the files
os.chdir(DIRECTORY)

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    webbrowser.open(f"http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")