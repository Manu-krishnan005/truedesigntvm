import os
import sys

# Add project root to sys.path so app.py can be imported
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from app import app


class VercelPathMiddleware:
    """
    WSGI middleware that restores the original client request path.

    When Vercel routes via 'routes' (not 'rewrites'), it passes the original
    PATH_INFO correctly. However, when 'rewrites' are used, PATH_INFO becomes
    '/api/index' for all requests. This middleware uses the x-vercel-rewrite
    or x-forwarded-uri header to restore the original path.
    """
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        # Vercel passes the original client path in HTTP_X_NOW_ROUTE_MATCHES
        # or HTTP_X_MATCHED_PATH. Use whichever is available.
        original_path = (
            environ.get("HTTP_X_MATCHED_PATH")
            or environ.get("HTTP_X_NOW_ROUTE_MATCHES")
            or environ.get("HTTP_X_FORWARDED_URI")
        )

        if original_path:
            # Strip query string if present
            environ["PATH_INFO"] = original_path.split("?")[0]
        elif environ.get("PATH_INFO") in ("/api/index", "/api"):
            # Fallback: if path is the internal rewrite destination, serve root
            environ["PATH_INFO"] = "/"

        return self.wsgi_app(environ, start_response)


app.wsgi_app = VercelPathMiddleware(app.wsgi_app)
