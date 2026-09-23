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


fees = Blueprint(
    "fees",
    __name__
)


# =====================================================
# MONGODB
# =====================================================

client = MongoClient(
    os.getenv("MONGO_URI")
)

db = client[
    os.getenv("DATABASE_NAME")
]

fees_collection = db["fees"]
users_collection = db["users"]
notifications_collection = db["notifications"]


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
# CREATE NOTIFICATION
# =====================================================

def create_notification(
    user_id,
    title,
    message,
    notification_type,
    created_by,
    created_by_role
):

    try:

        if not user_id:
            return False


        # ---------------------------------------------
        # PREVENT DUPLICATE UNREAD NOTIFICATION
        # ---------------------------------------------

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
                "Duplicate fee notification skipped."
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
                str(created_by),

            "createdByRole":
                created_by_role

        }


        result = (
            notifications_collection.insert_one(
                notification
            )
        )


        print(
            "Fee notification created:",
            result.inserted_id
        )


        return True


    except Exception as error:

        print(
            "Fee notification error:",
            error
        )

        return False


# =====================================================
# NOTIFY TEACHERS
# =====================================================

def notify_teachers(
    title,
    message,
    created_by,
    created_by_role
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
                    "payment",

                created_by=
                    created_by,

                created_by_role=
                    created_by_role

            ):

                count += 1


        print(
            "Teacher payment notifications:",
            count
        )


        return count


    except Exception as error:

        print(
            "Teacher notification error:",
            error
        )

        return 0


# =====================================================
# NOTIFY ADMINS
# =====================================================

def notify_admins(
    title,
    message,
    created_by,
    created_by_role
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
                    "payment",

                created_by=
                    created_by,

                created_by_role=
                    created_by_role

            ):

                count += 1


        print(
            "Admin payment notifications:",
            count
        )


        return count


    except Exception as error:

        print(
            "Admin notification error:",
            error
        )

        return 0


# =====================================================
# GET FEES
# =====================================================

@fees.route(
    "",
    methods=["GET"]
)
@fees.route(
    "/",
    methods=["GET"]
)
@jwt_required()
def get_fees():

    try:

        role = get_user_role()

        student_id = request.args.get(
            "studentId"
        )

        query = {}


        # ==========================================
        # ADMIN / TEACHER
        # ==========================================

        if role in [
            "admin",
            "teacher"
        ]:

            if student_id:

                query["studentId"] = str(
                    student_id
                ).strip()


        # ==========================================
        # STUDENT
        # ==========================================

        elif role == "student":

            current_user_id = (
                get_current_user_id()
            )

            if student_id:

                if (
                    str(student_id).strip()
                    != current_user_id
                ):

                    return jsonify({

                        "success":
                            False,

                        "message":
                            "You can only access your own fee records."

                    }), 403


            query["studentId"] = (
                current_user_id
            )


        else:

            return jsonify({

                "success":
                    False,

                "message":
                    "Unauthorized access"

            }), 403


        fee_list = list(

            fees_collection
            .find(query)
            .sort(
                "createdAt",
                -1
            )

        )


        result = []


        for fee in fee_list:

            result.append({

                "id":
                    str(
                        fee["_id"]
                    ),

                "studentId":
                    fee.get(
                        "studentId",
                        ""
                    ),

                "month":
                    fee.get(
                        "month",
                        ""
                    ),

                "amount":
                    fee.get(
                        "amount",
                        3000
                    ),

                "dueDate":
                    fee.get(
                        "dueDate",
                        ""
                    ),

                "status":
                    fee.get(
                        "status",
                        "Pending"
                    ),

                "paidDate":
                    fee.get(
                        "paidDate"
                    ),

                "createdAt":
                    fee.get(
                        "createdAt"
                    )

            })


        return jsonify({

            "success":
                True,

            "fees":
                result

        }), 200


    except Exception as error:

        print(
            "Fee GET error:",
            error
        )

        return jsonify({

            "success":
                False,

            "message":
                "Unable to load fees",

            "error":
                str(error)

        }), 500


# =====================================================
# CREATE FEE
# =====================================================

@fees.route(
    "",
    methods=["POST"]
)
@fees.route(
    "/",
    methods=["POST"]
)
@jwt_required()
def create_fee():

    try:

        role = get_user_role()

        current_user_id = (
            get_current_user_id()
        )


        # Only admin and teacher
        # can create fees.

        if role not in [
            "admin",
            "teacher"
        ]:

            return jsonify({

                "success":
                    False,

                "message":
                    "Only admin or teacher can create fees."

            }), 403


        data = request.get_json() or {}


        student_id = str(
            data.get(
                "studentId",
                ""
            )
        ).strip()


        month = str(
            data.get(
                "month",
                ""
            )
        ).strip()


        amount = data.get(
            "amount",
            3000
        )


        due_date = str(
            data.get(
                "dueDate",
                ""
            )
        ).strip()


        if not student_id:

            return jsonify({

                "success":
                    False,

                "message":
                    "Student ID is required"

            }), 400


        if not month:

            return jsonify({

                "success":
                    False,

                "message":
                    "Month is required"

            }), 400


        try:

            amount = float(
                amount
            )

        except Exception:

            amount = 3000


        fee = {

            "studentId":
                student_id,

            "month":
                month,

            "amount":
                amount,

            "dueDate":
                due_date,

            "status":
                "Pending",

            "createdAt":
                datetime.utcnow(),

            "paidDate":
                None

        }


        result = fees_collection.insert_one(
            fee
        )


        return jsonify({

            "success":
                True,

            "message":
                "Fee created successfully",

            "feeId":
                str(
                    result.inserted_id
                )

        }), 201


    except Exception as error:

        print(
            "Fee creation error:",
            error
        )

        return jsonify({

            "success":
                False,

            "message":
                "Unable to create fee",

            "error":
                str(error)

        }), 500


