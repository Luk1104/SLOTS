import os
import sys
import time

from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from pymongo.errors import PyMongoError
from flask_cors import CORS
from dotenv import load_dotenv

import ether
import account
import chat
import spingen

app = Flask(__name__)
load_dotenv()
try:
    jwt_token = os.environ.get('jwt-token-secret')
    jwt_algorithm = 'HS256'
    eth_private_key = os.environ.get('eth-private-key')
    eth_public_key = os.environ.get('eth-public-key')
    #db_user = os.environ.get('database_user')
    #db_password = os.environ.get('database_password')
except ValueError:
    print("Invalid secret in .env")
    sys.exit(1)
jwt_exp = 3600

CORS(app, supports_credentials=True, origins=["http://localhost:5000", "http://frontend-service:5173"])
app.config['MONGO_URI'] = f"mongodb://mongodb-service.default:27017/database"
#f"mongodb://{db_user}:{db_password}@mongo:27017/user_db?authSource=admin"

try:
    time.sleep(2)
    mongo = PyMongo(app)
    mongo.db.users.find_one({})
    print("Connected to MongoDB successfully.")
except PyMongoError as e:
    print(f"Failed to connect to MongoDB: {e}")
    sys.exit(1)

users_collection = mongo.db.users
messages_collection = mongo.db.messages
tx_hashes_collection = mongo.db.tx_hashes

def _get_token_from_request(req):
    auth = req.headers.get('Authorization', '')
    if auth and auth.startswith('Bearer '):
        return auth.split(' ', 1)[1].strip()

    data = req.get_json(silent=True) or {}
    token = data.get('token')
    return token

# Start of the API endpoints

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    return account.register(users_collection, data)

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    return account.login(users_collection, data, jwt_secret, jwt_algorithm, jwt_exp)

@app.route('/api/spin', methods=['POST'])
def spin():
    data = request.get_json() or {}
    token = _get_token_from_request(request)
    return spingen.spin(data, token, users_collection, jwt_secret, jwt_algorithm)

@app.route('/api/write', methods=['POST'])
def write_message():
    data = request.get_json() or {}
    token = _get_token_from_request(request)
    return chat.write_message(messages_collection, data, token, jwt_secret, jwt_algorithm)

@app.route('/api/delete', methods=['POST'])
def delete_message():
    data = request.get_json() or {}
    token = _get_token_from_request(request)
    msg_id = data.get('id')
    return chat.delete_message(messages_collection, msg_id, token, jwt_secret, jwt_algorithm)

@app.route('/api/read', methods=['GET'])
def read_messages():
    return chat.read_messages(messages_collection)

@app.route('/api/withdraw', methods=['POST'])
def withdraw():
    data = request.get_json() or {}
    token = _get_token_from_request(request)
    return ether.withdraw(users_collection, data, token, jwt_secret, jwt_algorithm, eth_public_key, eth_private_key)

@app.route('/api/deposit', methods=['POST'])
async def deposit():
    data = request.get_json() or {}
    token = _get_token_from_request(request)
    return await ether.deposit(users_collection, tx_hashes_collection, data, token, jwt_secret, jwt_algorithm)

@app.route('/', methods=['GET'])
def main():
    return jsonify({'message': 'API running'}), 200
