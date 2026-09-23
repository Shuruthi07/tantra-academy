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


notifications = Blueprint(
    "notifications",
    __name__
)


# =========================================================
# MONGODB CONNECTION
# =========================================================

client = MongoClient(
    os.getenv("MONGO_URI")
)

db = client[
    os.getenv("DATABASE_NAME")
]

notifications_collection = db[
    "notifications"
]


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def get_user_role():

    claims = get_jwt()

    return str(
        claims.get("role", "")
    ).strip().lower()


def get_current_user_id():

    claims = get_jwt()

    return str(
        claims.get("sub", "")
    ).strip()


def format_notification(notification):

    return {
        "id": str(
            notification["_id"]
        ),

        "userId": str(
            notification.get(
                "userId",
                ""
            )
        ),

        "title": notification.get(
            "title",
            "Notification"
        ),

        "message": notification.get(
            "message",
            ""
        ),

        "type": notification.get(
            "type",
            "general"
        ),

        "read": bool(
            notification.get(
                "read",
                False
            )
        ),

        "createdAt": notification.get(
            "createdAt"
        ),

        "createdBy": str(
            notification.get(
                "createdBy",
                ""
            )
        ),

        "createdByRole": notification.get(
            "createdByRole",
            ""
        )
    }


# =========================================================
# GET NOTIFICATIONS
# =========================================================

@notifications.route(
    "/",
    methods=["GET"],
    strict_slashes=False
)
@jwt_required()
def get_notifications():

    try:

        role = get_user_role()

        logged_in_user_id = (
            get_current_user_id()
        )

        requested_user_id = (
            request.args.get(
                "userId"
            )
        )


        # =================================================
        # STUDENT
        # Only their own notifications
        # =================================================

        if role == "student":

            query = {
                "userId":
                    logged_in_user_id
            }


        # =================================================
        # TEACHER
        # Only their own notifications
        # =================================================

        elif role == "teacher":

            query = {
                "userId":
                    logged_in_user_id
            }


        # =================================================
        # ADMIN
        #
        # Admin can see ALL notifications.
        #
        # If userId is supplied, admin can also
        # filter notifications for a particular user.
        # =================================================

        elif role == "admin":

            if requested_user_id:

                query = {
                    "userId":
                        str(
                            requested_user_id
                        ).strip()
                }

            else:

                # IMPORTANT:
                # No userId means ALL notifications.
                query = {}


        else:

            return jsonify({

                "success":
                    False,

                "message":
                    "Access denied"

            }), 403


        # =================================================
        # GET FROM MONGODB
        # =================================================

        notification_list = list(

            notifications_collection
            .find(query)
            .sort(
                "createdAt",
                -1
            )

        )


        result = [
            format_notification(
                notification
            )
            for notification
            in notification_list
        ]


        return jsonify({

            "success":
                True,

            "notifications":
                result,

            "count":
                len(result)

        }), 200


    except Exception as error:

        print(
            "Notification GET error:",
            error
        )

        return jsonify({

            "success":
                False,

            "message":
                "Unable to load notifications",

            "error":
                str(error)

        }), 500


# =========================================================
# CREATE NOTIFICATION
# =========================================================

@notifications.route(
    "/",
    methods=["POST"],
    strict_slashes=False
)
@jwt_required()
def create_notification():

    try:

        role = get_user_role()

        logged_in_user_id = (
            get_current_user_id()
        )


        # =================================================
        # ONLY TEACHER / ADMIN CAN CREATE
        # =================================================

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


        user_id = str(
            data.get(
                "userId",
                ""
            )
        ).strip()


        title = str(
            data.get(
                "title",
                "Notification"
            )
        ).strip()


        message = str(
            data.get(
                "message",
                ""
            )
        ).strip()


        notification_type = str(
            data.get(
                "type",
                "general"
            )
        ).strip()


        # =================================================
        # VALIDATION
        # =================================================

        if not user_id:

            return jsonify({

                "success":
                    False,

                "message":
                    "User ID is required"

            }), 400


        if not message:

            return jsonify({

                "success":
                    False,

                "message":
                    "Notification message is required"

            }), 400


        # =================================================
        # CREATE NOTIFICATION
        # =================================================

        notification = {

            "userId":
                user_id,

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
                logged_in_user_id,

            "createdByRole":
                role

        }


        result = (
            notifications_collection
            .insert_one(
                notification
            )
        )


        return jsonify({

            "success":
                True,

            "message":
                "Notification created successfully",

            "notificationId":
                str(
                    result.inserted_id
                )

        }), 201


    except Exception as error:

        print(
            "Notification creation error:",
            error
        )

        return jsonify({

            "success":
                False,

            "message":
                "Unable to create notification",

            "error":
                str(error)

        }), 500


# =========================================================
# MARK ONE NOTIFICATION AS READ
# =========================================================

