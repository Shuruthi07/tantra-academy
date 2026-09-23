from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
from flask_jwt_extended import jwt_required, get_jwt
import os
from datetime import datetime


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()


# ============================================================
# BLUEPRINT
# ============================================================

schedule = Blueprint("schedule", __name__)


# ============================================================
# MONGODB
# ============================================================

mongo_uri = os.getenv(
    "MONGO_URI",
    "mongodb://127.0.0.1:27017/"
)

database_name = os.getenv(
    "DATABASE_NAME",
    "tantra_academy"
)

client = MongoClient(mongo_uri)

db = client[database_name]

schedule_collection = db["schedule"]

users_collection = db["users"]

notifications_collection = db["notifications"]


# ============================================================
# HELPERS
# ============================================================

def get_user_role():

    try:

        claims = get_jwt()

        role = (
            claims.get("role")
            or claims.get("accountType")
            or ""
        )

        return str(role).lower()

    except Exception:

        return ""


def get_current_user_id():

    try:

        claims = get_jwt()

        return str(
            claims.get("sub", "")
        )

    except Exception:

        return ""


def teacher_or_admin_only():

    role = get_user_role()

    if role not in [
        "teacher",
        "admin"
    ]:

        return jsonify({
            "success": False,
            "message":
                "Teacher or admin access required."
        }), 403

    return None


def format_schedule(item):

    return {

        "id": str(
            item.get("_id", "")
        ),

        "date": item.get(
            "date",
            ""
        ),

        "day": item.get(
            "day",
            ""
        ),

        "month": item.get(
            "month",
            ""
        ),

        "time": item.get(
            "time",
            ""
        ),

        "title": item.get(
            "title",
            "Class"
        ),

        "course": item.get(
            "course",
            ""
        ),

        "room": item.get(
            "room",
            ""
        ),

        "studentId": (
            str(item.get("studentId", ""))
            if item.get("studentId")
            else ""
        ),

        "studentName": item.get(
            "studentName",
            ""
        ),

        "teacherId": (
            str(item.get("teacherId", ""))
            if item.get("teacherId")
            else ""
        ),

        "teacherName": item.get(
            "teacherName",
            ""
        ),

        "createdAt": item.get(
            "createdAt"
        ),

        "updatedAt": item.get(
            "updatedAt"
        )
    }


def get_student_name(student_id):

    if not student_id:
        return ""

    try:

        student = users_collection.find_one({

            "_id": ObjectId(
                str(student_id)
            ),

            "$or": [

                {
                    "role": "student"
                },

                {
                    "accountType": "student"
                }

            ]

        })

        if student:

            return student.get(
                "name",
                ""
            )

    except Exception:

        pass

    return ""


def get_teacher_name(teacher_id):

    if not teacher_id:
        return ""

    try:

        teacher = users_collection.find_one({

            "_id": ObjectId(
                str(teacher_id)
            ),

            "$or": [

                {
                    "role": "teacher"
                },

                {
                    "accountType": "teacher"
                }

            ]

        })

        if teacher:

            return teacher.get(
                "name",
                ""
            )

    except Exception:

        pass

    return ""


# ============================================================
# CREATE NOTIFICATION
# ============================================================

def create_schedule_notification(
    student_id,
    title,
    message,
    created_by,
    notification_type="schedule"
):

    try:

        if not student_id:
            return False


        # ----------------------------------------------------
        # PREVENT DUPLICATE UNREAD NOTIFICATIONS
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
                    notification_type,

                "read":
                    False

            })
        )


        if existing:

            print(
                "Duplicate schedule notification skipped."
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
                notification_type,

            "read":
                False,

            "createdAt":
                datetime.utcnow(),

            "createdBy":
                str(created_by),

            "createdByRole":
                get_user_role()

        }


        result = (
            notifications_collection.insert_one(
                notification
            )
        )


        print(
            "Schedule notification created:",
            result.inserted_id
        )


        return True


    except Exception as error:

        print(
            "Schedule notification error:",
            error
        )

        return False


