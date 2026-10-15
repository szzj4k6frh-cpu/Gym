"""Serve the real app with one deliberately missing precache asset."""
from http.server import SimpleHTTPRequestHandler, HTTPServer
from pathlib import Path

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/sw.js':
            body = Path('sw.js').read_text().replace("const FILES=[", "const FILES=['./missing-test-asset.png',").encode()
            self.send_response(200)
            self.send_header('Content-Type', 'application/javascript')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        else:
            super().do_GET()

HTTPServer(('127.0.0.1', 4175), Handler).serve_forever()
