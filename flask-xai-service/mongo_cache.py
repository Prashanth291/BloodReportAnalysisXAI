"""
MongoDB cache for XAI interpretations
Handles caching of interpretation results to reduce computation
"""
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from hashlib import sha256
import json
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB configuration with fallback
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.environ.get("XAI_CACHE_DB", "xai_cache_db")
COLLECTION_NAME = os.environ.get("XAI_CACHE_COLLECTION", "interpretation_cache")

# Initialize MongoDB client with connection pooling
try:
    client = MongoClient(
        MONGO_URI,
        serverSelectionTimeoutMS=5000,  # 5 second timeout
        connectTimeoutMS=5000,
        maxPoolSize=10
    )
    # Test connection
    client.admin.command('ping')
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    # Create index on _id for faster lookups
    collection.create_index("_id", unique=True)
    MONGO_AVAILABLE = True
    logger.info(f"✓ MongoDB connected successfully to {DB_NAME}.{COLLECTION_NAME}")
except (ConnectionFailure, ServerSelectionTimeoutError) as e:
    logger.warning(f"⚠ MongoDB not available: {e}. Caching disabled.")
    MONGO_AVAILABLE = False
    client = None
    db = None
    collection = None
except Exception as e:
    logger.error(f"❌ MongoDB connection error: {e}. Caching disabled.")
    MONGO_AVAILABLE = False
    client = None
    db = None
    collection = None


def make_cache_key(payload: dict) -> str:
    """
    Generate a cache key from payload.
    Only uses relevant fields to avoid cache misses from extra metadata.
    """
    # Extract only relevant fields for caching
    cache_fields = {
        'parameter': payload.get('parameter', ''),
        'value': payload.get('value', 0),
        'patientAge': payload.get('patientAge', 0),
        'patientGender': payload.get('patientGender', ''),
        'diabetic': payload.get('diabetic', False),
        'pregnant': payload.get('pregnant', False),
    }
    
    # Add otherParameters if present
    if 'otherParameters' in payload:
        cache_fields['otherParameters'] = payload['otherParameters']
    
    payload_str = json.dumps(cache_fields, sort_keys=True)
    return sha256(payload_str.encode("utf-8")).hexdigest()


def get_cached_interpretation(payload: dict):
    """
    Retrieve cached interpretation if available.
    Returns None if not found or if MongoDB is unavailable.
    """
    if not MONGO_AVAILABLE or collection is None:
        return None
    
    try:
        key = make_cache_key(payload)
        doc = collection.find_one({"_id": key})
        if doc:
            logger.info(f"✓ Cache HIT for key: {key[:16]}...")
            return doc.get("result")
        else:
            logger.debug(f"Cache MISS for key: {key[:16]}...")
            return None
    except Exception as e:
        logger.error(f"Error retrieving from cache: {e}")
        return None


def set_cached_interpretation(payload: dict, result: dict):
    """
    Store interpretation result in cache.
    Silently fails if MongoDB is unavailable.
    """
    if not MONGO_AVAILABLE or collection is None:
        return
    
    try:
        key = make_cache_key(payload)
        collection.update_one(
            {"_id": key},
            {"$set": {
                "result": result,
                "timestamp": {"$currentDate": {"lastModified": True}}
            }},
            upsert=True
        )
        logger.debug(f"✓ Cached result for key: {key[:16]}...")
    except Exception as e:
        logger.error(f"Error storing in cache: {e}")


def clear_cache():
    """Clear all cached interpretations (admin function)"""
    if not MONGO_AVAILABLE or collection is None:
        logger.warning("MongoDB not available, cannot clear cache")
        return False
    
    try:
        result = collection.delete_many({})
        logger.info(f"✓ Cleared {result.deleted_count} cached interpretations")
        return True
    except Exception as e:
        logger.error(f"Error clearing cache: {e}")
        return False


# Graceful shutdown
def close_connection():
    """Close MongoDB connection"""
    if client:
        client.close()
        logger.info("MongoDB connection closed")


# Register cleanup on exit
import atexit
atexit.register(close_connection)