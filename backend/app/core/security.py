import hashlib
import secrets
from datetime import datetime, timezone

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError
from starlette.concurrency import run_in_threadpool

from app.core.config import get_settings
from app.core.constants import ACCESS_TOKEN_TTL
from app.core.errors import unauthorized

_hasher = PasswordHasher()

DUMMY_HASH = _hasher.hash("dummy-password-for-timing")


async def hash_password(password: str) -> str:

    return await run_in_threadpool(_hasher.hash, password)


async def verify_password(password_hash: str, password: str) -> bool:
    try:
        return await run_in_threadpool(_hasher.verify, password_hash, password)
    except (VerificationError, InvalidHashError):
        return False


def create_access_token(user_id: int) -> str:
    settings = get_settings()
    now = datetime.now(timezone.utc)
    payload = {"sub": str(user_id), "typ": "access", "iat": now, "exp": now + ACCESS_TOKEN_TTL}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> int:
    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
            options={"require": ["exp", "sub"]},
        )
        if payload.get("typ") != "access":
            raise jwt.InvalidTokenError("wrong token type")
        return int(payload["sub"])
    except (jwt.InvalidTokenError, ValueError):
        raise unauthorized("Токен недействителен или истёк") from None


def generate_refresh_token() -> tuple[str, str]:

    raw = secrets.token_urlsafe(48)
    return raw, hash_refresh_token(raw)


def hash_refresh_token(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()
