import time

import jwt
from flask import jsonify
from werkzeug.security import check_password_hash, generate_password_hash


def register(users_collection, data):
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"message": "Missing email or password"}), 400

    existing_user = users_collection.find_one({"email": email})
    if existing_user:
        return jsonify({"message": "User already exists"}), 409

    hashed_password = generate_password_hash(password)
    users_collection.insert_one(
        {"email": email, "password": hashed_password, "balance": 100}
    )
    print(f"[MONITOR] {email} registered", flush=True)
    return jsonify({"message": "registered"}), 201


def login(users_collection, data, jwt_secret, jwt_algorithm, jwt_exp):
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"message": "Missing email or password"}), 400

    user = users_collection.find_one({"email": email})
    if user and check_password_hash(user["password"], password):
        payload = {"exp": int(time.time()) + jwt_exp, "sub": email}
        token = jwt.encode(payload, jwt_secret, algorithm=jwt_algorithm)
        balance = user.get("balance")
        print(f"[MONITOR] {email} logged in", flush=True)
        return jsonify({"token": token, "balance": balance}), 200

    return jsonify({"message": "Invalid credentials"}), 401
