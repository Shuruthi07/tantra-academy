from flask import Blueprint, request, jsonify

from pymongo import MongoClient
from bson import ObjectId

from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)

from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)

from dotenv import load_dotenv

from datetime import datetime

import os


# =====================================================
# LOAD ENVIRONMENT VARIABLES
# =====================================================

load_dotenv()


# =====================================================
# AUTH BLUEPRINT
# =====================================================

auth = Blueprint(
    "auth",
    __name__
)


# =====================================================
# MONGODB CONNECTION
# =====================================================

client = MongoClient(
    os.getenv("MONGO_URI")
)

db = client[
    os.getenv("DATABASE_NAME")
]

users_collection = db[
    "users"
]


# =====================================================
# HELPER - SERIALIZE USER
# =====================================================

def serialize_user(user):

    return {
        "id": str(
            user["_id"]
        ),

        "name": user.get(
            "name",
            ""
        ),

        "email": user.get(
            "email",
            ""
        ),

        "phone": user.get(
            "phone",
            ""
        ),

        "role": user.get(
            "role",
            "student"
        )
    }


# =====================================================
# REGISTER
# =====================================================

@auth.route(
    "/register",
    methods=["POST"]
)
def register():

    try:

        data = request.get_json() or {}

        name = data.get(
            "name",
            ""
        ).strip()

        email = data.get(
            "email",
            ""
        ).strip().lower()

        phone = data.get(
            "phone",
            ""
        ).strip()

        password = data.get(
            "password",
            ""
        )

        role = data.get(
            "role",
            "student"
        )

        role = str(
            role
        ).strip().lower()


        # =============================================
        # VALIDATION
        # =============================================

        if not name:

            return jsonify({
                "success": False,
                "message":
                    "Name is required"
            }), 400


        if not email:

            return jsonify({
                "success": False,
                "message":
                    "Email is required"
            }), 400


        if not password:

            return jsonify({
                "success": False,
                "message":
                    "Password is required"
            }), 400


        # =============================================
        # PASSWORD LENGTH
        # =============================================

        if len(password) < 6:

            return jsonify({
                "success": False,
                "message":
                    "Password must contain at least 6 characters"
            }), 400


        # =============================================
        # VALID ROLE
        # =============================================

        if role not in [
            "student",
            "teacher",
            "admin"
        ]:

            return jsonify({
                "success": False,
                "message":
                    "Invalid role"
            }), 400


        # =============================================
        # CHECK EXISTING EMAIL
        # =============================================

        existing_user = users_collection.find_one({
            "email": email
        })


        if existing_user:

            return jsonify({
                "success": False,
                "message":
                    "Email already registered"
            }), 409


        # =============================================
        # HASH PASSWORD
        # =============================================

        hashed_password = generate_password_hash(
            password
        )


        # =============================================
        # CREATE USER
        # =============================================

        user = {

            "name":
                name,

            "email":
                email,

            "phone":
                phone,

            "password":
                hashed_password,

            "role":
                role,

            "createdAt":
                datetime.utcnow(),

            "updatedAt":
                datetime.utcnow()

        }


        result = users_collection.insert_one(
            user
        )


        # =============================================
        # RESPONSE
        # =============================================

        return jsonify({

            "success":
                True,

            "message":
                "Registration successful",

            "userId":
                str(
                    result.inserted_id
                )

        }), 201


    except Exception as error:

        print(
            "Registration error:",
            error
        )

        return jsonify({

            "success":
                False,

            "message":
                "Registration failed",

            "error":
                str(error)

        }), 500


# =====================================================
# LOGIN
# =====================================================

