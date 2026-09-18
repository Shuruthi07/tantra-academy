from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import urllib.parse

app = Flask(__name__)
CORS(app)


# =========================================
# LYRICS API
# =========================================

@app.route("/api/lyrics", methods=["GET"])
def get_lyrics():

    song = request.args.get("song")
    artist = request.args.get("artist")

    if not song or not artist:
        return jsonify({
            "error": "Song name and artist are required"
        }), 400


    # =====================================
    # SOURCE 1 - LYRICS.OVH
    # =====================================

    try:

        artist_encoded = urllib.parse.quote(
            artist.strip()
        )

        song_encoded = urllib.parse.quote(
            song.strip()
        )

        url = (
            f"https://api.lyrics.ovh/v1/"
            f"{artist_encoded}/{song_encoded}"
        )

        response = requests.get(
            url,
            timeout=10
        )

        if response.status_code == 200:

            data = response.json()

            lyrics = data.get(
                "lyrics",
                ""
            )

            if lyrics:

                return jsonify({
                    "song": song,
                    "artist": artist,
                    "lyrics": lyrics,
                    "source": "lyrics.ovh"
                })


    except Exception as error:

        print(
            "Lyrics.ovh Error:",
            error
        )


    # =====================================
    # SOURCE 2 - LRCLIB
    # =====================================

    try:

        params = {
            "track_name": song,
            "artist_name": artist
        }

        response = requests.get(
            "https://lrclib.net/api/get",
            params=params,
            timeout=10
        )

        if response.status_code == 200:

            data = response.json()

            lyrics = data.get(
                "plainLyrics",
                ""
            )

            if lyrics:

                return jsonify({
                    "song": song,
                    "artist": artist,
                    "lyrics": lyrics,
                    "source": "LRCLIB"
                })


    except Exception as error:

        print(
            "LRCLIB Error:",
            error
        )


    # =====================================
    # NOTHING FOUND
    # =====================================

    return jsonify({
        "error": "Lyrics not found for this song."
    }), 404


# =========================================
# SERVER
# =========================================

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5001,
        debug=True
    )