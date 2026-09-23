from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime
import os

load_dotenv()

client = MongoClient(
    os.getenv("MONGO_URI")
)

db = client[
    os.getenv("DATABASE_NAME")
]

users_collection = db["users"]
notifications_collection = db["notifications"]


# ==========================================
# GET STUDENTS
# ==========================================

def get_student_ids():

    students = users_collection.find(
        {
            "$or": [
                {"role": "student"},
                {"accountType": "student"}
            ]
        },
        {
            "_id": 1
        }
    )

    return [
        str(student["_id"])
        for student in students
    ]


# ==========================================
# GET TEACHERS
# ==========================================

def get_teacher_ids():

    teachers = users_collection.find(
        {
            "$or": [
                {"role": "teacher"},
                {"accountType": "teacher"}
            ]
        },
        {
            "_id": 1
        }
    )

    return [
        str(teacher["_id"])
        for teacher in teachers
    ]


# ==========================================
# GET ADMINS
# ==========================================

def get_admin_ids():

    admins = users_collection.find(
        {
            "$or": [
                {"role": "admin"},
                {"accountType": "admin"}
            ]
        },
        {
            "_id": 1
        }
    )

    return [
        str(admin["_id"])
        for admin in admins
    ]


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

    if not user_id:
        return False

    notification = {
        "userId": str(user_id),
        "title": title,
        "message": message,
        "type": notification_type,
        "read": False,
        "createdAt": datetime.utcnow(),
        "createdBy": (
            str(created_by)
            if created_by
            else None
        ),
        "createdByRole": (
            str(created_by_role)
            if created_by_role
            else None
        )
    }

    # Prevent duplicate unread notification
    existing = notifications_collection.find_one({
        "userId": str(user_id),
        "title": title,
        "message": message,
        "type": notification_type,
        "read": False
    })

    if existing:
        return False

    notifications_collection.insert_one(
        notification
    )

    return True


# ==========================================
# NOTIFY STUDENTS
# ==========================================

def notify_students(
    title,
    message,
    notification_type,
    created_by=None,
    created_by_role=None,
    student_id=None
):

    if student_id:

        student_ids = [
            str(student_id)
        ]

    else:

        student_ids = get_student_ids()

    count = 0

    for user_id in student_ids:

        if create_notification(
            user_id,
            title,
            message,
            notification_type,
            created_by,
            created_by_role
        ):

            count += 1

    return count


# ==========================================
# NOTIFY TEACHERS
# ==========================================

def notify_teachers(
    title,
    message,
    notification_type,
    created_by=None,
    created_by_role=None,
    teacher_id=None
):

    if teacher_id:

        teacher_ids = [
            str(teacher_id)
        ]

    else:

        teacher_ids = get_teacher_ids()

    count = 0

    for user_id in teacher_ids:

        if create_notification(
            user_id,
            title,
            message,
            notification_type,
            created_by,
            created_by_role
        ):

            count += 1

    return count


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

    for user_id in admin_ids:

        if create_notification(
            user_id,
            title,
            message,
            notification_type,
            created_by,
            created_by_role
        ):

            count += 1

    return count


# ==========================================
# STUDENTS + ADMINS
# ==========================================

def notify_students_and_admins(
    title,
    message,
    notification_type,
    created_by=None,
    created_by_role=None,
    student_id=None
):

    student_count = notify_students(
        title,
        message,
        notification_type,
        created_by,
        created_by_role,
        student_id
    )

    admin_count = notify_admins(
        title,
        message,
        notification_type,
        created_by,
        created_by_role
    )

    return student_count + admin_count


# ==========================================
# TEACHERS + ADMINS
# ==========================================

def notify_teachers_and_admins(
    title,
    message,
    notification_type,
    created_by=None,
    created_by_role=None,
    teacher_id=None
):

    teacher_count = notify_teachers(
        title,
        message,
        notification_type,
        created_by,
        created_by_role,
        teacher_id
    )

    admin_count = notify_admins(
        title,
        message,
        notification_type,
        created_by,
        created_by_role
    )

    return teacher_count + admin_count