# ============================================================
# NOTIFY ONE STUDENT
# ============================================================

def notify_one_student(
    student_id,
    title,
    message,
    created_by
):

    if not student_id:
        return 0


    if create_schedule_notification(

        student_id=
            student_id,

        title=
            title,

        message=
            message,

        created_by=
            created_by

    ):

        return 1


    return 0


# ============================================================
# NOTIFY ALL STUDENTS
# ============================================================

def notify_all_students(
    title,
    message,
    created_by
):

    try:

        students = users_collection.find({

            "$or": [

                {
                    "role":
                        "student"
                },

                {
                    "accountType":
                        "student"
                }

            ]

        })


        count = 0


        for student in students:

            if create_schedule_notification(

                student_id=
                    str(
                        student["_id"]
                    ),

                title=
                    title,

                message=
                    message,

                created_by=
                    created_by

            ):

                count += 1


        return count


    except Exception as error:

        print(
            "Notify all students error:",
            error
        )

        return 0


# ============================================================
# BUILD SCHEDULE MESSAGE
# ============================================================

def build_schedule_message(
    schedule_data,
    action="created"
):

    title = schedule_data.get(
        "title",
        "Class"
    )

    course = schedule_data.get(
        "course",
        ""
    )

    date = schedule_data.get(
        "date",
        ""
    )

    time = schedule_data.get(
        "time",
        ""
    )

    room = schedule_data.get(
        "room",
        ""
    )


    if action == "updated":

        notification_title = (
            "📅 Schedule Updated"
        )

        message = (
            f'Your class "{title}" '
            f'has been updated. '
            f'{date} at {time}'
        )

    else:

        notification_title = (
            "📅 New Class Scheduled"
        )

        message = (
            f'Your class "{title}" '
            f'has been scheduled. '
            f'{date} at {time}'
        )


    if course:

        message += (
            f" | Course: {course}"
        )


    if room:

        message += (
            f" | Room: {room}"
        )


    return (
        notification_title,
        message
    )


# ============================================================
# SEND SCHEDULE NOTIFICATION
# ============================================================

def send_schedule_notification(
    schedule_data,
    created_by,
    action="created"
):

    notification_title, message = (
        build_schedule_message(
            schedule_data,
            action
        )
    )


    student_id = str(
        schedule_data.get(
            "studentId",
            ""
        )
    ).strip()


    # --------------------------------------------------------
    # SPECIFIC STUDENT
    # --------------------------------------------------------

    if student_id:

        return notify_one_student(

            student_id=
                student_id,

            title=
                notification_title,

            message=
                message,

            created_by=
                created_by

        )


    # --------------------------------------------------------
    # COMMON CLASS
    # --------------------------------------------------------

    return notify_all_students(

        title=
            notification_title,

        message=
            message,

        created_by=
            created_by

    )


# ============================================================
# GET SCHEDULE
#
# ADMIN / TEACHER:
#   Gets all schedules
#
# STUDENT:
#   Gets common academy classes +
#   classes assigned to logged-in student
#
# Optional:
#   ?studentId=...
# ============================================================

