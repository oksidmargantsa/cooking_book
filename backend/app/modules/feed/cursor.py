import base64
import hmac
from hashlib import sha256
from typing import Annotated

from pydantic import BaseModel, Field

from app.core.config import get_settings
from app.core.constants import FEED_CURSOR_MAX_LEN, FEED_SEED_BYTES, POSTGRES_INTEGER_MAX
from app.core.errors import AppError


class FeedCursor(BaseModel):
    seed: Annotated[str, Field(pattern=rf"^[0-9a-f]{{{FEED_SEED_BYTES * 2}}}$")]
    last_hash: Annotated[str, Field(pattern=r"^[0-9a-f]{32}$")]
    last_id: Annotated[int, Field(strict=True, gt=0, le=POSTGRES_INTEGER_MAX)]


def _signature(payload: bytes) -> bytes:
    return hmac.digest(get_settings().jwt_secret.encode(), payload, sha256)


def encode_cursor(cursor: FeedCursor) -> str:
    payload = cursor.model_dump_json().encode()
    return base64.urlsafe_b64encode(payload + _signature(payload)).decode().rstrip("=")


def decode_cursor(value: str) -> FeedCursor:
    try:
        if not value or len(value) > FEED_CURSOR_MAX_LEN:
            raise ValueError
        padded = value + "=" * (-len(value) % 4)
        raw = base64.b64decode(padded, altchars=b"-_", validate=True)
        if base64.urlsafe_b64encode(raw).decode().rstrip("=") != value:
            raise ValueError
        digest_size = sha256().digest_size
        payload, signature = raw[:-digest_size], raw[-digest_size:]
        if not hmac.compare_digest(signature, _signature(payload)):
            raise ValueError
        return FeedCursor.model_validate_json(payload)
    except ValueError:
        raise AppError(422, "VALIDATION_ERROR", "Некорректный курсор ленты", "cursor") from None
