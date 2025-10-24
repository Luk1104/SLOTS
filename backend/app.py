from flask import Flask, request, jsonify, session
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
import os
from pymongo.errors import PyMongoError
import sys
import time
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = os.urandom(24)
CORS(app, supports_credentials=True)

app.config['MONGO_URI'] = "mongodb://localhost:27017/user_db"
time.sleep(5)
try:
    mongo = PyMongo(app)
    mongo.db.users.find_one({}) 
    print("Connected to MongoDB successfully.")
except PyMongoError as e:
    print(f"Failed to connect to MongoDB: {e}")
    sys.exit(1)

users_collection = mongo.db.users

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'message': 'Missing email or password'}), 400

    existing_user = users_collection.find_one({'email': email})
    if existing_user:
        return jsonify({'message': 'User already exists'}), 409

    hashed_password = generate_password_hash(password)
    users_collection.insert_one({
        'email': email,
        'password': hashed_password,
        'balance': 100
    })
    return jsonify({'message': 'registered'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'message': 'Missing email or password'}), 400

    user = users_collection.find_one({'email': email})
    if user and check_password_hash(user['password'], password):
        session['logged_in'] = True
        session['email'] = email
        return jsonify({'message': 'ok'}), 200

    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/', methods=['GET'])
def main():
    return jsonify({'message': 'API running'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
