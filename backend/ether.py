from web3 import HTTPProvider, Web3
import asyncio
import time
from flask import jsonify
import jwt

node_url = "https://ethereum-sepolia-rpc.publicnode.com"
web3 = Web3(HTTPProvider(node_url))

def sendTransaction(value: float, sender: str, receiver: str, privateKey: str) -> str:
    try:
        transaction = {
            'from': sender,
            'to': receiver,
            'value': web3.to_wei(value, 'ether'),
            'nonce': web3.eth.get_transaction_count(sender),
            'gas': 200000,
            'maxFeePerGas': 2000000000,
            'maxPriorityFeePerGas': 1000000000,
            'chainId': web3.eth.chain_id
        }
        signed = web3.eth.account.sign_transaction(transaction, privateKey)
        tx_hash = web3.eth.send_raw_transaction(signed.raw_transaction)
        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        return receipt.hash.hex()

    except Exception:
        return 0

async def validateTransaction(txHash: str, confirmations: int, check_interval: int = 5, minutesToBreak: int = 10):
    startTime = time.time()
    while True:
        try:
            tx_receipt = web3.eth.get_transaction_receipt(txHash)

            # Receipt exists
            tx_block_number = tx_receipt['blockNumber']
            current_block_number = web3.eth.block_number
            currentConfirmations = current_block_number - tx_block_number + 1

            if currentConfirmations >= confirmations:
                break

        except Exception:
            if (time.time() - startTime) > minutesToBreak * 60:
                return None

        await asyncio.sleep(check_interval)

    try:
        tx = web3.eth.get_transaction(txHash)
        tx_value = web3.from_wei(tx['value'], 'ether')
        return float(tx_value)

    except Exception:
        return None

def withdraw(users_collection, data, token, jwt_secret, jwt_algorithm, eth_public_key, eth_private_key):
    address = data.get('address')
    amount = data.get('amount')
    try:
        payload = jwt.decode(token, jwt_secret, algorithms=[jwt_algorithm])
    except Exception:
        return jsonify({'message': 'Expired Token'}), 402

    email = payload['sub']
    user = users_collection.find_one({'email': email})
    balance = user.get('balance')

    if balance < amount:
        return jsonify({'message':'Insufficient balance'}), 400

    if amount < 200:
        return jsonify({'message':'Minimum withdrawal is 200 points'}), 400

    new_balance = balance - amount
    users_collection.update_one(
        {'email': email},
        {'$set': {'balance': new_balance}}
    )

    points_to_eth = amount / 10000
    trans_hash = sendTransaction(points_to_eth, eth_public_key, address, eth_private_key)
    print(f"[INFO] {email} withdrew {amount} points to {address}. Transaction hash: {trans_hash}", flush=True)
    return jsonify({'balance': new_balance, 'hash': trans_hash}), 200

async def deposit(users_collection, tx_hashed_collection, data, token, jwt_secret, jwt_algorithm):
    txHash = data.get('txHash')

    try:
        payload = jwt.decode(token, jwt_secret, algorithms=[jwt_algorithm])
    except Exception:
        return jsonify({'message': 'Expired Token'}), 402
    
    for used_hash in tx_hashed_collection.find({'txHash': txHash}):
        return jsonify({'message': 'Transaction has already been sent'}), 402

    email = payload['sub']
    user = users_collection.find_one({'email': email})

    tx_value = await validateTransaction(txHash, 3)
    print (tx_value)
    if not tx_value:
        return jsonify({'message':'Transaction validation failed'}), 400
    
    tx_hashed_collection.insert_one({'txHash': txHash, 'email': email})

    amount = tx_value * 10000
    new_balance = user.get('balance') + amount
    users_collection.update_one(
        {'email': email},
        {'$set': {'balance': new_balance}}
    )

    print(f"[INFO] {email} deposited {tx_value} ETH from transaction {txHash}", flush=True)
    return jsonify({'balance': new_balance}), 200
