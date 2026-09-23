from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt
import os


load_dotenv()


admin = Blueprint(
    "admin",
    __name__
)


# =========================================================
# MONGODB
# =========================================================

client = MongoClient(
    os.getenv("MONGO_URI")
)

db = client[
    os.getenv("DATABASE_NAME")
]

users_collection = db["users"]
songs_collection = db["songs"]
tasks_collection = db["tasks"]
notifications_collection = db["notifications"]


# =========================================================
# AUTH HELPERS
# =========================================================

def get_user_role():

    claims = get_jwt()

    return str(
        claims.get(
            "role",
            ""
        )
    ).strip().lower()


def get_logged_in_user_id():

    claims = get_jwt()

    return str(
        claims.get(
            "sub",
            ""
        )
    ).strip()


def check_teacher_or_admin_access():

    return get_user_role() in [
        "teacher",
        "admin"
    ]


def check_admin_access():

    return get_user_role() == "admin"


# =========================================================
# DIFFICULTY
# =========================================================

def calculate_difficulty(song):

    difficulty = song.get(
        "difficulty"
    )

    if difficulty:

        return str(
            difficulty
        )


    title = str(
        song.get(
            "title",
            ""
        )
    ).lower()


    instructions = str(
        song.get(
            "instructions",
            ""
        )
    ).lower()


    text = (
        title +
        " " +
        instructions
    )


    if any(
        word in text
        for word in [
            "beginner",
            "easy",
            "basic"
        ]
    ):

        return "Easy"


    if any(
        word in text
        for word in [
            "advanced",
            "hard",
            "difficult"
        ]
    ):

        return "Hard"


    return "Medium"


# =========================================================
# FORMAT USER
# =========================================================

def format_user(user):

    return {

        "id":
            str(
                user["_id"]
            ),

        "name":
            user.get(
                "name",
                ""
            ),

        "email":
            user.get(
                "email",
                ""
            ),

        "phone":
            user.get(
                "phone",
                ""
            ),

        "role":
            user.get(
                "role",
                user.get(
                    "accountType",
                    ""
                )
            ),

        "registered":
            user.get(
                "createdAt"
            )

    }


# =========================================================
# STUDENT NOTIFICATION
# =========================================================

def create_student_notification(
    student_id,
    title,
    message,
    notification_type
):

    try:

        if not student_id:

            return 0


        notification = {

            "userId":
                str(
                    student_id
                ),

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
                get_logged_in_user_id(),

            "createdByRole":
                get_user_role()

        }


        result = (
            notifications_collection
            .insert_one(
                notification
            )
        )


        return (
            1
            if result.inserted_id
            else 0
        )


    except Exception as error:

        print(
            "Student notification error:",
            error
        )

        return 0


# =========================================================
# ADMIN NOTIFICATION
# =========================================================

