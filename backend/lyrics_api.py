
from flask import Blueprint, request, jsonify
import requests
import urllib.parse

lyrics = Blueprint("lyrics", __name__)

SESSION = requests.Session()
SESSION.headers.update({
    "User-Agent": "TantraAcademy/1.0"
})


@lyrics.route("/", methods=["GET"])
def get_lyrics():
    song = request.args.get("song", "").strip()
    artist = request.args.get("artist", "").strip()

    if not song or not artist:
        return jsonify({
            "success": False,
            "error": "Song name and artist are required"
        }), 400

    # Source 1: Lyrics.ovh
    try:
        artist_encoded = urllib.parse.quote(artist, safe="")
        song_encoded = urllib.parse.quote(song, safe="")

        url = (
            f"https://api.lyrics.ovh/v1/"
            f"{artist_encoded}/{song_encoded}"
        )

        response = SESSION.get(url, timeout=12)
        print("Lyrics.ovh status:", response.status_code)

        if response.ok:
            data = response.json()
            lyrics_text = data.get("lyrics", "").strip()

            if lyrics_text:
                return jsonify({
                    "success": True,
                    "song": song,
                    "artist": artist,
                    "lyrics": lyrics_text,
                    "source": "Lyrics.ovh"
                }), 200

    except requests.RequestException as error:
        print("Lyrics.ovh request error:", error)
    except (ValueError, AttributeError) as error:
        print("Lyrics.ovh response error:", error)

    # Source 2: LRCLIB search
    searches = [
        {"track_name": song, "artist_name": artist},
        {"q": f"{song} {artist}"}
    ]

    try:
        for params in searches:
            response = SESSION.get(
                "https://lrclib.net/api/search",
                params=params,
                timeout=12
            )

            print(
                "LRCLIB status:",
                response.status_code,
                "search:",
                params
            )

            if not response.ok:
                continue

            results = response.json()

            if not isinstance(results, list):
                continue

            # Prefer results matching both song and artist.
            results.sort(
                key=lambda item: (
                    song.casefold() in
                    str(item.get("trackName", "")).casefold()
                    and artist.casefold() in
                    str(item.get("artistName", "")).casefold()
                ),
                reverse=True
            )

            for item in results:
                if not isinstance(item, dict):
                    continue

                lyrics_text = (
                    item.get("plainLyrics") or ""
                ).strip()

                if not lyrics_text:
                    lyrics_text = (
                        item.get("syncedLyrics") or ""
                    ).strip()

                if lyrics_text:
                    return jsonify({
                        "success": True,
                        "song": item.get("trackName", song),
                        "artist": item.get("artistName", artist),
                        "lyrics": lyrics_text,
                        "source": "LRCLIB"
                    }), 200

    except requests.RequestException as error:
        print("LRCLIB request error:", error)
    except (ValueError, AttributeError) as error:
        print("LRCLIB response error:", error)

    return jsonify({
        "success": False,
        "error": (
            "Lyrics are unavailable for this song. "
            "Try checking the song title and artist."
        )
    }), 404