@schedule.route(
    "/",
    methods=["GET"],
    strict_slashes=False
)
@jwt_required()
def get_schedule():

    try:

        role = get_user_role()

        requested_student_id = (
            request.args.get(
                "studentId",
                ""
            ).strip()
        )


        # ====================================================
        # ADMIN / TEACHER
        # ====================================================

        if role in [
            "admin",
            "teacher"
        ]:

            if requested_student_id:

                query = {
                    "$or": [

                        {
                            "studentId":
                                requested_student_id
                        },

                        {
                            "studentId": {
                                "$exists": False
                            }
                        },

                        {
                            "studentId": ""
                        },

                        {
                            "studentId": None
                        }
                    ]
                }

            else:

                query = {}


        # ====================================================
        # STUDENT
        # ====================================================

        elif role == "student":

            logged_in_student_id = (
                get_current_user_id()
            )

            if requested_student_id:

                if (
                    str(requested_student_id)
                    !=
                    str(logged_in_student_id)
                ):

                    return jsonify({

                        "success": False,

                        "message":
                            "You can only view your own schedule."

                    }), 403

                student_id = (
                    requested_student_id
                )

            else:

                student_id = (
                    logged_in_student_id
                )


            query = {
                "$or": [

                    {
                        "studentId":
                            student_id
                    },

                    {
                        "studentId": {
                            "$exists": False
                        }
                    },

                    {
                        "studentId": ""
                    },

                    {
                        "studentId": None
                    }
                ]
            }


        # ====================================================
        # UNKNOWN ROLE
        # ====================================================

        else:

            return jsonify({

                "success": False,

                "message":
                    "Access denied."

            }), 403


        # ====================================================
        # LOAD SCHEDULE
        # ====================================================

        records = list(
            schedule_collection.find(
                query
            ).sort(
                [
                    (
                        "date",
                        1
                    ),
                    (
                        "time",
                        1
                    )
                ]
            )
        )


        result = [
            format_schedule(item)
            for item in records
        ]


        return jsonify({

            "success": True,

            "schedule":
                result

        }), 200


    except Exception as error:

        print(
            "Schedule GET error:",
            error
        )

        return jsonify({

            "success": False,

            "message":
                "Unable to load schedule.",

            "error":
                str(error)

        }), 500


# ============================================================
# ADD SCHEDULE
#
# TEACHER + ADMIN
# ============================================================

@schedule.route(
    "/",
    methods=["POST"],
    strict_slashes=False
)
@jwt_required()
def add_schedule():

    try:

        access_error = (
            teacher_or_admin_only()
        )

        if access_error:

            return access_error


        logged_in_user_id = (
            get_current_user_id()
        )


        data = (
            request.get_json(
                silent=True
            ) or {}
        )


        # ====================================================
        # FIELDS
        # ====================================================

        date = str(
            data.get(
                "date",
                ""
            )
        ).strip()

        day = str(
            data.get(
                "day",
                ""
            )
        ).strip()

        month = str(
            data.get(
                "month",
                ""
            )
        ).strip()

        time = str(
            data.get(
                "time",
                ""
            )
        ).strip()

        title = str(
            data.get(
                "title",
                ""
            )
        ).strip()

        course = str(
            data.get(
                "course",
                ""
            )
        ).strip()

        room = str(
            data.get(
                "room",
                ""
            )
        ).strip()

        student_id = str(
            data.get(
                "studentId",
                ""
            )
        ).strip()

        teacher_id = str(
            data.get(
                "teacherId",
                ""
            )
        ).strip()


        # ====================================================
        # VALIDATION
        # ====================================================

        if not date:

            return jsonify({

                "success": False,

                "message":
                    "Date is required."

            }), 400


        if not time:

            return jsonify({

                "success": False,

                "message":
                    "Time is required."

            }), 400


        if not title:

            return jsonify({

                "success": False,

                "message":
                    "Class title is required."

            }), 400


        if not course:

            return jsonify({

                "success": False,

                "message":
                    "Course is required."

            }), 400


        if not room:

            return jsonify({

                "success": False,

                "message":
                    "Room is required."

            }), 400


        # ====================================================
        # AUTOMATIC DATE DISPLAY
        # ====================================================

        if not day or not month:

            try:

                date_object = datetime.strptime(
                    date,
                    "%Y-%m-%d"
                )


                if not day:

                    day = str(
                        date_object.day
                    ).zfill(2)


                if not month:

                    month = (
                        date_object
                        .strftime("%b")
                        .upper()
                    )

            except Exception:

                pass


        # ====================================================
        # STUDENT NAME
        # ====================================================

        student_name = str(
            data.get(
                "studentName",
                ""
            )
        ).strip()


        if (
            student_id
            and
            not student_name
        ):

            student_name = (
                get_student_name(
                    student_id
                )
            )


        # ====================================================
        # TEACHER NAME
        # ====================================================

        teacher_name = str(
            data.get(
                "teacherName",
                ""
            )
        ).strip()


        if not teacher_id:

            # If teacher doesn't provide teacherId,
            # use the authenticated teacher.

            if get_user_role() == "teacher":

                teacher_id = (
                    logged_in_user_id
                )


        if (
            teacher_id
            and
            not teacher_name
        ):

            teacher_name = (
                get_teacher_name(
                    teacher_id
                )
            )


        # ====================================================
        # CREATE DOCUMENT
        # ====================================================

        now = datetime.utcnow()


        schedule_document = {

            "date":
                date,

            "day":
                day,

            "month":
                month,

            "time":
                time,

            "title":
                title,

            "course":
                course,

            "room":
                room,

            "studentId":
                student_id,

            "studentName":
                student_name,

            "teacherId":
                teacher_id,

            "teacherName":
                teacher_name,

            "createdAt":
                now,

            "updatedAt":
                now

        }


        result = (
            schedule_collection.insert_one(
                schedule_document
            )
        )


        # ====================================================
        # 🔔 STUDENT NOTIFICATION
        # ====================================================

        notification_count = (
            send_schedule_notification(

                schedule_data=
                    schedule_document,

                created_by=
                    logged_in_user_id,

                action=
                    "created"

            )
        )


        return jsonify({

            "success":
                True,

            "message":
                "Class scheduled successfully.",

            "scheduleId":
                str(
                    result.inserted_id
                ),

            "notificationCount":
                notification_count

        }), 201


    except Exception as error:

        print(
            "Schedule POST error:",
            error
        )

        return jsonify({

            "success": False,

            "message":
                "Unable to create schedule.",

            "error":
                str(error)

        }), 500


