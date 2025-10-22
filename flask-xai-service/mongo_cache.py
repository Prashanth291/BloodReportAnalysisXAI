from pymongo import MongoClient
from hashlib import sha256
import json
import os

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.environ.get("XAI_CACHE_DB", "xai_cache_db")
COLLECTION_NAME = os.environ.get("XAI_CACHE_COLLECTION", "interpretation_cache")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

def make_cache_key(payload: dict) -> str:
    # Use a hash of the sorted JSON payload as the cache key
    payload_str = json.dumps(payload, sort_keys=True)
    return sha256(payload_str.encode("utf-8")).hexdigest()

def get_cached_interpretation(payload: dict):
    key = make_cache_key(payload)
    doc = collection.find_one({"_id": key})
    if doc:
        return doc["result"]
    return None

def set_cached_interpretation(payload: dict, result: dict):
    key = make_cache_key(payload)
    collection.update_one(
        {"_id": key},
        {"$set": {"result": result}},
        upsert=True
    )