@auth.route(
    "/login",
    methods=["POST"]
)
def login():

    try:

        data = request.get_json() or {}

        email = data.get(
            "email",
            ""
        ).strip().lower()

        password = data.get(
            "password",
            ""
        )


        # =============================================
        # VALIDATION
        # =============================================

        if not email or not password:

            return jsonify({
                "success": False,
                "message":
                    "Email and password are required"
            }), 400


        # =============================================
        # FIND USER
        # =============================================

        user = users_collection.find_one({
            "email": email
        })


        if not user:

            return jsonify({
                "success": False,
                "message":
                    "Invalid email or password"
            }), 401


        # =============================================
        # CHECK PASSWORD
        # =============================================

        stored_password = user.get(
            "password",
            ""
        )


        if not check_password_hash(
            stored_password,
            password
        ):

            return jsonify({
                "success": False,
                "message":
                    "Invalid email or password"
            }), 401


        # =============================================
        # GET ROLE
        # =============================================

        user_role = str(
            user.get(
                "role",
                "student"
            )
        ).strip().lower()


        # =============================================
        # CREATE JWT
        # =============================================

        access_token = create_access_token(

            identity=str(
                user["_id"]
            ),

            additional_claims={

                "role":
                    user_role,

                "email":
                    user.get(
                        "email",
                        ""
                    ),

                "name":
                    user.get(
                        "name",
                        ""
                    )

            }

        )


        print(
            "JWT token created for:",
            email
        )


        # =============================================
        # RESPONSE
        # =============================================

        return jsonify({

            "success":
                True,

            "message":
                "Login successful",

            "token":
                access_token,

            "user":
                serialize_user(
                    user
                )

        }), 200


    except Exception as error:

        print(
            "Login error:",
            error
        )

        return jsonify({

            "success":
                False,

            "message":
                "Login failed",

            "error":
                str(error)

        }), 500


# =====================================================
# GET CURRENT USER
# =====================================================

@auth.route(
    "/me",
    methods=["GET"]
)
@jwt_required()
def get_current_user():

    try:

        # =============================================
        # GET USER ID FROM JWT
        # =============================================

        user_id = get_jwt_identity()


        # =============================================
        # GET JWT CLAIMS
        # =============================================

        claims = get_jwt()


        # =============================================
        # VALIDATE OBJECT ID
        # =============================================

        try:

            object_id = ObjectId(
                user_id
            )

        except Exception:

            return jsonify({
                "success": False,
                "message":
                    "Invalid user ID in token"
            }), 400


        # =============================================
        # FIND USER
        # =============================================

        user = users_collection.find_one({
            "_id":
                object_id
        })


        if not user:

            return jsonify({
                "success": False,
                "message":
                    "User not found"
            }), 404


        # =============================================
        # RESPONSE
        # =============================================

        return jsonify({

            "success":
                True,

            "message":
                "JWT token is valid",

            "user":
                serialize_user(
                    user
                ),

            "tokenInfo": {

                "userId":
                    user_id,

                "role":
                    claims.get(
                        "role",
                        ""
                    ),

                "email":
                    claims.get(
                        "email",
                        ""
                    )

            }

        }), 200


    except Exception as error:

        print(
            "JWT verification error:",
            error
        )

        return jsonify({

            "success":
                False,

            "message":
                "Unable to verify authentication",

            "error":
                str(error)

        }), 500


# =====================================================
# UPDATE PROFILE
# =====================================================

