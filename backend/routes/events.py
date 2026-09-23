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

events = Blueprint(
    "events",
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

events_collection = db["events"]

bookings_collection = db["eventBookings"]

users_collection = db["users"]

notifications_collection = db["notifications"]


# ==========================================
# USER HELPERS
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
# NOTIFICATION HELPER
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

        # Prevent exact duplicate unread notification
        existing = notifications_collection.find_one({

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

        if existing:

            print(
                "Duplicate notification skipped."
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

        result = notifications_collection.insert_one(
            notification
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


# ==========================================
# NOTIFY ALL STUDENTS
# ==========================================

def notify_students(
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
            "Student notifications:",
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
# NOTIFY ALL TEACHERS
# ==========================================

def notify_teachers(
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


# ==========================================
# NOTIFY ALL ADMINS
# ==========================================

def notify_admins(
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

        for admin in admins:

            if create_notification(

                user_id=
                    str(
                        admin["_id"]
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


# ==========================================
# SERIALIZE EVENT
# ==========================================

def serialize_event(event):

    return {

        "id":
            str(
                event.get(
                    "_id",
                    ""
                )
            ),

        "date":
            event.get(
                "date",
                ""
            ),

        "month":
            event.get(
                "month",
                ""
            ),

        "title":
            event.get(
                "title",
                ""
            ),

        "description":
            event.get(
                "description",
                ""
            ),

        "time":
            event.get(
                "time",
                ""
            ),

        "location":
            event.get(
                "location",
                ""
            ),

        "ticketPrice":
            event.get(
                "ticketPrice",
                0
            ),

        "createdAt":
            (
                event.get(
                    "createdAt"
                ).isoformat()
                if isinstance(
                    event.get(
                        "createdAt"
                    ),
                    datetime
                )
                else event.get(
                    "createdAt"
                )
            )

    }


# ==========================================
# GET EVENTS
# STUDENT + TEACHER + ADMIN
# ==========================================

@events.route(
    "",
    methods=["GET"],
    strict_slashes=False
)
@jwt_required()
def get_events():

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
                    "Unauthorized access."

            }), 403

        event_list = list(
            events_collection.find().sort(
                "createdAt",
                -1
            )
        )

        result = []

        for event in event_list:

            result.append(
                serialize_event(
                    event
                )
            )

        return jsonify({

            "success":
                True,

            "events":
                result,

            "count":
                len(result)

        }), 200

    except Exception as error:

        print(
            "Events GET error:",
            error
        )

        return jsonify({

            "success":
                False,

            "message":
                "Unable to load events",

            "error":
                str(error)

        }), 500


# ==========================================
# CREATE EVENT
# ADMIN + TEACHER
# ==========================================

@events.route(
    "",
    methods=["POST"],
    strict_slashes=False
)
@jwt_required()
def create_event():

    try:

        role = get_user_role()

        current_user_id = (
            get_current_user_id()
        )

        if role not in [
            "admin",
            "teacher"
        ]:

            return jsonify({

                "success":
                    False,

                "message":
                    "Only admin or teacher can create events."

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

        description = str(
            data.get(
                "description",
                ""
            )
        ).strip()

        event_date = str(
            data.get(
                "date",
                ""
            )
        ).strip()

        event_time = str(
            data.get(
                "time",
                ""
            )
        ).strip()

        location = str(
            data.get(
                "location",
                ""
            )
        ).strip()

        ticket_price = data.get(
            "ticketPrice",
            0
        )

        if not title:

            return jsonify({

                "success":
                    False,

                "message":
                    "Event title is required"

            }), 400

        if not event_date:

            return jsonify({

                "success":
                    False,

                "message":
                    "Event date is required"

            }), 400

        try:

            ticket_price = float(
                ticket_price
            )

        except Exception:

            ticket_price = 0

        # ======================================
        # FORMAT DATE
        # ======================================

        try:

            date_object = datetime.strptime(
                event_date,
                "%Y-%m-%d"
            )

            formatted_date = (
                date_object.strftime(
                    "%d"
                )
            )

            formatted_month = (
                date_object.strftime(
                    "%b"
                ).upper()
            )

        except Exception:

            formatted_date = event_date

            formatted_month = ""

        # ======================================
        # CREATE EVENT
        # ======================================

        event = {

            "date":
                formatted_date,

            "month":
                formatted_month,

            "title":
                title,

            "description":
                description,

            "time":
                event_time,

            "location":
                location,

            "ticketPrice":
                ticket_price,

            "createdAt":
                datetime.utcnow(),

            "createdByRole":
                role,

            "createdBy":
                current_user_id

        }

        result = (
            events_collection.insert_one(
                event
            )
        )

        # ======================================
        # 🔔 STUDENT NOTIFICATION
        # ======================================

        notify_students(

            title=
                "🎉 New Event",

            message=
                f"New event '{title}' has been added.",

            notification_type=
                "event",

            created_by=
                current_user_id,

            created_by_role=
                role

        )

        # ======================================
        # 🔔 ADMIN NOTIFICATION
        # ======================================

        # IMPORTANT:
        # Admin also receives notification when
        # ADMIN creates an event.

        notify_admins(

            title=
                "🎉 New Event",

            message=
                f"New event '{title}' has been added.",

            notification_type=
                "event",

            created_by=
                current_user_id,

            created_by_role=
                role

        )

        print(
            "Event notifications sent."
        )

        return jsonify({

            "success":
                True,

            "message":
                "Event created successfully",

            "eventId":
                str(
                    result.inserted_id
                )

        }), 201

    except Exception as error:

        print(
            "Event creation error:",
            error
        )

        return jsonify({

            "success":
                False,

            "message":
                "Unable to create event",

            "error":
                str(error)

        }), 500


# ==========================================
# UPDATE EVENT
# ADMIN + TEACHER
# ==========================================

@events.route(
    "/<event_id>",
    methods=["PUT"],
    strict_slashes=False
)
@jwt_required()
def update_event(event_id):

    try:

        role = get_user_role()

        current_user_id = (
            get_current_user_id()
        )

        if role not in [
            "admin",
            "teacher"
        ]:

            return jsonify({

                "success":
                    False,

                "message":
                    "Only admin or teacher can update events."

            }), 403

        try:

            object_id = ObjectId(
                event_id
            )

        except Exception:

            return jsonify({

                "success":
                    False,

                "message":
                    "Invalid event ID"

            }), 400

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

        description = str(
            data.get(
                "description",
                ""
            )
        ).strip()

        event_date = str(
            data.get(
                "date",
                ""
            )
        ).strip()

        event_time = str(
            data.get(
                "time",
                ""
            )
        ).strip()

        location = str(
            data.get(
                "location",
                ""
            )
        ).strip()

        ticket_price = data.get(
            "ticketPrice",
            0
        )

        if not title:

            return jsonify({

                "success":
                    False,

                "message":
                    "Event title is required"

            }), 400

        if not event_date:

            return jsonify({

                "success":
                    False,

                "message":
                    "Event date is required"

            }), 400

        try:

            ticket_price = float(
                ticket_price
            )

        except Exception:

            ticket_price = 0

        # ======================================
        # FORMAT DATE
        # ======================================

        try:

            date_object = datetime.strptime(
                event_date,
                "%Y-%m-%d"
            )

            formatted_date = (
                date_object.strftime(
                    "%d"
                )
            )

            formatted_month = (
                date_object.strftime(
                    "%b"
                ).upper()
            )

        except Exception:

            formatted_date = event_date

            formatted_month = ""

        # ======================================
        # UPDATE EVENT
        # ======================================

        result = events_collection.update_one(

            {
                "_id":
                    object_id
            },

            {
                "$set": {

                    "date":
                        formatted_date,

                    "month":
                        formatted_month,

                    "title":
                        title,

                    "description":
                        description,

                    "time":
                        event_time,

                    "location":
                        location,

                    "ticketPrice":
                        ticket_price,

                    "updatedAt":
                        datetime.utcnow(),

                    "updatedBy":
                        current_user_id

                }
            }
        )

        if result.matched_count == 0:

            return jsonify({

                "success":
                    False,

                "message":
                    "Event not found"

            }), 404

        # ======================================
        # 🔔 STUDENT NOTIFICATION
        # ======================================

        notify_students(

            title=
                "📢 Event Updated",

            message=
                f"Event '{title}' has been updated.",

            notification_type=
                "event",

            created_by=
                current_user_id,

            created_by_role=
                role

        )

        # ======================================
        # 🔔 ADMIN NOTIFICATION
        # ======================================

        notify_admins(

            title=
                "📢 Event Updated",

            message=
                f"Event '{title}' has been updated.",

            notification_type=
                "event",

            created_by=
                current_user_id,

            created_by_role=
                role

        )

        return jsonify({

            "success":
                True,

            "message":
                "Event updated successfully"

        }), 200

    except Exception as error:

        print(
            "Event update error:",
            error
        )

        return jsonify({

            "success":
                False,

            "message":
                "Unable to update event",

            "error":
                str(error)

        }), 500


# ==========================================
# DELETE EVENT
# ADMIN ONLY
# ==========================================

@events.route(
    "/<event_id>",
    methods=["DELETE"],
    strict_slashes=False
)
@jwt_required()
def delete_event(event_id):

    try:

        role = get_user_role()

        if role != "admin":

            return jsonify({

                "success":
                    False,

                "message":
                    "Only admin can delete events."

            }), 403

        try:

            object_id = ObjectId(
                event_id
            )

        except Exception:

            return jsonify({

                "success":
                    False,

                "message":
                    "Invalid event ID"

            }), 400

        result = events_collection.delete_one({

            "_id":
                object_id

        })

        bookings_collection.delete_many({

            "eventId":
                event_id

        })

        if result.deleted_count == 0:

            return jsonify({

                "success":
                    False,

                "message":
                    "Event not found"

            }), 404

        return jsonify({

            "success":
                True,

            "message":
                "Event deleted successfully"

        }), 200

    except Exception as error:

        print(
            "Event delete error:",
            error
        )

        return jsonify({

            "success":
                False,

            "message":
                "Unable to delete event",

            "error":
                str(error)

        }), 500


# ==========================================
# GET BOOKINGS
# ADMIN + TEACHER + OWN STUDENT BOOKINGS
# ==========================================

@events.route(
    "/<event_id>/bookings",
    methods=["GET"],
    strict_slashes=False
)
@jwt_required()
def get_bookings(event_id):

    try:

        role = get_user_role()

        query = {

            "eventId":
                event_id

        }

        # ======================================
        # STUDENT
        # ======================================

        if role == "student":

            query["studentId"] = (
                get_current_user_id()
            )

        # ======================================
        # TEACHER / ADMIN
        # ======================================

        elif role in [
            "teacher",
            "admin"
        ]:

            pass

        else:

            return jsonify({

                "success":
                    False,

                "message":
                    "Unauthorized access"

            }), 403

        booking_list = list(

            bookings_collection.find(
                query
            ).sort(
                "createdAt",
                -1
            )

        )

        result = []

        for booking in booking_list:

            result.append({

                "id":
                    str(
                        booking.get(
                            "_id",
                            ""
                        )
                    ),

                "eventId":
                    booking.get(
                        "eventId",
                        ""
                    ),

                "studentId":
                    booking.get(
                        "studentId",
                        ""
                    ),

                "studentName":
                    booking.get(
                        "studentName",
                        "Student"
                    ),

                "tickets":
                    booking.get(
                        "tickets",
                        0
                    ),

                "totalAmount":
                    booking.get(
                        "totalAmount",
                        0
                    ),

                "status":
                    booking.get(
                        "status",
                        "Booked"
                    ),

                "createdAt":
                    (
                        booking.get(
                            "createdAt"
                        ).isoformat()
                        if isinstance(
                            booking.get(
                                "createdAt"
                            ),
                            datetime
                        )
                        else booking.get(
                            "createdAt"
                        )
                    )

            })

        return jsonify({

            "success":
                True,

            "bookings":
                result

        }), 200

    except Exception as error:

        print(
            "Bookings GET error:",
            error
        )

        return jsonify({

            "success":
                False,

            "message":
                "Unable to load bookings",

            "error":
                str(error)

        }), 500


# ==========================================
# CREATE BOOKING
# STUDENT ONLY
# ==========================================

@events.route(
    "/<event_id>/bookings",
    methods=["POST"],
    strict_slashes=False
)
@jwt_required()
def create_booking(event_id):

    try:

        role = get_user_role()

        student_id = (
            get_current_user_id()
        )

        if role != "student":

            return jsonify({

                "success":
                    False,

                "message":
                    "Only students can book events."

            }), 403

        data = (
            request.get_json()
            or {}
        )

        student_name = str(

            data.get(
                "studentName",
                "Student"
            )

        ).strip()

        tickets = data.get(
            "tickets",
            1
        )

        if not student_id:

            return jsonify({

                "success":
                    False,

                "message":
                    "Unable to identify student."

            }), 400

        try:

            tickets = int(
                tickets
            )

        except Exception:

            tickets = 1

        if tickets < 1:

            tickets = 1

        # ======================================
        # FIND EVENT
        # ======================================

        try:

            event = (
                events_collection.find_one({

                    "_id":
                        ObjectId(
                            event_id
                        )

                })
            )

        except Exception:

            return jsonify({

                "success":
                    False,

                "message":
                    "Invalid event ID"

            }), 400

        if not event:

            return jsonify({

                "success":
                    False,

                "message":
                    "Event not found"

            }), 404

        # ======================================
        # DUPLICATE BOOKING
        # ======================================

        existing_booking = (
            bookings_collection.find_one({

                "eventId":
                    event_id,

                "studentId":
                    student_id

            })
        )

        if existing_booking:

            return jsonify({

                "success":
                    False,

                "message":
                    "You have already booked this event."

            }), 409

        # ======================================
        # CALCULATE TOTAL
        # ======================================

        try:

            ticket_price = float(

                event.get(
                    "ticketPrice",
                    0
                )

            )

        except Exception:

            ticket_price = 0

        total_amount = (
            ticket_price *
            tickets
        )

        # ======================================
        # CREATE BOOKING
        # ======================================

        booking = {

            "eventId":
                event_id,

            "studentId":
                student_id,

            "studentName":
                student_name,

            "tickets":
                tickets,

            "totalAmount":
                total_amount,

            "status":
                "Booked",

            "createdAt":
                datetime.utcnow()

        }

        result = (
            bookings_collection.insert_one(
                booking
            )
        )

        event_title = str(
            event.get(
                "title",
                "Event"
            )
        )

        # ======================================
        # 🔔 STUDENT
        # BOOKING CONFIRMATION
        # ======================================

        create_notification(

            user_id=
                student_id,

            title=
                "🎟️ Booking Confirmed",

            message=
                f"Your booking for '{event_title}' is confirmed.",

            notification_type=
                "booking",

            created_by=
                student_id,

            created_by_role=
                "student"

        )

        # ======================================
        # 🔔 TEACHERS
        # NEW BOOKING
        # ======================================

        notify_teachers(

            title=
                "🎟️ New Event Booking",

            message=
                f"{student_name} booked '{event_title}'.",

            notification_type=
                "booking",

            created_by=
                student_id,

            created_by_role=
                "student"

        )

        # ======================================
        # 🔔 ADMINS
        # NEW BOOKING
        # ======================================

        notify_admins(

            title=
                "🎟️ New Event Booking",

            message=
                f"{student_name} booked '{event_title}'.",

            notification_type=
                "booking",

            created_by=
                student_id,

            created_by_role=
                "student"

        )

        print(
            "Event booking notifications sent."
        )

        return jsonify({

            "success":
                True,

            "message":
                "Ticket booked successfully",

            "bookingId":
                str(
                    result.inserted_id
                )

        }), 201

    except Exception as error:

        print(
            "Booking creation error:",
            error
        )

        return jsonify({

            "success":
                False,

            "message":
                "Unable to create booking",

            "error":
                str(error)

        }), 500