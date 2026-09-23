from flask import Blueprint, request, jsonify
import requests
import urllib.parse


# =====================================================
# LYRICS BLUEPRINT
# =====================================================

lyrics = Blueprint(
    "lyrics",
    __name__
)


# =====================================================
# LYRICS API
# =====================================================

@lyrics.route("/", methods=["GET"])
def get_lyrics():

    song = request.args.get(
        "song",
        ""
    ).strip()

    artist = request.args.get(
        "artist",
        ""
    ).strip()


    # =================================================
    # CHECK REQUIRED VALUES
    # =================================================

    if not song or not artist:

        return jsonify({
            "success": False,
            "error": "Song name and artist are required"
        }), 400


    # =================================================
    # SOURCE 1 - LYRICS.OVH
    # =================================================

    try:

        artist_encoded = urllib.parse.quote(
            artist,
            safe=""
        )

        song_encoded = urllib.parse.quote(
            song,
            safe=""
        )

        url = (
            "https://api.lyrics.ovh/v1/"
            f"{artist_encoded}/"
            f"{song_encoded}"
        )

        print(
            "Trying Lyrics.ovh:",
            url
        )

        response = requests.get(
            url,
            timeout=10
        )

        if response.status_code == 200:

            data = response.json()

            lyrics_text = data.get(
                "lyrics",
                ""
            )

            if (
                lyrics_text
                and lyrics_text.strip()
            ):

                print(
                    "Lyrics found using Lyrics.ovh"
                )

                return jsonify({

                    "success": True,

                    "song": song,

                    "artist": artist,

                    "lyrics": lyrics_text,

                    "source": "Lyrics.ovh"

                }), 200

    except Exception as error:

        print(
            "Lyrics.ovh Error:",
            error
        )


    # =================================================
    # SOURCE 2 - LRCLIB SEARCH
    # =================================================

    try:

        params = {

            "track_name":
                song,

            "artist_name":
                artist

        }

        print(
            "Trying LRCLIB..."
        )

        response = requests.get(

            "https://lrclib.net/api/search",

            params=params,

            timeout=10,

            headers={
                "User-Agent":
                    "TantraAcademy/1.0"
            }

        )

        if response.status_code == 200:

            # IMPORTANT:
            # Keep this on ONE line.
            results = response.json()

            if isinstance(
                results,
                list
            ):

                for item in results:

                    if not isinstance(
                        item,
                        dict
                    ):
                        continue

                    lyrics_text = (

                        item.get(
                            "plainLyrics"
                        )

                        or ""

                    )

                    if (
                        lyrics_text
                        and lyrics_text.strip()
                    ):

                        print(
                            "Lyrics found using LRCLIB"
                        )

                        return jsonify({

                            "success": True,

                            "song": song,

                            "artist": artist,

                            "lyrics":
                                lyrics_text,

                            "source":
                                "LRCLIB"

                        }), 200

    except Exception as error:

        print(
            "LRCLIB Error:",
            error
        )


    # =================================================
    # NOTHING FOUND
    # =================================================

    print(
        "Lyrics not found:",
        song,
        "-",
        artist
    )

    return jsonify({

        "success": False,

        "error":
            "Lyrics not found for this song."

    }), 404