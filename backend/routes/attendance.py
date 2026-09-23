from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt
import os


# ============================================================
# LOAD ENVIRONMENT
# ============================================================

load_dotenv()


# ============================================================
# BLUEPRINT
# ============================================================

attendance = Blueprint(
    "attendance",
    __name__
)


# ============================================================
# MONGODB
# ============================================================

client = MongoClient(
    os.getenv("MONGO_URI")
)

db = client[
    os.getenv("DATABASE_NAME")
]

attendance_collection = db["attendance"]
users_collection = db["users"]
notifications_collection = db["notifications"]


# ============================================================
# HELPERS
# ============================================================

def get_user_role():

    claims = get_jwt()

    return str(
        claims.get(
            "role",
            ""
        )
    ).lower()


def get_logged_in_user_id():

    claims = get_jwt()

    return str(
        claims.get(
            "sub",
            ""
        )
    )


# ============================================================
# CREATE NOTIFICATION
# ============================================================

def create_attendance_notification(
    student_id,
    student_name,
    date,
    status,
    course,
    created_by
):

    try:

        if not student_id:
            return False


        if status == "Present":

            title = "📋 Attendance Updated"

            message = (
                f"Your attendance for {date} "
                f"has been marked Present."
            )

        else:

            title = "⚠️ Attendance Updated"

            message = (
                f"Your attendance for {date} "
                f"has been marked Absent."
            )


        # ----------------------------------------------------
        # Prevent duplicate unread notifications
        # ----------------------------------------------------

        existing = (
            notifications_collection.find_one({

                "userId":
                    str(student_id),

                "title":
                    title,

                "message":
                    message,

                "type":
                    "attendance",

                "read":
                    False

            })
        )


        if existing:

            print(
                "Duplicate attendance notification skipped."
            )

            return False


        notification = {

            "userId":
                str(student_id),

            "title":
                title,

            "message":
                message,

            "type":
                "attendance",

            "read":
                False,

            "createdAt":
                datetime.utcnow(),

            "createdBy":
                str(created_by),

            "createdByRole":
                "teacher"

        }


        result = (
            notifications_collection.insert_one(
                notification
            )
        )


        print(
            "Attendance notification created:",
            result.inserted_id
        )


        return True


    except Exception as error:

        print(
            "Attendance notification error:",
            error
        )

        return False


# ============================================================
# FORMAT ATTENDANCE
# ============================================================

def format_attendance(record):

    return {

        "id": str(
            record.get(
                "_id",
                ""
            )
        ),

        "studentId": str(
            record.get(
                "studentId",
                ""
            )
        ),

        "studentName": record.get(
            "studentName",
            ""
        ),

        "course": record.get(
            "course",
            "Music Training"
        ),

        "date": record.get(
            "date",
            ""
        ),

        "status": record.get(
            "status",
            "Absent"
        ),

        "attendance": float(
            record.get(
                "attendance",
                0
            )
        )

    }


# ============================================================
# GET ATTENDANCE
#
# Teacher/Admin:
# /api/attendance/?date=YYYY-MM-DD
#
# Student:
# /api/attendance/?studentId=USER_ID
# ============================================================

@attendance.route(
    "/",
    methods=["GET"],
    strict_slashes=False
)
@jwt_required()
def get_attendance():

    try:

        role = get_user_role()

        requested_student_id = request.args.get(
            "studentId"
        )

        requested_date = request.args.get(
            "date"
        )


        # ====================================================
        # STUDENT
        # ====================================================

        if role == "student":

            logged_in_user_id = (
                get_logged_in_user_id()
            )

            if not requested_student_id:

                requested_student_id = (
                    logged_in_user_id
                )

            if (
                str(requested_student_id)
                !=
                str(logged_in_user_id)
            ):

                return jsonify({

                    "success": False,

                    "message":
                        "You can only view your own attendance."

                }), 403


            records = list(
                attendance_collection.find({

                    "studentId":
                        str(
                            requested_student_id
                        )

                }).sort(
                    "date",
                    -1
                )
            )


            result = [
                format_attendance(record)
                for record in records
            ]


            return jsonify({

                "success": True,

                "attendance":
                    result

            }), 200


        # ====================================================
        # TEACHER / ADMIN
        # ====================================================

        if role not in [
            "teacher",
            "admin"
        ]:

            return jsonify({

                "success": False,

                "message":
                    "Access denied."

            }), 403


        # ====================================================
        # SPECIFIC STUDENT
        # ====================================================

        if requested_student_id:

            records = list(
                attendance_collection.find({

                    "studentId":
                        str(
                            requested_student_id
                        )

                }).sort(
                    "date",
                    -1
                )
            )


            result = [
                format_attendance(record)
                for record in records
            ]


            return jsonify({

                "success": True,

                "attendance":
                    result

            }), 200


        # ====================================================
        # DATE ATTENDANCE
        # ====================================================

        if not requested_date:

            requested_date = datetime.now().strftime(
                "%Y-%m-%d"
            )


        records = list(
            attendance_collection.find({

                "date":
                    requested_date

            })
        )


        result = [
            format_attendance(record)
            for record in records
        ]


        return jsonify({

            "success": True,

            "date":
                requested_date,

            "attendance":
                result

        }), 200


    except Exception as error:

        print(
            "Attendance GET error:",
            error
        )


        return jsonify({

            "success": False,

            "message":
                "Unable to load attendance.",

            "error":
                str(error)

        }), 500