def create_admin_notification(
    title,
    message,
    notification_type
):

    try:

        admin_user = (
            users_collection
            .find_one({

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
        )


        if not admin_user:

            print(
                "No admin user found for notification."
            )

            return 0


        admin_id = str(
            admin_user["_id"]
        )


        # -------------------------------------------------
        # DUPLICATE PROTECTION
        # -------------------------------------------------

        existing = (
            notifications_collection
            .find_one({

                "userId":
                    admin_id,

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
                "Duplicate admin notification skipped."
            )

            return 0


        notification = {

            "userId":
                admin_id,

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
                get_logged_in_user_id(),

            "createdByRole":
                get_user_role()

        }


        result = (
            notifications_collection
            .insert_one(
                notification
            )
        )


        print(
            "Admin notification created:",
            result.inserted_id
        )


        return 1


    except Exception as error:

        print(
            "Admin notification error:",
            error
        )

        return 0


# =========================================================
# SONG NOTIFICATIONS
# =========================================================

def create_song_notifications(song):

    student_count = 0


    assigned_student_id = str(
        song.get(
            "assignedStudentId",
            ""
        )
    ).strip()


    song_title = song.get(
        "title",
        "New Song"
    )


    # -----------------------------------------------------
    # SPECIFIC STUDENT
    # -----------------------------------------------------

    if assigned_student_id:

        try:

            student = (
                users_collection
                .find_one({

                    "_id":
                        ObjectId(
                            assigned_student_id
                        ),

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
            )

        except Exception:

            student = None


        if student:

            student_count += (
                create_student_notification(

                    str(
                        student["_id"]
                    ),

                    "🎵 New Song Added",

                    (
                        f'A new song '
                        f'"{song_title}" '
                        f'has been assigned to you.'
                    ),

                    "song"

                )
            )


    # -----------------------------------------------------
    # ALL STUDENTS
    # -----------------------------------------------------

    else:

        students = list(
            users_collection.find({

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
        )


        for student in students:

            student_count += (
                create_student_notification(

                    str(
                        student["_id"]
                    ),

                    "🎵 New Song Added",

                    (
                        f'A new song '
                        f'"{song_title}" '
                        f'is available in your '
                        f'Song Learning section.'
                    ),

                    "song"

                )
            )


    # -----------------------------------------------------
    # ADMIN
    # -----------------------------------------------------

    admin_count = (
        create_admin_notification(

            "🎵 New Song Added",

            (
                f'A new song '
                f'"{song_title}" '
                f'was added to Tantra Academy.'
            ),

            "song"

        )
    )


    return (
        student_count,
        admin_count
    )


# =========================================================
# TASK NOTIFICATIONS
# =========================================================

def create_task_notifications(task):

    student_count = 0


    assigned_student_id = str(
        task.get(
            "assignedStudentId",
            ""
        )
    ).strip()


    task_title = task.get(
        "title",
        "New Task"
    )


    # -----------------------------------------------------
    # SPECIFIC STUDENT
    # -----------------------------------------------------

    if assigned_student_id:

        try:

            student = (
                users_collection
                .find_one({

                    "_id":
                        ObjectId(
                            assigned_student_id
                        ),

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
            )

        except Exception:

            student = None


        if student:

            student_count += (
                create_student_notification(

                    str(
                        student["_id"]
                    ),

                    "✅ New Task Assigned",

                    (
                        f'You have been assigned '
                        f'the task "{task_title}".'
                    ),

                    "task"

                )
            )


    # -----------------------------------------------------
    # ALL STUDENTS
    # -----------------------------------------------------

    else:

        students = list(
            users_collection.find({

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
        )


        for student in students:

            student_count += (
                create_student_notification(

                    str(
                        student["_id"]
                    ),

                    "✅ New Task Created",

                    (
                        f'A new task '
                        f'"{task_title}" '
                        f'has been assigned.'
                    ),

                    "task"

                )
            )


    # -----------------------------------------------------
    # ADMIN
    # -----------------------------------------------------

    admin_count = (
        create_admin_notification(

            "✅ New Task Created",

            (
                f'A new task '
                f'"{task_title}" '
                f'was created in Tantra Academy.'
            ),

            "task"

        )
    )


    return (
        student_count,
        admin_count
    )


# =========================================================
# GET STUDENTS
# =========================================================

@admin.route(
    "/students",
    methods=["GET"]
)
@jwt_required()
def get_students():

    try:

        role = get_user_role()


        if role not in [
            "admin",
            "teacher"
        ]:

            return jsonify({

                "success":
                    False,

                "message":
                    "Access denied"

            }), 403


        students = list(
            users_collection.find({

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

            }).sort(
                "createdAt",
                -1
            )
        )


        result = [
            format_user(student)
            for student in students
        ]


        return jsonify({

            "success":
                True,

            "students":
                result

        }), 200


    except Exception as error:

        print(
            "Get students error:",
            error
        )


        return jsonify({

            "success":
                False,

            "message":
                "Unable to load students",

            "error":
                str(error)

        }), 500


# =========================================================
# DELETE STUDENT
# =========================================================

@admin.route(
    "/students/<student_id>",
    methods=["DELETE"]
)
@jwt_required()
def delete_student(student_id):

    try:

        if not check_admin_access():

            return jsonify({

                "success":
                    False,

                "message":
                    "Admin access required"

            }), 403


        try:

            object_id = ObjectId(
                student_id
            )

        except Exception:

            return jsonify({

                "success":
                    False,

                "message":
                    "Invalid student ID"

            }), 400


        student = (
            users_collection
            .find_one({

                "_id":
                    object_id

            })
        )


        if not student:

            return jsonify({

                "success":
                    False,

                "message":
                    "Student not found"

            }), 404


        users_collection.delete_one({

            "_id":
                object_id

        })


        notifications_collection.delete_many({

            "userId":
                student_id

        })


        return jsonify({

            "success":
                True,

            "message":
                "Student deleted successfully"

        }), 200


    except Exception as error:

        print(
            "Delete student error:",
            error
        )


        return jsonify({

            "success":
                False,

            "message":
                "Unable to delete student",

            "error":
                str(error)

        }), 500


# =========================================================
# GET TEACHERS
# =========================================================

@admin.route(
    "/teachers",
    methods=["GET"]
)
@jwt_required()
def get_teachers():

    try:

        role = get_user_role()


        if role not in [
            "admin",
            "teacher"
        ]:

            return jsonify({

                "success":
                    False,

                "message":
                    "Access denied"

            }), 403


        teachers = list(
            users_collection.find({

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

            }).sort(
                "createdAt",
                -1
            )
        )


        result = [
            format_user(teacher)
            for teacher in teachers
        ]


        return jsonify({

            "success":
                True,

            "teachers":
                result

        }), 200


    except Exception as error:

        print(
            "Get teachers error:",
            error
        )


        return jsonify({

            "success":
                False,

            "message":
                "Unable to load teachers",

            "error":
                str(error)

        }), 500


# =========================================================
# TEACHER STUDENTS
# =========================================================

@admin.route(
    "/teacher-students",
    methods=["GET"]
)
@jwt_required()
def get_teacher_students():

    try:

        role = get_user_role()


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


        students = list(
            users_collection.find({

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

            }).sort(
                "name",
                1
            )
        )


        result = [
            format_user(student)
            for student in students
        ]


        return jsonify({

            "success":
                True,

            "students":
                result

        }), 200


    except Exception as error:

        print(
            "Teacher students error:",
            error
        )


        return jsonify({

            "success":
                False,

            "message":
                "Unable to load students",

            "error":
                str(error)

        }), 500


# =========================================================
# GET SONGS
# =========================================================

@admin.route(
    "/songs",
    methods=["GET"]
)
@jwt_required()
def get_songs():

    try:

        role = get_user_role()


        if role not in [
            "student",
            "teacher",
            "admin"
        ]:

            return jsonify({

                "success":
                    False,

                "message":
                    "Access denied"

            }), 403


        songs = list(
            songs_collection
            .find()
            .sort(
                "createdAt",
                -1
            )
        )


        result = []


        for song in songs:

            result.append({

                "id":
                    str(
                        song["_id"]
                    ),

                "title":
                    song.get(
                        "title",
                        ""
                    ),

                "artist":
                    song.get(
                        "artist",
                        ""
                    ),

                "course":
                    song.get(
                        "course",
                        ""
                    ),

                "instructions":
                    song.get(
                        "instructions",
                        ""
                    ),

                "assignedStudentId":
                    str(
                        song.get(
                            "assignedStudentId",
                            ""
                        )
                    ),

                "assignedStudentName":
                    song.get(
                        "assignedStudentName",
                        ""
                    ),

                "difficulty":
                    calculate_difficulty(
                        song
                    ),

                "createdAt":
                    song.get(
                        "createdAt"
                    ),

                "updatedAt":
                    song.get(
                        "updatedAt"
                    )

            })


        return jsonify({

            "success":
                True,

            "songs":
                result

        }), 200


    except Exception as error:

        print(
            "Get songs error:",
            error
        )


        return jsonify({

            "success":
                False,

            "message":
                "Unable to load songs",

            "error":
                str(error)

        }), 500


# =========================================================
# ADD SONG
# =========================================================

@admin.route(
    "/songs",
    methods=["POST"]
)
@jwt_required()
def add_song():

    try:

        if not check_teacher_or_admin_access():

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


        title = str(
            data.get(
                "title",
                ""
            )
        ).strip()


        artist = str(
            data.get(
                "artist",
                ""
            )
        ).strip()


        course = str(
            data.get(
                "course",
                ""
            )
        ).strip()


        instructions = str(
            data.get(
                "instructions",
                ""
            )
        ).strip()


        assigned_student_id = str(
            data.get(
                "assignedStudentId",
                ""
            )
        ).strip()


        assigned_student_name = str(
            data.get(
                "assignedStudentName",
                ""
            )
        ).strip()


        if not title:

            return jsonify({

                "success":
                    False,

                "message":
                    "Song title is required"

            }), 400


        song = {

            "title":
                title,

            "artist":
                artist,

            "course":
                course,

            "instructions":
                instructions,

            "assignedStudentId":
                assigned_student_id,

            "assignedStudentName":
                assigned_student_name,

            "difficulty":
                calculate_difficulty({

                    "title":
                        title,

                    "instructions":
                        instructions

                }),

            "createdAt":
                datetime.utcnow(),

            "updatedAt":
                datetime.utcnow(),

            "createdBy":
                get_logged_in_user_id(),

            "createdByRole":
                get_user_role()

        }


        result = (
            songs_collection
            .insert_one(
                song
            )
        )


        song["id"] = str(
            result.inserted_id
        )


        student_count, admin_count = (
            create_song_notifications(
                song
            )
        )


        return jsonify({

            "success":
                True,

            "message":
                "Song added successfully.",

            "songId":
                str(
                    result.inserted_id
                ),

            "difficulty":
                song[
                    "difficulty"
                ],

            "notificationsCreated":
                student_count,

            "adminNotificationsCreated":
                admin_count

        }), 201


    except Exception as error:

        print(
            "Add song error:",
            error
        )


        return jsonify({

            "success":
                False,

            "message":
                "Unable to add song",

            "error":
                str(error)

        }), 500


# =========================================================
# UPDATE SONG
# =========================================================

@admin.route(
    "/songs/<song_id>",
    methods=["PUT"]
)
@jwt_required()
def update_song(song_id):

    try:

        if not check_teacher_or_admin_access():

            return jsonify({

                "success":
                    False,

                "message":
                    "Teacher or admin access required"

            }), 403


        try:

            object_id = ObjectId(
                song_id
            )

        except Exception:

            return jsonify({

                "success":
                    False,

                "message":
                    "Invalid song ID"

            }), 400


        existing_song = (
            songs_collection
            .find_one({

                "_id":
                    object_id

            })
        )


        if not existing_song:

            return jsonify({

                "success":
                    False,

                "message":
                    "Song not found"

            }), 404


        data = (
            request.get_json()
            or {}
        )


        update_data = {}


        allowed_fields = [

            "title",
            "artist",
            "course",
            "instructions",
            "assignedStudentId",
            "assignedStudentName"

        ]


        for field in allowed_fields:

            if field in data:

                update_data[field] = (
                    data.get(
                        field
                    )
                )


        title = update_data.get(
            "title",
            existing_song.get(
                "title",
                ""
            )
        )


        instructions = (
            update_data.get(
                "instructions",
                existing_song.get(
                    "instructions",
                    ""
                )
            )
        )


        update_data[
            "difficulty"
        ] = calculate_difficulty({

            "title":
                title,

            "instructions":
                instructions

        })


        update_data[
            "updatedAt"
        ] = datetime.utcnow()


        songs_collection.update_one(

            {
                "_id":
                    object_id
            },

            {
                "$set":
                    update_data
            }

        )


        updated_song = (
            songs_collection
            .find_one({

                "_id":
                    object_id

            })
        )


        new_student = str(
            updated_song.get(
                "assignedStudentId",
                ""
            )
        ).strip()


        student_notification_created = 0


        # =================================================
        # 🔔 STUDENT SONG UPDATE NOTIFICATION
        #
        # IMPORTANT:
        # Notify the assigned student whenever
        # the song is updated.
        # =================================================

        if new_student:

            student_notification_created = (
                create_student_notification(

                    new_student,

                    "🎵 Song Updated",

                    (
                        f'The song '
                        f'"{updated_song.get("title", "Song")}" '
                        f'has been updated.'
                    ),

                    "song"

                )
            )


        # =================================================
        # 🔔 ADMIN SONG UPDATE NOTIFICATION
        # =================================================

        admin_notification_created = (
            create_admin_notification(

                "🎵 Song Updated",

                (
                    f'The song '
                    f'"{updated_song.get("title", "Song")}" '
                    f'was updated.'
                ),

                "song"

            )
        )


        return jsonify({

            "success":
                True,

            "message":
                "Song updated successfully.",

            "notificationsCreated":
                student_notification_created,

            "adminNotificationsCreated":
                admin_notification_created

        }), 200


    except Exception as error:

        print(
            "Update song error:",
            error
        )


        return jsonify({

            "success":
                False,

            "message":
                "Unable to update song",

            "error":
                str(error)

        }), 500


# =========================================================
# DELETE SONG
# =========================================================

@admin.route(
    "/songs/<song_id>",
    methods=["DELETE"]
)
@jwt_required()
def delete_song(song_id):

    try:

        if not check_teacher_or_admin_access():

            return jsonify({

                "success":
                    False,

                "message":
                    "Teacher or admin access required"

            }), 403


        try:

            object_id = ObjectId(
                song_id
            )

        except Exception:

            return jsonify({

                "success":
                    False,

                "message":
                    "Invalid song ID"

            }), 400


        song = (
            songs_collection
            .find_one({

                "_id":
                    object_id

            })
        )


        if not song:

            return jsonify({

                "success":
                    False,

                "message":
                    "Song not found"

            }), 404


        songs_collection.delete_one({

            "_id":
                object_id

        })


        create_admin_notification(

            "🗑️ Song Deleted",

            (
                f'The song '
                f'"{song.get("title", "Song")}" '
                f'was deleted from Tantra Academy.'
            ),

            "song"

        )


        return jsonify({

            "success":
                True,

            "message":
                "Song deleted successfully."

        }), 200


    except Exception as error:

        print(
            "Delete song error:",
            error
        )


        return jsonify({

            "success":
                False,

            "message":
                "Unable to delete song",

            "error":
                str(error)

        }), 500


# =========================================================
# GET TASKS
# =========================================================

@admin.route(
    "/tasks",
    methods=["GET"]
)
@jwt_required()
def get_tasks():

    try:

        role = get_user_role()

        logged_in_user_id = (
            get_logged_in_user_id()
        )


        if role == "student":

            query = {

                "$or": [

                    {
                        "assignedStudentId":
                            ""
                    },

                    {
                        "assignedStudentId":
                            None
                    },

                    {
                        "assignedStudentId":
                            logged_in_user_id
                    }

                ]

            }


        elif role in [
            "teacher",
            "admin"
        ]:

            query = {}


        else:

            return jsonify({

                "success":
                    False,

                "message":
                    "Access denied"

            }), 403


        tasks = list(
            tasks_collection
            .find(query)
            .sort(
                "createdAt",
                -1
            )
        )


        result = []


        for task in tasks:

            result.append({

                "id":
                    str(
                        task["_id"]
                    ),

                "title":
                    task.get(
                        "title",
                        ""
                    ),

                "course":
                    task.get(
                        "course",
                        ""
                    ),

                "instructions":
                    task.get(
                        "instructions",
                        ""
                    ),

                "dueDate":
                    task.get(
                        "dueDate",
                        ""
                    ),

                "assignedStudentId":
                    str(
                        task.get(
                            "assignedStudentId",
                            ""
                        )
                    ),

                "assignedStudentName":
                    task.get(
                        "assignedStudentName",
                        ""
                    ),

                "createdAt":
                    task.get(
                        "createdAt"
                    ),

                "updatedAt":
                    task.get(
                        "updatedAt"
                    )

            })


        return jsonify({

            "success":
                True,

            "tasks":
                result

        }), 200


    except Exception as error:

        print(
            "Get tasks error:",
            error
        )


        return jsonify({

            "success":
                False,

            "message":
                "Unable to load tasks",

            "error":
                str(error)

        }), 500


# =========================================================
# ADD TASK
# =========================================================

@admin.route(
    "/tasks",
    methods=["POST"]
)
@jwt_required()
def add_task():

    try:

        if not check_teacher_or_admin_access():

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


        instructions = str(
            data.get(
                "instructions",
                ""
            )
        ).strip()


        due_date = str(
            data.get(
                "dueDate",
                ""
            )
        ).strip()


        assigned_student_id = str(
            data.get(
                "assignedStudentId",
                ""
            )
        ).strip()


        assigned_student_name = str(
            data.get(
                "assignedStudentName",
                ""
            )
        ).strip()


        if not title:

            return jsonify({

                "success":
                    False,

                "message":
                    "Task title is required"

            }), 400


        task = {

            "title":
                title,

            "course":
                course,

            "instructions":
                instructions,

            "dueDate":
                due_date,

            "assignedStudentId":
                assigned_student_id,

            "assignedStudentName":
                assigned_student_name,

            "createdAt":
                datetime.utcnow(),

            "updatedAt":
                datetime.utcnow(),

            "createdBy":
                get_logged_in_user_id(),

            "createdByRole":
                get_user_role()

        }


        result = (
            tasks_collection
            .insert_one(
                task
            )
        )


        task["id"] = str(
            result.inserted_id
        )


        student_count, admin_count = (
            create_task_notifications(
                task
            )
        )


        return jsonify({

            "success":
                True,

            "message":
                "Task added successfully.",

            "taskId":
                str(
                    result.inserted_id
                ),

            "notificationsCreated":
                student_count,

            "adminNotificationsCreated":
                admin_count

        }), 201


    except Exception as error:

        print(
            "Add task error:",
            error
        )


        return jsonify({

            "success":
                False,

            "message":
                "Unable to add task",

            "error":
                str(error)

        }), 500


# =========================================================
# UPDATE TASK
# =========================================================

@admin.route(
    "/tasks/<task_id>",
    methods=["PUT"]
)
@jwt_required()
def update_task(task_id):

    try:

        if not check_teacher_or_admin_access():

            return jsonify({

                "success":
                    False,

                "message":
                    "Teacher or admin access required"

            }), 403


        try:

            object_id = ObjectId(
                task_id
            )

        except Exception:

            return jsonify({

                "success":
                    False,

                "message":
                    "Invalid task ID"

            }), 400


        existing_task = (
            tasks_collection
            .find_one({

                "_id":
                    object_id

            })
        )


        if not existing_task:

            return jsonify({

                "success":
                    False,

                "message":
                    "Task not found"

            }), 404


        data = (
            request.get_json()
            or {}
        )


        update_data = {}


        allowed_fields = [

            "title",
            "course",
            "instructions",
            "dueDate",
            "assignedStudentId",
            "assignedStudentName"

        ]


        for field in allowed_fields:

            if field in data:

                update_data[field] = (
                    data.get(
                        field
                    )
                )


        update_data[
            "updatedAt"
        ] = datetime.utcnow()


        tasks_collection.update_one(

            {
                "_id":
                    object_id
            },

            {
                "$set":
                    update_data
            }

        )


        updated_task = (
            tasks_collection
            .find_one({

                "_id":
                    object_id

            })
        )


        old_student = str(
            existing_task.get(
                "assignedStudentId",
                ""
            )
        )


        new_student = str(
            updated_task.get(
                "assignedStudentId",
                ""
            )
        ).strip()


        student_notification_created = 0


        if (
            new_student
            and
            new_student != old_student
        ):

            student_notification_created = (
                create_student_notification(

                    new_student,

                    "✅ Task Updated",

                    (
                        f'The task '
                        f'"{updated_task.get("title", "Task")}" '
                        f'has been assigned to you.'
                    ),

                    "task"

                )
            )


        admin_notification_created = (
            create_admin_notification(

                "✅ Task Updated",

                (
                    f'The task '
                    f'"{updated_task.get("title", "Task")}" '
                    f'was updated.'
                ),

                "task"

            )
        )


        return jsonify({

            "success":
                True,

            "message":
                "Task updated successfully.",

            "notificationsCreated":
                student_notification_created,

            "adminNotificationsCreated":
                admin_notification_created

        }), 200


    except Exception as error:

        print(
            "Update task error:",
            error
        )


        return jsonify({

            "success":
                False,

            "message":
                "Unable to update task",

            "error":
                str(error)

        }), 500


# =========================================================
# DELETE TASK
# =========================================================

@admin.route(
    "/tasks/<task_id>",
    methods=["DELETE"]
)
@jwt_required()
def delete_task(task_id):

    try:

        if not check_teacher_or_admin_access():

            return jsonify({

                "success":
                    False,

                "message":
                    "Teacher or admin access required"

            }), 403


        try:

            object_id = ObjectId(
                task_id
            )

        except Exception:

            return jsonify({

                "success":
                    False,

                "message":
                    "Invalid task ID"

            }), 400


        task = (
            tasks_collection
            .find_one({

                "_id":
                    object_id

            })
        )


        if not task:

            return jsonify({

                "success":
                    False,

                "message":
                    "Task not found"

            }), 404


        tasks_collection.delete_one({

            "_id":
                object_id

        })


        create_admin_notification(

            "🗑️ Task Deleted",

            (
                f'The task '
                f'"{task.get("title", "Task")}" '
                f'was deleted from Tantra Academy.'
            ),

            "task"

        )


        return jsonify({

            "success":
                True,

            "message":
                "Task deleted successfully."

        }), 200


    except Exception as error:

        print(
            "Delete task error:",
            error
        )


        return jsonify({

            "success":
                False,

            "message":
                "Unable to delete task",

            "error":
                str(error)

        }), 500


# =========================================================
# ADMIN STATISTICS
# =========================================================

@admin.route(
    "/stats",
    methods=["GET"]
)
@jwt_required()
def get_stats():

    try:

        if not check_admin_access():

            return jsonify({

                "success":
                    False,

                "message":
                    "Admin access required"

            }), 403


        student_count = (
            users_collection
            .count_documents({

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
        )


        teacher_count = (
            users_collection
            .count_documents({

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
        )


        song_count = (
            songs_collection
            .count_documents({})
        )


        task_count = (
            tasks_collection
            .count_documents({})
        )


        notification_count = (
            notifications_collection
            .count_documents({})
        )


        unread_notification_count = (
            notifications_collection
            .count_documents({

                "read":
                    False

            })
        )


        return jsonify({

            "success":
                True,

            "stats": {

                "students":
                    student_count,

                "teachers":
                    teacher_count,

                "songs":
                    song_count,

                "tasks":
                    task_count,

                "notifications":
                    notification_count,

                "unreadNotifications":
                    unread_notification_count

            }

        }), 200


    except Exception as error:

        print(
            "Admin stats error:",
            error
        )


        return jsonify({

            "success":
                False,

            "message":
                "Unable to load admin statistics",

            "error":
                str(error)

        }), 500