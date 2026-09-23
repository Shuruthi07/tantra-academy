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


# =========================================
# LOAD ENVIRONMENT
# =========================================

load_dotenv()


# =========================================
# BLUEPRINT
# =========================================

feedback = Blueprint(
    "feedback",
    __name__
)


# =========================================
# MONGODB
# =========================================

client = MongoClient(
    os.getenv("MONGO_URI")
)

db = client[
    os.getenv("DATABASE_NAME")
]

feedback_collection = db["feedback"]
users_collection = db["users"]
notifications_collection = db["notifications"]


# =========================================
# AUTH HELPERS
# =========================================

def get_user_role():

    claims = get_jwt()

    return str(
        claims.get(
            "role",
            ""
        )
    ).strip().lower()


def get_current_user_id():

    claims = get_jwt()

    return str(
        claims.get(
            "sub",
            ""
        )
    ).strip()


# =========================================
# CREATE NOTIFICATION
# =========================================

def create_notification(
    user_id,
    title,
    message,
    notification_type,
    created_by=None,
    created_by_role=None
):

    try:

        if not user_id:
            return False


        notification = {

            "userId":
                str(user_id),

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
                (
                    str(created_by)
                    if created_by
                    else None
                ),

            "createdByRole":
                (
                    str(created_by_role)
                    if created_by_role
                    else None
                )

        }


        # =====================================
        # DUPLICATE UNREAD NOTIFICATION CHECK
        # =====================================

        existing = (
            notifications_collection.find_one({

                "userId":
                    str(user_id),

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
                "Duplicate notification skipped."
            )

            return False


        result = (
            notifications_collection.insert_one(
                notification
            )
        )


        print(
            "Notification created:",
            result.inserted_id
        )


        return True


    except Exception as error:

        print(
            "Notification creation error:",
            error
        )

        return False


# =========================================
# NOTIFY ALL TEACHERS
# =========================================

def notify_all_teachers(
    title,
    message,
    notification_type,
    created_by=None,
    created_by_role=None
):

    try:

        teachers = users_collection.find({

            "$or": [

                {
                    "role":
                        "teacher"
                },

                {
                    "accountType":
                        "teacher"
                }

            ]

        })


        count = 0


        for teacher in teachers:

            if create_notification(

                user_id=
                    str(
                        teacher["_id"]
                    ),

                title=
                    title,

                message=
                    message,

                notification_type=
                    notification_type,

                created_by=
                    created_by,

                created_by_role=
                    created_by_role

            ):

                count += 1


        print(
            "Teacher notifications:",
            count
        )


        return count


    except Exception as error:

        print(
            "Teacher notification error:",
            error
        )

        return 0


# =========================================
# NOTIFY ALL ADMINS
# =========================================

def notify_all_admins(
    title,
    message,
    notification_type,
    created_by=None,
    created_by_role=None
):

    try:

        admins = users_collection.find({

            "$or": [

                {
                    "role":
                        "admin"
                },

                {
                    "accountType":
                        "admin"
                }

            ]

        })


        count = 0


        for admin_user in admins:

            if create_notification(

                user_id=
                    str(
                        admin_user["_id"]
                    ),

                title=
                    title,

                message=
                    message,

                notification_type=
                    notification_type,

                created_by=
                    created_by,

                created_by_role=
                    created_by_role

            ):

                count += 1


        print(
            "Admin notifications:",
            count
        )


        return count


    except Exception as error:

        print(
            "Admin notification error:",
            error
        )

        return 0


# =========================================
# NOTIFY ONE STUDENT
# =========================================

def notify_student(
    student_id,
    title,
    message,
    notification_type,
    created_by=None,
    created_by_role=None
):

    return create_notification(

        user_id=
            student_id,

        title=
            title,

        message=
            message,

        notification_type=
            notification_type,

        created_by=
            created_by,

        created_by_role=
            created_by_role

    )


# =========================================
# GET FEEDBACK
# =========================================

@feedback.route(
    "/",
    methods=["GET"]
)
@jwt_required()
def get_feedback():

    try:

        role = get_user_role()

        logged_in_user_id = (
            get_current_user_id()
        )

        student_id = request.args.get(
            "studentId"
        )

        query = {}


        # =====================================
        # STUDENT
        # =====================================

        if role == "student":

            query["studentId"] = (
                logged_in_user_id
            )


        # =====================================
        # TEACHER / ADMIN
        # =====================================

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


        feedback_list = list(

            feedback_collection.find(
                query
            ).sort(
                "createdAt",
                -1
            )

        )


        result = []


        for item in feedback_list:

            result.append({

                "id":
                    str(
                        item["_id"]
                    ),

                "studentId":
                    item.get(
                        "studentId",
                        ""
                    ),

                "studentName":
                    item.get(
                        "studentName",
                        ""
                    ),

                "rating":
                    item.get(
                        "rating",
                        0
                    ),

                "message":
                    item.get(
                        "message",
                        ""
                    ),

                "date":
                    item.get(
                        "date",
                        ""
                    ),

                "response":
                    item.get(
                        "response",
                        "Waiting for academy response..."
                    ),

                "status":
                    item.get(
                        "status",
                        "Pending"
                    ),

                "createdAt":
                    item.get(
                        "createdAt"
                    ),

                "updatedAt":
                    item.get(
                        "updatedAt"
                    )

            })


        return jsonify({

            "success":
                True,

            "feedback":
                result

        }), 200


    except Exception as error:

        print(
            "Feedback GET error:",
            error
        )


        return jsonify({

            "success":
                False,

            "message":
                "Unable to load feedback",

            "error":
                str(error)

        }), 500


# =========================================
# CREATE FEEDBACK
# =========================================

@feedback.route(
    "/",
    methods=["POST"]
)
@jwt_required()
def create_feedback():

    try:

        role = get_user_role()

        logged_in_user_id = (
            get_current_user_id()
        )


        # =====================================
        # STUDENT ONLY
        # =====================================

        if role != "student":

            return jsonify({

                "success":
                    False,

                "message":
                    "Student access required"

            }), 403


        data = (
            request.get_json()
            or {}
        )


        # =====================================
        # STUDENT ID FROM JWT
        # =====================================

        student_id = (
            logged_in_user_id
        )


        # =====================================
        # GET REAL STUDENT NAME
        # =====================================

        student = None


        try:

            student = (
                users_collection.find_one({

                    "_id":
                        ObjectId(
                            student_id
                        )

                })
            )

        except Exception:

            student = None


        if student:

            student_name = str(

                student.get(
                    "name",
                    data.get(
                        "studentName",
                        "Student"
                    )
                )

            ).strip()

        else:

            student_name = str(

                data.get(
                    "studentName",
                    "Student"
                )

            ).strip()


        rating = int(

            data.get(
                "rating",
                0
            )

        )


        message = str(

            data.get(
                "message",
                ""
            )

        ).strip()


        # =====================================
        # VALIDATION
        # =====================================

        if not student_id:

            return jsonify({

                "success":
                    False,

                "message":
                    "Student ID is required"

            }), 400


        if rating < 1 or rating > 5:

            return jsonify({

                "success":
                    False,

                "message":
                    "Rating must be between 1 and 5"

            }), 400


        if not message:

            return jsonify({

                "success":
                    False,

                "message":
                    "Feedback message is required"

            }), 400


        current_date = (
            datetime.now().strftime(
                "%d %b %Y"
            )
        )


        # =====================================
        # FEEDBACK DOCUMENT
        # =====================================

        feedback_document = {

            "studentId":
                student_id,

            "studentName":
                student_name,

            "rating":
                rating,

            "message":
                message,

            "date":
                current_date,

            "response":
                "Waiting for academy response...",

            "status":
                "Pending",

            "createdAt":
                datetime.utcnow(),

            "updatedAt":
                datetime.utcnow()

        }


        # =====================================
        # SAVE FEEDBACK
        # =====================================

        result = (
            feedback_collection.insert_one(
                feedback_document
            )
        )


        # =====================================
        # NOTIFY TEACHERS
        # =====================================

        teacher_notification_count = (
            notify_all_teachers(

                title=
                    "💬 New Feedback",

                message=
                    (
                        f"{student_name} "
                        f"submitted new feedback."
                    ),

                notification_type=
                    "feedback",

                created_by=
                    student_id,

                created_by_role=
                    "student"

            )
        )


        # =====================================
        # NOTIFY ADMINS
        # =====================================

        admin_notification_count = (
            notify_all_admins(

                title=
                    "💬 New Feedback",

                message=
                    (
                        f"{student_name} "
                        f"submitted new feedback."
                    ),

                notification_type=
                    "feedback",

                created_by=
                    student_id,

                created_by_role=
                    "student"

            )
        )


        print(
            "Feedback notifications sent."
        )


        return jsonify({

            "success":
                True,

            "message":
                "Feedback submitted successfully",

            "feedbackId":
                str(
                    result.inserted_id
                ),

            "teacherNotifications":
                teacher_notification_count,

            "adminNotifications":
                admin_notification_count

        }), 201


    except ValueError:

        return jsonify({

            "success":
                False,

            "message":
                "Rating must be a number"

        }), 400


    except Exception as error:

        print(
            "Feedback POST error:",
            error
        )


        return jsonify({

            "success":
                False,

            "message":
                "Unable to submit feedback",

            "error":
                str(error)

        }), 500


# =========================================
# TEACHER / ADMIN RESPONSE
# =========================================

@feedback.route(
    "/<feedback_id>/response",
    methods=["PUT"]
)
@jwt_required()
def respond_to_feedback(
    feedback_id
):

    try:

        role = get_user_role()

        current_user_id = (
            get_current_user_id()
        )


        # =====================================
        # TEACHER / ADMIN ONLY
        # =====================================

        if role not in [
            "teacher",
            "admin"
        ]:

            return jsonify({

                "success":
                    False,

                "message":
                    "Teacher or admin access required"

            }), 403


        data = (
            request.get_json()
            or {}
        )


        response = str(

            data.get(
                "response",
                ""
            )

        ).strip()


        if not response:

            return jsonify({

                "success":
                    False,

                "message":
                    "Response is required"

            }), 400


        # =====================================
        # OBJECT ID
        # =====================================

        try:

            object_id = ObjectId(
                feedback_id
            )

        except Exception:

            return jsonify({

                "success":
                    False,

                "message":
                    "Invalid feedback ID"

            }), 400


        # =====================================
        # FIND FEEDBACK
        # =====================================

        feedback_item = (
            feedback_collection.find_one({

                "_id":
                    object_id

            })
        )


        if not feedback_item:

            return jsonify({

                "success":
                    False,

                "message":
                    "Feedback not found"

            }), 404


        # =====================================
        # STUDENT INFORMATION
        # =====================================

        student_id = str(

            feedback_item.get(
                "studentId",
                ""
            )

        ).strip()


        student_name = str(

            feedback_item.get(
                "studentName",
                "Student"
            )

        ).strip()


        # =====================================
        # UPDATE FEEDBACK
        # =====================================

        result = (
            feedback_collection.update_one(

                {
                    "_id":
                        object_id
                },

                {
                    "$set": {

                        "response":
                            response,

                        "status":
                            "Responded",

                        "updatedAt":
                            datetime.utcnow()

                    }

                }

            )
        )


        if result.matched_count == 0:

            return jsonify({

                "success":
                    False,

                "message":
                    "Feedback not found"

            }), 404


        # =====================================
        # NOTIFY STUDENT
        # =====================================

        student_notification_created = 0


        if student_id:

            if notify_student(

                student_id=
                    student_id,

                title=
                    "💬 Feedback Response",

                message=
                    (
                        "Your feedback has "
                        "received a response."
                    ),

                notification_type=
                    "feedback",

                created_by=
                    current_user_id,

                created_by_role=
                    role

            ):

                student_notification_created = 1


        # =====================================
        # NOTIFY ADMINS WHEN TEACHER RESPONDS
        # =====================================

        admin_notification_count = 0


        if role == "teacher":

            admin_notification_count = (
                notify_all_admins(

                    title=
                        "💬 Feedback Responded",

                    message=
                        (
                            f"Teacher responded "
                            f"to {student_name}'s "
                            f"feedback."
                        ),

                    notification_type=
                        "feedback",

                    created_by=
                        current_user_id,

                    created_by_role=
                        role

                )
            )


        print(
            "Feedback response notifications sent."
        )


        return jsonify({

            "success":
                True,

            "message":
                "Feedback response saved successfully",

            "studentNotification":
                student_notification_created,

            "adminNotifications":
                admin_notification_count

        }), 200


    except Exception as error:

        print(
            "Feedback response error:",
            error
        )


        return jsonify({

            "success":
                False,

            "message":
                "Unable to save feedback response",

            "error":
                str(error)

        }), 500


# =========================================
# DELETE FEEDBACK
# =========================================

@feedback.route(
    "/<feedback_id>",
    methods=["DELETE"]
)
@jwt_required()
def delete_feedback(
    feedback_id
):

    try:

        role = get_user_role()


        # =====================================
        # ADMIN ONLY
        # =====================================

        if role != "admin":

            return jsonify({

                "success":
                    False,

                "message":
                    "Admin access required"

            }), 403


        try:

            object_id = ObjectId(
                feedback_id
            )

        except Exception:

            return jsonify({

                "success":
                    False,

                "message":
                    "Invalid feedback ID"

            }), 400


        result = (
            feedback_collection.delete_one({

                "_id":
                    object_id

            })
        )


        if result.deleted_count == 0:

            return jsonify({

                "success":
                    False,

                "message":
                    "Feedback not found"

            }), 404


        return jsonify({

            "success":
                True,

            "message":
                "Feedback deleted successfully"

        }), 200


    except Exception as error:

        print(
            "Feedback DELETE error:",
            error
        )


        return jsonify({

            "success":
                False,

            "message":
                "Unable to delete feedback",

            "error":
                str(error)

        }), 500