# ============================================================
# SAVE ATTENDANCE
#
# Teacher/Admin only
# ============================================================

@attendance.route(
    "/",
    methods=["POST"],
    strict_slashes=False
)
@jwt_required()
def save_attendance():

    try:

        role = get_user_role()

        logged_in_user_id = (
            get_logged_in_user_id()
        )


        if role not in [
            "teacher",
            "admin"
        ]:

            return jsonify({

                "success": False,

                "message":
                    "Admin or teacher access required."

            }), 403


        data = request.get_json() or {}

        date = data.get(
            "date"
        )

        records = data.get(
            "attendance",
            []
        )


        if not date:

            date = datetime.now().strftime(
                "%Y-%m-%d"
            )


        if not isinstance(
            records,
            list
        ):

            return jsonify({

                "success": False,

                "message":
                    "Attendance must be a list."

            }), 400


        saved_count = 0
        notification_count = 0


        # ====================================================
        # SAVE EACH STUDENT
        # ====================================================

        for item in records:

            student_id = str(
                item.get(
                    "studentId",
                    ""
                )
            ).strip()


            student_name = str(
                item.get(
                    "studentName",
                    ""
                )
            ).strip()


            course = str(
                item.get(
                    "course",
                    "Music Training"
                )
            ).strip()


            status = str(
                item.get(
                    "status",
                    "Absent"
                )
            ).strip()


            attendance_percentage = float(
                item.get(
                    "attendance",
                    0
                )
                or 0
            )


            if not student_id:

                continue


            if status not in [
                "Present",
                "Absent"
            ]:

                status = "Absent"


            # =================================================
            # FIND EXISTING RECORD
            # =================================================

            existing = (
                attendance_collection.find_one({

                    "studentId":
                        student_id,

                    "date":
                        date

                })
            )


            attendance_document = {

                "studentId":
                    student_id,

                "studentName":
                    student_name,

                "course":
                    course,

                "date":
                    date,

                "status":
                    status,

                "attendance":
                    attendance_percentage,

                "updatedAt":
                    datetime.utcnow()

            }


            # =================================================
            # UPDATE
            # =================================================

            if existing:

                attendance_collection.update_one(

                    {
                        "_id":
                            existing["_id"]
                    },

                    {
                        "$set":
                            attendance_document
                    }

                )


            # =================================================
            # INSERT
            # =================================================

            else:

                attendance_document[
                    "createdAt"
                ] = datetime.utcnow()


                attendance_collection.insert_one(
                    attendance_document
                )


            saved_count += 1


            # =================================================
            # 🔔 STUDENT NOTIFICATION
            # =================================================

            notification_created = (
                create_attendance_notification(

                    student_id=
                        student_id,

                    student_name=
                        student_name,

                    date=
                        date,

                    status=
                        status,

                    course=
                        course,

                    created_by=
                        logged_in_user_id

                )
            )


            if notification_created:

                notification_count += 1


        # ====================================================
        # RESPONSE
        # ====================================================

        return jsonify({

            "success": True,

            "message":
                "Attendance saved successfully.",

            "savedCount":
                saved_count,

            "notificationCount":
                notification_count,

            "date":
                date

        }), 200


    except Exception as error:

        print(
            "Attendance POST error:",
            error
        )


        return jsonify({

            "success": False,

            "message":
                "Unable to save attendance.",

            "error":
                str(error)

        }), 500


# ============================================================
# GET STUDENT ATTENDANCE BY URL
#
# /api/attendance/student/<student_id>
# ============================================================

@attendance.route(
    "/student/<student_id>",
    methods=["GET"],
    strict_slashes=False
)
@jwt_required()
def get_student_attendance(
    student_id
):

    try:

        role = get_user_role()

        logged_in_user_id = (
            get_logged_in_user_id()
        )


        # ====================================================
        # STUDENT CAN ONLY VIEW OWN ATTENDANCE
        # ====================================================

        if role == "student":

            if (
                str(student_id)
                !=
                str(logged_in_user_id)
            ):

                return jsonify({

                    "success": False,

                    "message":
                        "You can only view your own attendance."

                }), 403


        # ====================================================
        # TEACHER / ADMIN
        # ====================================================

        elif role not in [
            "teacher",
            "admin"
        ]:

            return jsonify({

                "success": False,

                "message":
                    "Access denied."

            }), 403


        # ====================================================
        # LOAD RECORDS
        # ====================================================

        records = list(
            attendance_collection.find({

                "studentId":
                    str(student_id)

            }).sort(
                "date",
                -1
            )
        )


        result = [
            format_attendance(record)
            for record in records
        ]


        return jsonify({

            "success": True,

            "attendance":
                result

        }), 200


    except Exception as error:

        print(
            "Student attendance GET error:",
            error
        )


        return jsonify({

            "success": False,

            "message":
                "Unable to load student attendance.",

            "error":
                str(error)

        }), 500