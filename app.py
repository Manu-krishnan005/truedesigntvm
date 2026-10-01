# app.py - minimal dev server (pre-email / pre-deploy state)

import os
from flask import Flask, render_template, jsonify, send_from_directory

# Project folders (adjust if your layout differs)
TEMPLATES_DIR = "templates"
STATIC_DIR = "static"

app = Flask(__name__, template_folder=TEMPLATES_DIR, static_folder=STATIC_DIR)


@app.route("/", methods=["GET"])
def index():
    """Serve the main single-page app (index.html in templates/)."""
    return render_template("index.html")


@app.route("/_status", methods=["GET"])
def status():
    """Simple health check for local testing."""
    return jsonify({
        "ok": True,
        "service": "True Designs (dev)",
        "env": os.environ.get("FLASK_ENV", "development")
    })


@app.route("/sitemap.xml", methods=["GET"])
def sitemap():
    """Serve sitemap for Google indexing."""
    return send_from_directory(STATIC_DIR, "sitemap.xml", mimetype="application/xml")


@app.route("/robots.txt", methods=["GET"])
def robots():
    """Serve robots.txt for search engine crawlers."""
    return send_from_directory(STATIC_DIR, "robots.txt", mimetype="text/plain")


@app.route("/favicon.ico", methods=["GET"])
def favicon():
    """Serve favicon from root so browsers and Google can always find it."""
    return send_from_directory(
        f"{STATIC_DIR}/images", "favicon.png", mimetype="image/png"
    )


if __name__ == "__main__":
    # Helpful startup info
    print("Starting True Designs minimal Flask app")
    print(f"TEMPLATE DIR: {TEMPLATES_DIR}")
    print(f"STATIC DIR: {STATIC_DIR}")
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)
