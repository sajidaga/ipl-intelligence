"""
Redis/Upstash caching layer for ML predictions.
Falls back to in-memory cache if Redis is unavailable.
"""

import os
import json
import time
from typing import Optional, Any
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL")

# Try to use Redis if available
_redis_client = None
_memory_cache: dict[str, dict] = {}

try:
    if REDIS_URL:
        import redis

        _redis_client = redis.from_url(REDIS_URL, decode_responses=True)
        _redis_client.ping()
        print("✓ Connected to Redis cache")
except Exception:
    _redis_client = None
    print("⚠ Redis unavailable, using in-memory cache")


async def get_cached(key: str) -> Optional[dict]:
    """Retrieve a cached prediction result."""
    try:
        if _redis_client:
            data = _redis_client.get(key)
            return json.loads(data) if data else None
        else:
            entry = _memory_cache.get(key)
            if entry and entry["expires_at"] > time.time():
                return entry["data"]
            elif entry:
                del _memory_cache[key]
            return None
    except Exception:
        return None


async def set_cached(key: str, data: Any, ttl: int = 3600) -> None:
    """Cache a prediction result with TTL (seconds)."""
    try:
        if _redis_client:
            _redis_client.setex(key, ttl, json.dumps(data))
        else:
            _memory_cache[key] = {
                "data": data,
                "expires_at": time.time() + ttl,
            }
    except Exception:
        pass


async def clear_cache(pattern: str = "*") -> None:
    """Clear cached entries matching a pattern."""
    try:
        if _redis_client:
            keys = _redis_client.keys(pattern)
            if keys:
                _redis_client.delete(*keys)
        else:
            if pattern == "*":
                _memory_cache.clear()
            else:
                prefix = pattern.rstrip("*")
                keys_to_delete = [k for k in _memory_cache if k.startswith(prefix)]
                for k in keys_to_delete:
                    del _memory_cache[k]
    except Exception:
        pass
