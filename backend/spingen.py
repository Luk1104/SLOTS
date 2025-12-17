import string
import secrets
from flask import request, jsonify
import jwt

def spin(data, token, users_collection, jwt_secret, jwt_algorithm):
    data = request.get_json() or {}
    token = data.get('token')

    try:
        payload = jwt.decode(token, jwt_secret, algorithms=[jwt_algorithm])
    except Exception:
        return jsonify({'message': 'Expired Token'}), 402

    email = payload['sub']
    bet = data.get('bet')

    user = users_collection.find_one({'email': email})
    balance = user.get('balance')

    if bet > balance:
        return jsonify({'message':'Inssuficient balance'}), 400

    #------------------------------------------ Losowanie

    alphabet = string.digits
    secretsGenerator = secrets.SystemRandom()
    output = secretsGenerator.sample(alphabet,3) #mamy liczbe od 0 do 999
    #output = ["7","7","7"] uncomment to test secret win

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

    elif result_int == 777: # 0.1% na secret wina x100
        result = "334"

    else:

        list = []

        for i in result:
            list.append(int(i)%4)

        #print(list)

        if list[0] == list[1] and list[1] == list[2]:
            list[2] = (list[2]+1)%4 #patch z kodem losowania overflow

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
    elif result == "334":
        win_multiplier = 100
    else:
        win_multiplier = 0

    prize = bet * win_multiplier
    new_balance = balance - bet + prize

    if win_multiplier > 0:
        print(f"[MONITOR] {email} won {prize} with a {win_multiplier}x multiplier on a {bet} bet", flush=True)

    users_collection.update_one(
        {'email': email},
        {'$set': {'balance': new_balance}}
    )

    return jsonify({'result':result , 'balance':new_balance}), 200