# =====================================================
# MARK FEE AS PAID
# =====================================================

@fees.route(
    "/<fee_id>/pay",
    methods=["PUT"]
)
@jwt_required()
def pay_fee(fee_id):

    try:

        role = get_user_role()

        current_user_id = (
            get_current_user_id()
        )


        # ==========================================
        # FIND FEE
        # ==========================================

        try:

            fee = fees_collection.find_one({

                "_id":
                    ObjectId(fee_id)

            })

        except Exception:

            return jsonify({

                "success":
                    False,

                "message":
                    "Invalid fee ID"

            }), 400


        if not fee:

            return jsonify({

                "success":
                    False,

                "message":
                    "Fee not found"

            }), 404


        # ==========================================
        # STUDENT
        # ==========================================

        if role == "student":

            if str(
                fee.get(
                    "studentId",
                    ""
                )
            ) != current_user_id:

                return jsonify({

                    "success":
                        False,

                    "message":
                        "You can only pay your own fee."

                }), 403


        # ==========================================
        # ADMIN / TEACHER
        # ==========================================

        elif role in [
            "admin",
            "teacher"
        ]:

            pass


        else:

            return jsonify({

                "success":
                    False,

                "message":
                    "Unauthorized access"

            }), 403


        # ==========================================
        # GET STUDENT
        # ==========================================

        student = None

        try:

            student = users_collection.find_one({

                "_id":
                    ObjectId(
                        str(
                            fee.get(
                                "studentId",
                                ""
                            )
                        )
                    )

            })

        except Exception:

            student = None


        student_name = "Student"


        if student:

            student_name = student.get(
                "name",
                "Student"
            )


        # ==========================================
        # MARK AS PAID
        # ==========================================

        payment_time = datetime.utcnow()


        result = fees_collection.update_one(

            {
                "_id":
                    ObjectId(fee_id)
            },

            {
                "$set": {

                    "status":
                        "Paid",

                    "paidDate":
                        payment_time

                }

            }

        )


        if result.matched_count == 0:

            return jsonify({

                "success":
                    False,

                "message":
                    "Fee not found"

            }), 404


        # ==========================================
        # PAYMENT DETAILS
        # ==========================================

        month = str(
            fee.get(
                "month",
                ""
            )
        )


        amount = fee.get(
            "amount",
            0
        )


        try:

            amount_text = (
                f"₹{float(amount):.2f}"
            )

        except Exception:

            amount_text = (
                f"₹{amount}"
            )


        title = "💰 Payment Received"


        message = (
            f"{student_name} has paid "
            f"{amount_text} for {month}."
        )


        # ==========================================
        # 🔔 TEACHER NOTIFICATION
        # ==========================================

        teacher_notification_count = (
            notify_teachers(

                title=
                    title,

                message=
                    message,

                created_by=
                    current_user_id,

                created_by_role=
                    role

            )
        )


        # ==========================================
        # 🔔 ADMIN NOTIFICATION
        # ==========================================

        admin_notification_count = (
            notify_admins(

                title=
                    title,

                message=
                    message,

                created_by=
                    current_user_id,

                created_by_role=
                    role

            )
        )


        print(
            "Payment notifications sent."
        )


        # ==========================================
        # RESPONSE
        # ==========================================

        return jsonify({

            "success":
                True,

            "message":
                "Payment recorded successfully",

            "teacherNotificationCount":
                teacher_notification_count,

            "adminNotificationCount":
                admin_notification_count

        }), 200


    except Exception as error:

        print(
            "Fee payment error:",
            error
        )

        return jsonify({

            "success":
                False,

            "message":
                "Unable to record payment",

            "error":
                str(error)

        }), 500


# =====================================================
# DELETE FEE
# =====================================================

@fees.route(
    "/<fee_id>",
    methods=["DELETE"]
)
@jwt_required()
def delete_fee(fee_id):

    try:

        role = get_user_role()


        # Only admin can delete fees.

        if role != "admin":

            return jsonify({

                "success":
                    False,

                "message":
                    "Only admin can delete fee records."

            }), 403


        try:

            result = fees_collection.delete_one({

                "_id":
                    ObjectId(fee_id)

            })

        except Exception:

            return jsonify({

                "success":
                    False,

                "message":
                    "Invalid fee ID"

            }), 400


        if result.deleted_count == 0:

            return jsonify({

                "success":
                    False,

                "message":
                    "Fee not found"

            }), 404


        return jsonify({

            "success":
                True,

            "message":
                "Fee deleted successfully"

        }), 200


    except Exception as error:

        print(
            "Fee DELETE error:",
            error
        )

        return jsonify({

            "success":
                False,

            "message":
                "Unable to delete fee",

            "error":
                str(error)

        }), 500