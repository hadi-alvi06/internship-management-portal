import os
import datetime
from functools import wraps

import bcrypt
import jwt
from flask import request, jsonify, g
from dotenv import load_dotenv

import db_handler as db

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "insecure-fallback-secret")
JWT_ALGO = "HS256"
JWT_EXPIRY_HOURS = 12


def hash_password(password):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password, password_hash):
    return bcrypt.checkpw(password.encode(), password_hash.encode())


def generate_token(user):
    payload = {
        "user_id": user["id"],
        "username": user["username"],
        "role": user["role"],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def decode_token(token):
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])


def login(username, password):
    if not username or not password:
        return {"success": False, "message": "Username and password are required."}, 400

    user = db.get_user_by_username(username)

    if user is None or not verify_password(password, user["password_hash"]):
        return {"success": False, "message": "Invalid username or password."}, 401

    db.update_last_login(username)
    db.set_user_online_status(user["id"], True)
    db.log_activity(user["id"], user["username"], "login")

    token = generate_token(user)

    return {
        "success": True,
        "data": {"token": token, "username": user["username"], "role": user["role"]},
    }, 200


def logout(user_id, username):
    db.set_user_online_status(user_id, False)
    db.log_activity(user_id, username, "logout")
    return {"success": True, "message": "Signed out."}, 200


def change_own_password(user_id, current_password, new_password):
    user = db.get_user_by_id(user_id)

    if user is None:
        return {"success": False, "message": "Account not found."}, 404

    if not verify_password(current_password, user["password_hash"]):
        return {"success": False, "message": "Current password is incorrect."}, 400

    if not new_password or len(new_password) < 4:
        return {"success": False, "message": "New password must be at least 4 characters."}, 400

    db.update_user_password(user_id, hash_password(new_password))
    return {"success": True, "message": "Password updated successfully."}, 200


def require_auth(roles=None):
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            auth_header = request.headers.get("Authorization", "")

            if not auth_header.startswith("Bearer "):
                return jsonify({"success": False, "message": "Missing or invalid authorization token."}), 401

            token = auth_header.split(" ", 1)[1]

            try:
                payload = decode_token(token)
            except jwt.ExpiredSignatureError:
                return jsonify({"success": False, "message": "Session expired. Please log in again."}), 401
            except jwt.InvalidTokenError:
                return jsonify({"success": False, "message": "Invalid authentication token."}), 401

            if roles and payload.get("role") not in roles:
                return jsonify({"success": False, "message": "You don't have permission to do this."}), 403

            g.current_user = payload
            return f(*args, **kwargs)

        return wrapped
    return decorator