@auth.route(
    "/profile",
    methods=["PUT"]
)
@jwt_required()
def update_profile():

    try:

        # =============================================
        # GET LOGGED-IN USER ID
        # =============================================

        user_id = get_jwt_identity()


        # =============================================
        # VALIDATE OBJECT ID
        # =============================================

        try:

            object_id = ObjectId(
                user_id
            )

        except Exception:

            return jsonify({
                "success": False,
                "message":
                    "Invalid user ID"
            }), 400


        # =============================================
        # GET DATA
        # =============================================

        data = request.get_json() or {}


        name = data.get(
            "name",
            ""
        ).strip()

        email = data.get(
            "email",
            ""
        ).strip().lower()

        phone = data.get(
            "phone",
            ""
        ).strip()


        # =============================================
        # VALIDATE NAME
        # =============================================

        if not name:

            return jsonify({
                "success": False,
                "message":
                    "Name is required"
            }), 400


        # =============================================
        # VALIDATE EMAIL
        # =============================================

        if not email:

            return jsonify({
                "success": False,
                "message":
                    "Email is required"
            }), 400


        # =============================================
        # FIND CURRENT USER
        # =============================================

        current_user = users_collection.find_one({
            "_id":
                object_id
        })


        if not current_user:

            return jsonify({
                "success": False,
                "message":
                    "User not found"
            }), 404


        # =============================================
        # CHECK EMAIL ALREADY EXISTS
        # =============================================

        existing_email = users_collection.find_one({

            "email":
                email,

            "_id": {
                "$ne":
                    object_id
            }

        })


        if existing_email:

            return jsonify({
                "success": False,
                "message":
                    "Email is already used by another account"
            }), 409


        # =============================================
        # UPDATE USER
        # =============================================

        users_collection.update_one(

            {
                "_id":
                    object_id
            },

            {
                "$set": {

                    "name":
                        name,

                    "email":
                        email,

                    "phone":
                        phone,

                    "updatedAt":
                        datetime.utcnow()

                }
            }

        )


        # =============================================
        # GET UPDATED USER
        # =============================================

        updated_user = users_collection.find_one({
            "_id":
                object_id
        })


        # =============================================
        # RESPONSE
        # =============================================

        return jsonify({

            "success":
                True,

            "message":
                "Profile updated successfully",

            "user":
                serialize_user(
                    updated_user
                )

        }), 200


    except Exception as error:

        print(
            "Profile update error:",
            error
        )

        return jsonify({

            "success":
                False,

            "message":
                "Unable to update profile",

            "error":
                str(error)

        }), 500


# =====================================================
# CHANGE PASSWORD
# =====================================================

@auth.route(
    "/change-password",
    methods=["PUT"]
)
@jwt_required()
def change_password():

    try:

        # =============================================
        # GET LOGGED-IN USER ID
        # =============================================

        user_id = get_jwt_identity()


        # =============================================
        # VALIDATE OBJECT ID
        # =============================================

        try:

            object_id = ObjectId(
                user_id
            )

        except Exception:

            return jsonify({
                "success": False,
                "message":
                    "Invalid user ID"
            }), 400


        # =============================================
        # GET REQUEST DATA
        # =============================================

        data = request.get_json() or {}


        current_password = data.get(
            "currentPassword",
            ""
        )

        new_password = data.get(
            "newPassword",
            ""
        )


        # =============================================
        # VALIDATION
        # =============================================

        if not current_password:

            return jsonify({
                "success": False,
                "message":
                    "Current password is required"
            }), 400


        if not new_password:

            return jsonify({
                "success": False,
                "message":
                    "New password is required"
            }), 400


        if len(new_password) < 6:

            return jsonify({
                "success": False,
                "message":
                    "New password must contain at least 6 characters"
            }), 400


        # =============================================
        # FIND USER
        # =============================================

        user = users_collection.find_one({
            "_id":
                object_id
        })


        if not user:

            return jsonify({
                "success": False,
                "message":
                    "User not found"
            }), 404


        # =============================================
        # GET STORED PASSWORD
        # =============================================

        stored_password = user.get(
            "password",
            ""
        )


        # =============================================
        # CHECK CURRENT PASSWORD
        # =============================================

        if not check_password_hash(
            stored_password,
            current_password
        ):

            return jsonify({
                "success": False,
                "message":
                    "Current password is incorrect"
            }), 401


        # =============================================
        # PREVENT SAME PASSWORD
        # =============================================

        if check_password_hash(
            stored_password,
            new_password
        ):

            return jsonify({
                "success": False,
                "message":
                    "New password must be different from the current password"
            }), 400


        # =============================================
        # HASH NEW PASSWORD
        # =============================================

        hashed_password = generate_password_hash(
            new_password
        )


        # =============================================
        # UPDATE PASSWORD
        # =============================================

        users_collection.update_one(

            {
                "_id":
                    object_id
            },

            {
                "$set": {

                    "password":
                        hashed_password,

                    "updatedAt":
                        datetime.utcnow()

                }
            }

        )


        # =============================================
        # RESPONSE
        # =============================================

        return jsonify({

            "success":
                True,

            "message":
                "Password changed successfully"

        }), 200


    except Exception as error:

        print(
            "Password change error:",
            error
        )

        return jsonify({

            "success":
                False,

            "message":
                "Unable to change password",

            "error":
                str(error)

        }), 500