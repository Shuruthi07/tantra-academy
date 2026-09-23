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


# ==========================================
# LOAD ENVIRONMENT
# ==========================================

load_dotenv()


# ==========================================
# BLUEPRINT
# ==========================================

task_progress = Blueprint(
    "task_progress",
    __name__
)


# ==========================================
# MONGODB
# ==========================================

client = MongoClient(
    os.getenv("MONGO_URI")
)

db = client[
    os.getenv("DATABASE_NAME")
]


task_progress_collection = db[
    "taskProgress"
]

tasks_collection = db[
    "tasks"
]

users_collection = db[
    "users"
]

notifications_collection = db[
    "notifications"
]


# ==========================================
# HELPER FUNCTIONS
# ==========================================

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


# ==========================================
# CREATE NOTIFICATION
# ==========================================

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


        # Prevent duplicate unread notification
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
                "Duplicate task notification skipped."
            )

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


        result = (
            notifications_collection.insert_one(
                notification
            )
        )


        print(
            "Task notification created:",
            result.inserted_id
        )

        return True


    except Exception as error:

        print(
            "Task notification error:",
            error
        )

        return False


# ==========================================
# GET TEACHERS
# ==========================================

def get_teacher_ids():

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


        return [

            str(
                teacher["_id"]
            )

            for teacher in teachers

        ]


    except Exception as error:

        print(
            "Get teachers error:",
            error
        )

        return []


# ==========================================
# NOTIFY TEACHERS
# ==========================================

def notify_teachers(
    title,
    message,
    notification_type,
    created_by=None,
    created_by_role=None
):

    teacher_ids = get_teacher_ids()

    count = 0


    for teacher_id in teacher_ids:

        if create_notification(

            user_id=
                teacher_id,

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
        "Teacher task notifications:",
        count
    )

    return count


# ==========================================
# GET ADMINS
# ==========================================

def get_admin_ids():

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


        return [

            str(
                admin["_id"]
            )

            for admin in admins

        ]


    except Exception as error:

        print(
            "Get admins error:",
            error
        )

        return []


# ==========================================
# NOTIFY ADMINS
# ==========================================

def notify_admins(
    title,
    message,
    notification_type,
    created_by=None,
    created_by_role=None
):

    admin_ids = get_admin_ids()

    count = 0


    for admin_id in admin_ids:

        if create_notification(

            user_id=
                admin_id,

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
        "Admin task notifications:",
        count
    )

    return count


# =========================================================
# GET TASK PROGRESS
# =========================================================

