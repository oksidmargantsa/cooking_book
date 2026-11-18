import asyncio
import json
from functools import lru_cache
from typing import Any

from redis.asyncio import Redis
from redis.asyncio.retry import Retry
from redis.backoff import NoBackoff

from app.core.config import get_settings
from app.core.constants import REDIS_TIMEOUT_SECONDS

_CATALOG_VERSION_KEY = "cat:version"
_catalog_change = 0
_catalog_synced_change = 0


@lru_cache
def _client() -> Redis:
    return Redis.from_url(
        get_settings().redis_url,
        decode_responses=True,
        socket_connect_timeout=REDIS_TIMEOUT_SECONDS,
        socket_timeout=REDIS_TIMEOUT_SECONDS,
        retry=Retry(NoBackoff(), 0),
    )


async def get_catalog_version() -> int:
    if _catalog_synced_change < _catalog_change:
        await _sync_catalog_version()
        if _catalog_synced_change < _catalog_change:
            return 0
    try:
        async with asyncio.timeout(REDIS_TIMEOUT_SECONDS):
            client = _client()
            version = await client.get(_CATALOG_VERSION_KEY)
            if version is None:
                await client.set(_CATALOG_VERSION_KEY, 1, nx=True)
                version = await client.get(_CATALOG_VERSION_KEY)
            return int(version) if version is not None else 0
    except Exception:
        return 0


async def bump_catalog_version() -> None:
    global _catalog_change
    _catalog_change += 1
    await _sync_catalog_version()


async def _sync_catalog_version() -> None:
    global _catalog_synced_change
    change = _catalog_change
    try:
        async with asyncio.timeout(REDIS_TIMEOUT_SECONDS):
            await _client().incr(_CATALOG_VERSION_KEY)
    except Exception:
        return
    _catalog_synced_change = max(_catalog_synced_change, change)


async def cache_get(key: str) -> Any | None:
    try:
        async with asyncio.timeout(REDIS_TIMEOUT_SECONDS):
            value = await _client().get(key)
        return json.loads(value) if value is not None else None
    except Exception:
        return None


async def cache_set(key: str, value: Any, ttl: int) -> None:
    try:
        payload = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
        async with asyncio.timeout(REDIS_TIMEOUT_SECONDS):
            await _client().set(key, payload, ex=ttl)
    except Exception:
        return
