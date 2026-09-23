from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
from datetime import datetime
from flask_jwt_extended import (
    jwt_required,
    get_jwt
)
import os


load_dotenv()


song_progress = Blueprint(
    "song_progress",
    __name__
)


client = MongoClient(
    os.getenv("MONGO_URI")
)

db = client[
    os.getenv("DATABASE_NAME")
]


song_progress_collection = db[
    "songProgress"
]

songs_collection = db[
    "songs"
]

users_collection = db[
    "users"
]


# =====================================================
# HELPER FUNCTIONS
# =====================================================

def get_user_role():

    claims = get_jwt()

    return str(
        claims.get("role", "")
    ).lower()


def get_current_user_id():

    claims = get_jwt()

    return str(
        claims.get("sub", "")
    )


# =====================================================
# GET SONG PROGRESS
# =====================================================

@song_progress.route(
    "/",
    methods=["GET"]
)
@jwt_required()
def get_song_progress():

    try:

        role = get_user_role()

        logged_in_user_id = (
            get_current_user_id()
        )

        student_id = request.args.get(
            "studentId"
        )

        song_id = request.args.get(
            "songId"
        )

        query = {}


        # -------------------------------------------------
        # STUDENT
        # -------------------------------------------------

        if role == "student":

            # Student can only see own progress.
            query["studentId"] = (
                logged_in_user_id
            )


        # -------------------------------------------------
        # TEACHER / ADMIN
        # -------------------------------------------------

        elif role in [
            "teacher",
            "admin"
        ]:

            if student_id:

                query["studentId"] = str(
                    student_id
                )


        else:

            return jsonify({

                "success":
                    False,

                "message":
                    "Access denied"

            }), 403


        if song_id:

            query["songId"] = str(
                song_id
            )


        progress_list = list(

            song_progress_collection
            .find(query)
            .sort(
                "updatedAt",
                -1
            )

        )


        result = []


        for progress in progress_list:

            current_student_name = progress.get(
                "studentName",
                "Student"
            )


            # -----------------------------------------
            # GET LATEST STUDENT NAME
            # -----------------------------------------

            saved_student_id = progress.get(
                "studentId"
            )


            if saved_student_id:

                try:

                    student = users_collection.find_one({

                        "_id":
                            ObjectId(
                                saved_student_id
                            ),

                        "role":
                            "student"

                    })


                    if student:

                        current_student_name = student.get(

                            "name",

                            current_student_name

                        )


                except Exception:

                    pass


            # -----------------------------------------
            # GET SONG TITLE
            # -----------------------------------------

            current_song_title = progress.get(
                "songTitle",
                ""
            )


            saved_song_id = progress.get(
                "songId"
            )


            if saved_song_id:

                try:

                    song = songs_collection.find_one({

                        "_id":
                            ObjectId(
                                saved_song_id
                            )

                    })


                    if song:

                        current_song_title = song.get(

                            "title",

                            current_song_title

                        )


                except Exception:

                    pass


            # -----------------------------------------
            # RETURN DATA
            # -----------------------------------------

            result.append({

                "id":
                    str(
                        progress["_id"]
                    ),

                "songId":
                    progress.get(
                        "songId"
                    ),

                "songTitle":
                    current_song_title,

                "studentId":
                    progress.get(
                        "studentId"
                    ),

                "studentName":
                    current_student_name,

                "progress":
                    progress.get(
                        "progress",
                        0
                    ),

                "status":
                    progress.get(
                        "status",
                        "Not Started"
                    ),

                "updatedAt":
                    progress.get(
                        "updatedAt"
                    )

            })


        return jsonify({

            "success":
                True,

            "progress":
                result

        }), 200


    except Exception as error:

        print(
            "Song progress GET error:",
            error
        )

        return jsonify({

            "success":
                False,

            "message":
                "Unable to load song progress",

            "error":
                str(error)

        }), 500


# =====================================================
# UPDATE SONG PROGRESS
# =====================================================

