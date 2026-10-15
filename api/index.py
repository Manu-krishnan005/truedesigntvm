import os
import sys

# Add project root to sys.path so app.py can be imported
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from app import app


class VercelPathMiddleware:
    """
    WSGI middleware that rewrites the internal Vercel path /api/index
    back to the original request path, without touching /static/ requests.
    Vercel passes the true client path in the X-Vercel-Deployment-Url or
    in PATH_INFO depending on how the rewrite rule is set up.
    """
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        path = environ.get("PATH_INFO", "")

        # If Vercel internally rewrote to /api/index, restore the original path
        # from the x-now-route-matches or from HTTP_X_FORWARDED_URI header.
        # For a simple single-page app, just restore it to "/" so Flask serves index.html.
        if path in ("/api/index", "/api"):
            environ["PATH_INFO"] = "/"

        return self.wsgi_app(environ, start_response)


app.wsgi_app = VercelPathMiddleware(app.wsgi_app)