# ============================================================
# UPDATE SCHEDULE
#
# TEACHER + ADMIN
# ============================================================

@schedule.route(
    "/<schedule_id>",
    methods=["PUT"],
    strict_slashes=False
)
@jwt_required()
def update_schedule(schedule_id):

    try:

        access_error = (
            teacher_or_admin_only()
        )

        if access_error:

            return access_error


        logged_in_user_id = (
            get_current_user_id()
        )


        # ====================================================
        # OBJECT ID
        # ====================================================

        try:

            schedule_object_id = (
                ObjectId(schedule_id)
            )

        except Exception:

            return jsonify({

                "success": False,

                "message":
                    "Invalid schedule ID."

            }), 400


        # ====================================================
        # FIND OLD SCHEDULE
        # ====================================================

        old_schedule = (
            schedule_collection.find_one({

                "_id":
                    schedule_object_id

            })
        )


        if not old_schedule:

            return jsonify({

                "success": False,

                "message":
                    "Schedule not found."

            }), 404


        # ====================================================
        # DATA
        # ====================================================

        data = (
            request.get_json(
                silent=True
            ) or {}
        )


        date = str(
            data.get(
                "date",
                ""
            )
        ).strip()

        day = str(
            data.get(
                "day",
                ""
            )
        ).strip()

        month = str(
            data.get(
                "month",
                ""
            )
        ).strip()

        time = str(
            data.get(
                "time",
                ""
            )
        ).strip()

        title = str(
            data.get(
                "title",
                ""
            )
        ).strip()

        course = str(
            data.get(
                "course",
                ""
            )
        ).strip()

        room = str(
            data.get(
                "room",
                ""
            )
        ).strip()

        student_id = str(
            data.get(
                "studentId",
                ""
            )
        ).strip()

        teacher_id = str(
            data.get(
                "teacherId",
                ""
            )
        ).strip()

        student_name = str(
            data.get(
                "studentName",
                ""
            )
        ).strip()

        teacher_name = str(
            data.get(
                "teacherName",
                ""
            )
        ).strip()


        # ====================================================
        # VALIDATION
        # ====================================================

        if not date:

            return jsonify({

                "success": False,

                "message":
                    "Date is required."

            }), 400


        if not time:

            return jsonify({

                "success": False,

                "message":
                    "Time is required."

            }), 400


        if not title:

            return jsonify({

                "success": False,

                "message":
                    "Class title is required."

            }), 400


        if not course:

            return jsonify({

                "success": False,

                "message":
                    "Course is required."

            }), 400


        if not room:

            return jsonify({

                "success": False,

                "message":
                    "Room is required."

            }), 400


        # ====================================================
        # DATE LABELS
        # ====================================================

        if not day or not month:

            try:

                date_object = datetime.strptime(
                    date,
                    "%Y-%m-%d"
                )


                if not day:

                    day = str(
                        date_object.day
                    ).zfill(2)


                if not month:

                    month = (
                        date_object
                        .strftime("%b")
                        .upper()
                    )

            except Exception:

                pass


        # ====================================================
        # LOOK UP NAMES
        # ====================================================

        if (
            student_id
            and
            not student_name
        ):

            student_name = (
                get_student_name(
                    student_id
                )
            )


        if not teacher_id:

            if get_user_role() == "teacher":

                teacher_id = (
                    logged_in_user_id
                )


        if (
            teacher_id
            and
            not teacher_name
        ):

            teacher_name = (
                get_teacher_name(
                    teacher_id
                )
            )


        # ====================================================
        # UPDATE
        # ====================================================

        update_data = {

            "date":
                date,

            "day":
                day,

            "month":
                month,

            "time":
                time,

            "title":
                title,

            "course":
                course,

            "room":
                room,

            "studentId":
                student_id,

            "studentName":
                student_name,

            "teacherId":
                teacher_id,

            "teacherName":
                teacher_name,

            "updatedAt":
                datetime.utcnow()

        }


        result = (
            schedule_collection.update_one(

                {
                    "_id":
                        schedule_object_id
                },

                {
                    "$set":
                        update_data
                }

            )
        )


        if result.matched_count == 0:

            return jsonify({

                "success": False,

                "message":
                    "Schedule not found."

            }), 404


        # ====================================================
        # 🔔 STUDENT NOTIFICATION
        # ====================================================

        notification_count = (
            send_schedule_notification(

                schedule_data=
                    update_data,

                created_by=
                    logged_in_user_id,

                action=
                    "updated"

            )
        )


        return jsonify({

            "success":
                True,

            "message":
                "Schedule updated successfully.",

            "notificationCount":
                notification_count

        }), 200


    except Exception as error:

        print(
            "Schedule PUT error:",
            error
        )

        return jsonify({

            "success": False,

            "message":
                "Unable to update schedule.",

            "error":
                str(error)

        }), 500


# ============================================================
# DELETE SCHEDULE
#
# TEACHER + ADMIN
# ============================================================

@schedule.route(
    "/<schedule_id>",
    methods=["DELETE"],
    strict_slashes=False
)
@jwt_required()
def delete_schedule(schedule_id):

    try:

        access_error = (
            teacher_or_admin_only()
        )

        if access_error:

            return access_error


        # ====================================================
        # OBJECT ID
        # ====================================================

        try:

            schedule_object_id = (
                ObjectId(schedule_id)
            )

        except Exception:

            return jsonify({

                "success": False,

                "message":
                    "Invalid schedule ID."

            }), 400


        # ====================================================
        # DELETE
        # ====================================================

        result = (
            schedule_collection.delete_one(
                {
                    "_id":
                        schedule_object_id
                }
            )
        )


        if result.deleted_count == 0:

            return jsonify({

                "success": False,

                "message":
                    "Schedule not found."

            }), 404


        return jsonify({

            "success":
                True,

            "message":
                "Schedule deleted successfully."

        }), 200


    except Exception as error:

        print(
            "Schedule DELETE error:",
            error
        )

        return jsonify({

            "success": False,

            "message":
                "Unable to delete schedule.",

            "error":
                str(error)

        }), 500