@task_progress.route(
    "/",
    methods=["GET"]
)
@jwt_required()
def get_task_progress():

    try:

        role = get_user_role()

        logged_in_user_id = (
            get_current_user_id()
        )

        student_id = request.args.get(
            "studentId"
        )

        task_id = request.args.get(
            "taskId"
        )

        query = {}


        # ---------------------------------------------
        # STUDENT ACCESS
        # ---------------------------------------------

        if role == "student":

            query["studentId"] = (
                logged_in_user_id
            )


        # ---------------------------------------------
        # TEACHER / ADMIN ACCESS
        # ---------------------------------------------

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


        if task_id:

            query["taskId"] = str(
                task_id
            )


        progress_list = list(

            task_progress_collection
            .find(query)
            .sort(
                "updatedAt",
                -1
            )

        )


        result = []


        for progress in progress_list:

            result.append({

                "id":
                    str(
                        progress["_id"]
                    ),

                "taskId":
                    progress.get(
                        "taskId"
                    ),

                "studentId":
                    progress.get(
                        "studentId"
                    ),

                "studentName":
                    progress.get(
                        "studentName",
                        "Student"
                    ),

                "progress":
                    progress.get(
                        "progress",
                        0
                    ),

                "status":
                    progress.get(
                        "status",
                        "Pending"
                    ),

                "completedAt":
                    progress.get(
                        "completedAt"
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
            "Task progress GET error:",
            error
        )

        return jsonify({

            "success":
                False,

            "message":
                "Unable to load task progress",

            "error":
                str(error)

        }), 500


# =========================================================
# COMPLETE TASK
# =========================================================

@task_progress.route(
    "/complete",
    methods=["POST"]
)
@jwt_required()
def complete_task():

    try:

        role = get_user_role()

        logged_in_user_id = (
            get_current_user_id()
        )


        # =========================================
        # STUDENT ONLY
        # =========================================

        if role != "student":

            return jsonify({

                "success":
                    False,

                "message":
                    "Student access required"

            }), 403


        data = request.get_json() or {}


        task_id = data.get(
            "taskId"
        )


        # IMPORTANT:
        # Use authenticated JWT student ID.
        student_id = (
            logged_in_user_id
        )


        student_name = data.get(
            "studentName",
            "Student"
        )


        if not task_id:

            return jsonify({

                "success":
                    False,

                "message":
                    "Task ID is required"

            }), 400


        if not student_id:

            return jsonify({

                "success":
                    False,

                "message":
                    "Student ID is required"

            }), 400


        # =========================================
        # CHECK TASK
        # =========================================

        try:

            task = tasks_collection.find_one({

                "_id":
                    ObjectId(task_id)

            })

        except Exception:

            return jsonify({

                "success":
                    False,

                "message":
                    "Invalid task ID"

            }), 400


        if not task:

            return jsonify({

                "success":
                    False,

                "message":
                    "Task not found"

            }), 404


        # =========================================
        # CHECK STUDENT
        # =========================================

        try:

            student = users_collection.find_one({

                "_id":
                    ObjectId(student_id),

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


        # =========================================
        # FIND EXISTING PROGRESS
        # =========================================

        existing = (
            task_progress_collection.find_one({

                "taskId":
                    task_id,

                "studentId":
                    student_id

            })
        )


        completed_time = datetime.utcnow()


        # =========================================
        # STUDENT NAME
        # =========================================

        final_student_name = (
            student.get(
                "name",
                student_name
            )
        )


        # =========================================
        # TASK NAME
        # =========================================

        task_title = str(

            task.get(
                "title",
                task.get(
                    "task",
                    "Task"
                )
            )

        )


        # =========================================
        # PROGRESS DATA
        # =========================================

        progress_data = {

            "taskId":
                task_id,

            "studentId":
                student_id,

            "studentName":
                final_student_name,

            "progress":
                100,

            "status":
                "Completed",

            "completedAt":
                completed_time,

            "updatedAt":
                completed_time

        }


        # =========================================
        # UPDATE EXISTING
        # =========================================

        if existing:

            task_progress_collection.update_one(

                {
                    "_id":
                        existing["_id"]
                },

                {
                    "$set":
                        progress_data
                }

            )


        # =========================================
        # CREATE NEW
        # =========================================

        else:

            task_progress_collection.insert_one(
                progress_data
            )


        # =========================================
        # 🔔 TEACHER NOTIFICATION
        # =========================================

        notify_teachers(

            title=
                "✅ Task Completed",

            message=
                f"{final_student_name} completed the task '{task_title}'.",

            notification_type=
                "task",

            created_by=
                student_id,

            created_by_role=
                "student"

        )


        # =========================================
        # 🔔 ADMIN NOTIFICATION
        # =========================================

        notify_admins(

            title=
                "✅ Task Completed",

            message=
                f"{final_student_name} completed the task '{task_title}'.",

            notification_type=
                "task",

            created_by=
                student_id,

            created_by_role=
                "student"

        )


        print(
            "Task completion notifications sent."
        )


        # =========================================
        # RESPONSE
        # =========================================

        return jsonify({

            "success":
                True,

            "message":
                "Task completed successfully"

        }), 200


    except Exception as error:

        print(
            "Task completion error:",
            error
        )

        return jsonify({

            "success":
                False,

            "message":
                "Unable to complete task",

            "error":
                str(error)

        }), 500