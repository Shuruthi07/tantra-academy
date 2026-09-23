from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager

from routes.auth import auth
from routes.admin import admin
from routes.task_progress import task_progress
from routes.song_progress import song_progress
from routes.notifications import notifications
from routes.fees import fees
from routes.events import events
from routes.gallery import gallery
from routes.attendance import attendance
from routes.schedule import schedule
from routes.feedback import feedback

from lyrics_api import lyrics

import os


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv()


# ============================================================
# CREATE FLASK APP
# ============================================================

app = Flask(__name__)


# ============================================================
# JWT CONFIGURATION
# ============================================================

app.config["JWT_SECRET_KEY"] = os.getenv(
    "JWT_SECRET_KEY"
)

app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 60 * 60 * 24

jwt = JWTManager(app)


# ============================================================
# CORS CONFIGURATION
# ============================================================

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": allowed_origins
        }
    },
    supports_credentials=True,
    allow_headers=[
        "Content-Type",
        "Authorization"
    ],
    methods=[
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS"
    ]
)


# ============================================================
# MONGODB CONFIGURATION
# ============================================================

mongo_uri = os.getenv("MONGO_URI")
database_name = os.getenv("DATABASE_NAME")

client = MongoClient(mongo_uri)

db = client[database_name]


# ============================================================
# REGISTER BLUEPRINTS
# ============================================================

app.register_blueprint(
    auth,
    url_prefix="/api/auth"
)

app.register_blueprint(
    admin,
    url_prefix="/api/admin"
)

app.register_blueprint(
    task_progress,
    url_prefix="/api/task-progress"
)

app.register_blueprint(
    song_progress,
    url_prefix="/api/song-progress"
)

app.register_blueprint(
    notifications,
    url_prefix="/api/notifications"
)

app.register_blueprint(
    fees,
    url_prefix="/api/fees"
)

app.register_blueprint(
    events,
    url_prefix="/api/events"
)

app.register_blueprint(
    gallery,
    url_prefix="/api/gallery"
)

app.register_blueprint(
    attendance,
    url_prefix="/api/attendance"
)

app.register_blueprint(
    schedule,
    url_prefix="/api/schedule"
)

app.register_blueprint(
    feedback,
    url_prefix="/api/feedback"
)

app.register_blueprint(
    lyrics,
    url_prefix="/api/lyrics"
)


# ============================================================
# HOME
# ============================================================

@app.route("/")
def home():

    return jsonify({
        "success": True,
        "message": "Tantra Academy Backend is running successfully 🎵"
    })


# ============================================================
# MONGODB TEST
# ============================================================

@app.route("/api/test")
def test():

    try:

        client.admin.command("ping")

        return jsonify({
            "success": True,
            "message": "MongoDB connection is working!"
        })

    except Exception as error:

        return jsonify({
            "success": False,
            "message": "MongoDB connection failed",
            "error": str(error)
        }), 500


# ============================================================
# 404 ERROR
# ============================================================

@app.errorhandler(404)
def not_found(error):

    return jsonify({
        "success": False,
        "message": "API endpoint not found"
    }), 404


# ============================================================
# 500 ERROR
# ============================================================

@app.errorhandler(500)
def internal_server_error(error):

    return jsonify({
        "success": False,
        "message": "Internal server error"
    }), 500


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":

    app.run(
        debug=False,
        host="127.0.0.1",
        port=5000
    )