@song_progress.route(
    "/update",
    methods=["POST"]
)
@jwt_required()
def update_song_progress():

    try:

        role = get_user_role()

        logged_in_user_id = (
            get_current_user_id()
        )


        # Only students can update learning progress.
        if role != "student":

            return jsonify({

                "success":
                    False,

                "message":
                    "Student access required"

            }), 403


        data = request.get_json() or {}


        song_id = data.get(
            "songId"
        )


        # Do not trust studentId from frontend.
        # Use the authenticated JWT user ID.
        student_id = (
            logged_in_user_id
        )


        student_name = data.get(
            "studentName",
            "Student"
        )


        progress = data.get(
            "progress",
            0
        )


        # ---------------------------------------------
        # CHECK SONG ID
        # ---------------------------------------------

        if not song_id:

            return jsonify({

                "success":
                    False,

                "message":
                    "Song ID is required"

            }), 400


        if not student_id:

            return jsonify({

                "success":
                    False,

                "message":
                    "Student ID is required"

            }), 400


        # ---------------------------------------------
        # CHECK SONG
        # ---------------------------------------------

        try:

            song = songs_collection.find_one({

                "_id":
                    ObjectId(
                        song_id
                    )

            })

        except Exception:

            return jsonify({

                "success":
                    False,

                "message":
                    "Invalid song ID"

            }), 400


        if not song:

            return jsonify({

                "success":
                    False,

                "message":
                    "Song not found"

            }), 404


        # ---------------------------------------------
        # CHECK STUDENT
        # ---------------------------------------------

        try:

            student = users_collection.find_one({

                "_id":
                    ObjectId(
                        student_id
                    ),

                "role":
                    "student"

            })

        except Exception:

            return jsonify({

                "success":
                    False,

                "message":
                    "Invalid student ID"

            }), 400


        if not student:

            return jsonify({

                "success":
                    False,

                "message":
                    "Student not found"

            }), 404


        # ---------------------------------------------
        # VALIDATE PROGRESS
        # ---------------------------------------------

        try:

            progress = int(
                float(progress)
            )

        except Exception:

            progress = 0


        progress = max(
            0,
            min(
                100,
                progress
            )
        )


        # ---------------------------------------------
        # CALCULATE STATUS
        # ---------------------------------------------

        if progress >= 100:

            status = "Completed"

        elif progress > 0:

            status = "Learning"

        else:

            status = "Not Started"


        # ---------------------------------------------
        # CURRENT TIME
        # ---------------------------------------------

        now = datetime.utcnow()


        # ---------------------------------------------
        # DATA TO SAVE
        # ---------------------------------------------

        progress_data = {

            "songId":
                song_id,

            "songTitle":
                song.get(
                    "title",
                    ""
                ),

            "studentId":
                student_id,

            "studentName":
                student.get(
                    "name",
                    student_name
                ),

            "progress":
                progress,

            "status":
                status,

            "updatedAt":
                now

        }


        # ---------------------------------------------
        # FIND EXISTING RECORD
        # ---------------------------------------------

        existing = (
            song_progress_collection.find_one({

                "songId":
                    song_id,

                "studentId":
                    student_id

            })
        )


        # ---------------------------------------------
        # UPDATE EXISTING RECORD
        # ---------------------------------------------

        if existing:

            song_progress_collection.update_one(

                {
                    "_id":
                        existing["_id"]
                },

                {
                    "$set":
                        progress_data
                }

            )


            progress_id = str(
                existing["_id"]
            )


        # ---------------------------------------------
        # CREATE NEW RECORD
        # ---------------------------------------------

        else:

            result = (
                song_progress_collection
                .insert_one(
                    progress_data
                )
            )


            progress_id = str(
                result.inserted_id
            )


        # ---------------------------------------------
        # SUCCESS RESPONSE
        # ---------------------------------------------

        return jsonify({

            "success":
                True,

            "message":
                "Song progress updated successfully",

            "progress":
                progress,

            "status":
                status,

            "progressId":
                progress_id

        }), 200


    except Exception as error:

        print(
            "Song progress update error:",
            error
        )

        return jsonify({

            "success":
                False,

            "message":
                "Unable to update song progress",

            "error":
                str(error)

        }), 500