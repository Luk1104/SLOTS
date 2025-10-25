import os
import sys
import time
import jwt
import secrets
import string

from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from pymongo.errors import PyMongoError
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from dotenv import load_dotenv

app = Flask(__name__)
load_dotenv()
try:
    jwt_secret = os.environ.get('secret')
    jwt_algorithm = 'HS256'
except ValueError:
    print("Invalid secret in .env")
    sys.exit(1)
jwt_exp = 3600

CORS(app, supports_credentials=True)
app.config['MONGO_URI'] = "mongodb://snowflake-db:27017/user_db"
try:
    time.sleep(2)
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
        payload = {
            'exp': int(time.time()) + jwt_exp,
            'sub': email
        }
        token = jwt.encode(payload, jwt_secret, algorithm=jwt_algorithm)
        balance = user.get('balance')
        return jsonify({'token': token, 'balance': balance}), 200

    return jsonify({'message': 'Invalid credentials'}), 401

#-------------------------------------------------------------------

@app.route('/api/spin', methods=['POST'])
def spin():

    data = request.get_json() or {}
    token = data.get('token')
    payload = jwt.decode(token, jwt_secret, algorithm=jwt_algorithm)
    #print(payload)

    email = payload['sub']
    bet = payload['bet']

    user = users_collection.find_one({'email': email})
    balance = user.get('balance')

    if bet > balance:
        return jsonify({'message':'Inssuficient balance'}), 400
    
    #------------------------------------------ Losowanie

    alphabet = string.digits
    secretsGenerator = secrets.SystemRandom()
    output = secretsGenerator.sample(alphabet,3) #mamy liczbe od 0 do 999

    win_list = [0,111,222,333]

    result = ""
    for i in output:
        result += i

    result_int = int(result)

    if result_int <= 999 and result_int >= 980: # 2% na wina x20
        result = "333"
    
    elif result_int <= 691 and result_int >= 641: # 5% na wina x5
        result = "222"

    elif result_int <= 383 and result_int >= 283: # 10% na wina x2
        result = "111"

    elif result_int <= 199 and result_int >= 0: # 20% na wina x1.5
        result = "000"

    else:

        list = []

        for i in result:
            list.append(int(i)%3)

        #print(list)

        if list[0] == list[1] and list[1] == list[2]:
            list[2] += 1

        result = ""

        for i in list:
            result += str(i)
        

    #print(result_int)
    #print(result)

    if result == "000":
        win_multiplier = 1.5
    elif result == "111":
        win_multiplier = 2
    elif result == "222":
        win_multiplier = 5
    elif result == "333":
        win_multiplier = 20

    balance += bet*win_multiplier

    return jsonify({'result':result , 'balance':balance}), 200

@app.route('/', methods=['GET'])
def main():
    return jsonify({'message': 'API running'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)