@notifications.route(
    "/<notification_id>/read",
    methods=["PUT"]
)
@jwt_required()
def mark_as_read(
    notification_id
):

    try:

        logged_in_user_id = (
            get_current_user_id()
        )

        role = get_user_role()


        # =================================================
        # VALIDATE OBJECT ID
        # =================================================

        try:

            object_id = ObjectId(
                notification_id
            )

        except Exception:

            return jsonify({

                "success":
                    False,

                "message":
                    "Invalid notification ID"

            }), 400


        notification = (
            notifications_collection
            .find_one({
                "_id":
                    object_id
            })
        )


        if not notification:

            return jsonify({

                "success":
                    False,

                "message":
                    "Notification not found"

            }), 404


        # =================================================
        # ADMIN CAN MARK ANY NOTIFICATION
        # =================================================

        if role == "admin":

            allowed = True


        # =================================================
        # STUDENT / TEACHER
        # Only their own notification
        # =================================================

        else:

            allowed = (
                str(
                    notification.get(
                        "userId",
                        ""
                    )
                )
                ==
                logged_in_user_id
            )


        if not allowed:

            return jsonify({

                "success":
                    False,

                "message":
                    "You can only update your own notifications"

            }), 403


        notifications_collection.update_one(

            {
                "_id":
                    object_id
            },

            {
                "$set": {
                    "read":
                        True
                }
            }

        )


        return jsonify({

            "success":
                True,

            "message":
                "Notification marked as read"

        }), 200


    except Exception as error:

        print(
            "Notification read error:",
            error
        )

        return jsonify({

            "success":
                False,

            "message":
                "Unable to mark notification as read",

            "error":
                str(error)

        }), 500


# =========================================================
# MARK ALL NOTIFICATIONS AS READ
# =========================================================

@notifications.route(
    "/read-all",
    methods=["PUT"]
)
@jwt_required()
def mark_all_as_read():

    try:

        logged_in_user_id = (
            get_current_user_id()
        )

        role = get_user_role()

        requested_user_id = (
            request.args.get(
                "userId"
            )
        )


        # =================================================
        # STUDENT
        # =================================================

        if role == "student":

            query = {
                "userId":
                    logged_in_user_id,

                "read":
                    False
            }


        # =================================================
        # TEACHER
        # =================================================

        elif role == "teacher":

            query = {
                "userId":
                    logged_in_user_id,

                "read":
                    False
            }


        # =================================================
        # ADMIN
        #
        # No userId = mark ALL notifications as read.
        #
        # userId supplied = mark only that user's
        # notifications as read.
        # =================================================

        elif role == "admin":

            if requested_user_id:

                query = {
                    "userId":
                        str(
                            requested_user_id
                        ).strip(),

                    "read":
                        False
                }

            else:

                query = {
                    "read":
                        False
                }


        else:

            return jsonify({

                "success":
                    False,

                "message":
                    "Access denied"

            }), 403


        result = (
            notifications_collection
            .update_many(

                query,

                {
                    "$set": {
                        "read":
                            True
                    }
                }

            )
        )


        return jsonify({

            "success":
                True,

            "message":
                "Notifications marked as read",

            "updatedCount":
                result.modified_count

        }), 200


    except Exception as error:

        print(
            "Notification read-all error:",
            error
        )

        return jsonify({

            "success":
                False,

            "message":
                "Unable to update notifications",

            "error":
                str(error)

        }), 500


# =========================================================
# DELETE NOTIFICATION
# =========================================================

@notifications.route(
    "/<notification_id>",
    methods=["DELETE"]
)
@jwt_required()
def delete_notification(
    notification_id
):

    try:

        logged_in_user_id = (
            get_current_user_id()
        )

        role = get_user_role()


        # =================================================
        # VALIDATE OBJECT ID
        # =================================================

        try:

            object_id = ObjectId(
                notification_id
            )

        except Exception:

            return jsonify({

                "success":
                    False,

                "message":
                    "Invalid notification ID"

            }), 400


        notification = (
            notifications_collection
            .find_one({
                "_id":
                    object_id
            })
        )


        if not notification:

            return jsonify({

                "success":
                    False,

                "message":
                    "Notification not found"

            }), 404


        # =================================================
        # ADMIN
        # Can delete any notification
        # =================================================

        if role == "admin":

            allowed = True


        # =================================================
        # TEACHER
        # Can delete notifications created by them
        # =================================================

        elif role == "teacher":

            created_by = str(
                notification.get(
                    "createdBy",
                    ""
                )
            )

            created_by_role = str(
                notification.get(
                    "createdByRole",
                    ""
                )
            ).lower()


            allowed = (
                created_by ==
                logged_in_user_id
                and
                created_by_role ==
                "teacher"
            )


        # =================================================
        # STUDENT
        # Can delete their own notifications
        # =================================================

        elif role == "student":

            allowed = (
                str(
                    notification.get(
                        "userId",
                        ""
                    )
                )
                ==
                logged_in_user_id
            )


        else:

            allowed = False


        if not allowed:

            return jsonify({

                "success":
                    False,

                "message":
                    "You do not have permission to delete this notification"

            }), 403


        result = (
            notifications_collection
            .delete_one({

                "_id":
                    object_id

            })
        )


        if result.deleted_count == 0:

            return jsonify({

                "success":
                    False,

                "message":
                    "Notification not found"

            }), 404


        return jsonify({

            "success":
                True,

            "message":
                "Notification deleted successfully"

        }), 200


    except Exception as error:

        print(
            "Notification DELETE error:",
            error
        )

        return jsonify({

            "success":
                False,

            "message":
                "Unable to delete notification",

            "error":
                str(error)

        }), 500