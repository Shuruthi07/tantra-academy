from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DATABASE_NAME")]

users_collection = db["users"]

admin_email = "admin@tantraacademy.com"
new_password = "Admin@123"

result = users_collection.update_one(
    {
        "email": admin_email,
        "role": "admin"
    },
    {
        "$set": {
            "password": generate_password_hash(new_password)
        }
    }
)

if result.matched_count == 0:
    print("❌ Admin account not found.")
else:
    print("✅ Admin password reset successfully!")
    print()
    print("Email: admin@tantraacademy.com")
    print("Password: Admin@123")