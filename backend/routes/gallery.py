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

gallery = Blueprint(
    "gallery",
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

gallery_collection = db["gallery"]
users_collection = db["users"]
notifications_collection = db["notifications"]


# ==========================================
# HELPER FUNCTIONS
# ==========================================

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
        # DUPLICATE UNREAD CHECK
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
                "Duplicate gallery notification skipped."
            )

            return False


        result = (
            notifications_collection.insert_one(
                notification
            )
        )


        print(
            "Gallery notification created:",
            result.inserted_id
        )


        return True


    except Exception as error:

        print(
            "Gallery notification error:",
            error
        )

        return False


# ==========================================
# NOTIFY ALL STUDENTS
# ==========================================

def notify_all_students(
    title,
    message,
    notification_type,
    created_by=None,
    created_by_role=None
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

            if create_notification(

                user_id=
                    str(
                        student["_id"]
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
            "Student gallery notifications:",
            count
        )


        return count


    except Exception as error:

        print(
            "Student notification error:",
            error
        )

        return 0


# ==========================================
# NOTIFY ALL ADMINS
# ==========================================

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
            "Admin gallery notifications:",
            count
        )


        return count


    except Exception as error:

        print(
            "Admin notification error:",
            error
        )

        return 0


# ==========================================
# GET ALL GALLERY PHOTOS
# ==========================================

@gallery.route(
    "",
    methods=["GET"]
)
@gallery.route(
    "/",
    methods=["GET"]
)
@jwt_required()
def get_gallery():

    try:

        gallery_list = list(

            gallery_collection
            .find()
            .sort(
                "createdAt",
                -1
            )

        )


        result = []


        for item in gallery_list:

            result.append({

                "id":
                    str(
                        item["_id"]
                    ),

                "title":
                    item.get(
                        "title",
                        ""
                    ),

                "category":
                    item.get(
                        "category",
                        "Event"
                    ),

                "image":
                    item.get(
                        "image",
                        ""
                    ),

                "createdAt":
                    item.get(
                        "createdAt"
                    )

            })


        return jsonify({

            "success":
                True,

            "gallery":
                result

        }), 200


    except Exception as error:

        print(
            "Gallery GET error:",
            error
        )


        return jsonify({

            "success":
                False,

            "message":
                "Unable to load gallery",

            "error":
                str(error)

        }), 500


# ==========================================
# ADD GALLERY PHOTO
# ==========================================

@gallery.route(
    "",
    methods=["POST"]
)
@gallery.route(
    "/",
    methods=["POST"]
)
@jwt_required()
def add_gallery_photo():

    try:

        role = get_user_role()

        current_user_id = (
            get_current_user_id()
        )


        # =====================================
        # ADMIN / TEACHER ONLY
        # =====================================

        if role not in [
            "admin",
            "teacher"
        ]:

            return jsonify({

                "success":
                    False,

                "message":
                    "Admin or teacher access required"

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


        category = str(
            data.get(
                "category",
                "Event"
            )
        ).strip()


        image = str(
            data.get(
                "image",
                ""
            )
        ).strip()


        # =====================================
        # VALIDATION
        # =====================================

        if not title:

            return jsonify({

                "success":
                    False,

                "message":
                    "Photo title is required"

            }), 400


        if not image:

            return jsonify({

                "success":
                    False,

                "message":
                    "Photo image is required"

            }), 400


        # =====================================
        # CREATE PHOTO
        # =====================================

        photo = {

            "title":
                title,

            "category":
                category,

            "image":
                image,

            "createdAt":
                datetime.utcnow(),

            "createdBy":
                current_user_id,

            "createdByRole":
                role

        }


        # =====================================
        # SAVE TO MONGODB
        # =====================================

        result = (
            gallery_collection.insert_one(
                photo
            )
        )


        # =====================================
        # NOTIFY ALL STUDENTS
        # =====================================

        student_notification_count = (
            notify_all_students(

                title=
                    "🖼️ New Gallery Update",

                message=
                    (
                        f'A new gallery photo '
                        f'"{title}" '
                        f'has been added.'
                    ),

                notification_type=
                    "gallery",

                created_by=
                    current_user_id,

                created_by_role=
                    role

            )
        )


        # =====================================
        # NOTIFY ADMINS
        # =====================================

        admin_notification_count = 0


        # If teacher adds the photo,
        # notify admins.
        #
        # If admin adds the photo,
        # do not notify the same admin
        # unnecessarily.

        if role == "teacher":

            admin_notification_count = (
                notify_all_admins(

                    title=
                        "🖼️ New Gallery Update",

                    message=
                        (
                            f'Teacher added a '
                            f'new gallery photo '
                            f'"{title}".'
                        ),

                    notification_type=
                        "gallery",

                    created_by=
                        current_user_id,

                    created_by_role=
                        role

                )
            )


        return jsonify({

            "success":
                True,

            "message":
                "Photo added successfully",

            "galleryId":
                str(
                    result.inserted_id
                ),

            "studentNotifications":
                student_notification_count,

            "adminNotifications":
                admin_notification_count

        }), 201


    except Exception as error:

        print(
            "Gallery POST error:",
            error
        )


        return jsonify({

            "success":
                False,

            "message":
                "Unable to add photo",

            "error":
                str(error)

        }), 500


# ==========================================
# DELETE GALLERY PHOTO
# ==========================================

@gallery.route(
    "/<gallery_id>",
    methods=["DELETE"]
)
@jwt_required()
def delete_gallery_photo(
    gallery_id
):

    try:

        role = get_user_role()

        current_user_id = (
            get_current_user_id()
        )


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


        # =====================================
        # VALIDATE OBJECT ID
        # =====================================

        try:

            object_id = ObjectId(
                gallery_id
            )

        except Exception:

            return jsonify({

                "success":
                    False,

                "message":
                    "Invalid gallery ID"

            }), 400


        # =====================================
        # FIND PHOTO
        # =====================================

        photo = (
            gallery_collection.find_one({

                "_id":
                    object_id

            })
        )


        if not photo:

            return jsonify({

                "success":
                    False,

                "message":
                    "Gallery photo not found"

            }), 404


        # =====================================
        # DELETE PHOTO
        # =====================================

        result = (
            gallery_collection.delete_one({

                "_id":
                    object_id

            })
        )


        if result.deleted_count == 0:

            return jsonify({

                "success":
                    False,

                "message":
                    "Gallery photo not found"

            }), 404


        # =====================================
        # NOTIFY ALL ADMINS
        # =====================================

        notify_all_admins(

            title=
                "🗑️ Gallery Photo Deleted",

            message=
                (
                    f'The gallery photo '
                    f'"{photo.get("title", "Photo")}" '
                    f'was deleted.'
                ),

            notification_type=
                "gallery",

            created_by=
                current_user_id,

            created_by_role=
                role

        )


        return jsonify({

            "success":
                True,

            "message":
                "Photo deleted successfully"

        }), 200


    except Exception as error:

        print(
            "Gallery DELETE error:",
            error
        )


        return jsonify({

            "success":
                False,

            "message":
                "Unable to delete gallery photo",

            "error":
                str(error)

        }), 500