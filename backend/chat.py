import jwt
from flask import jsonify
from datetime import datetime
from bson import ObjectId

def write_message(messages_collection, data, token, jwt_secret, jwt_algorithm):
    if not token:
        return jsonify({'message': 'Missing token'}), 401

    try:
        payload = jwt.decode(token, jwt_secret, algorithms=[jwt_algorithm])
    except Exception:
        return jsonify({'message': 'Expired Token'}), 402

    email = payload.get('sub')
    if not email:
        return jsonify({'message': 'Invalid token payload'}), 401

    text = data.get('message') or ""
    if not text:
        return jsonify({'message': 'Message cannot be empty'}), 400
    if len(text) > 160:
        return jsonify({'message': 'Message too long'}), 400

    msg_doc = {
        "email": email,
        "message": text,
        "timestamp": datetime.utcnow()
    }
    messages_collection.insert_one(msg_doc)

    messages = list(messages_collection.find().sort("timestamp", 1).limit(100))
    for m in messages:
        m["_id"] = str(m["_id"])
        m["timestamp"] = m["timestamp"].isoformat() + "Z"
    return jsonify({"messages": messages}), 201

def read_messages(messages_collection):
    messages = list(messages_collection.find().sort("timestamp", 1).limit(100))
    for m in messages:
        m["_id"] = str(m["_id"])
        m["timestamp"] = m["timestamp"].isoformat() + "Z"
    return jsonify({"messages": messages}), 200

def delete_message(messages_collection, id, token, jwt_secret, jwt_algorithm):
    if not token:
        return jsonify({'message': 'Missing token'}), 401

    try:
        payload = jwt.decode(token, jwt_secret, algorithms=[jwt_algorithm])
    except Exception:
        return jsonify({'message': 'Expired Token'}), 402

    email = payload.get('sub')
    if not email:
        return jsonify({'message': 'Invalid token payload'}), 401
    if email != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403

    object_id = ObjectId(id)
    result = messages_collection.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        return jsonify({'message': 'Message not found'}), 404

    messages = list(messages_collection.find().sort("timestamp", 1).limit(100))
    for m in messages:
        m["_id"] = str(m["_id"])
        m["timestamp"] = m["timestamp"].isoformat() + "Z"
    return jsonify({"messages": messages}), 201
