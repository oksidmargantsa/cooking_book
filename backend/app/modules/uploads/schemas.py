from typing import Literal

from pydantic import BaseModel, Field

from app.core.constants import UPLOAD_MAX_BYTES, UPLOAD_MAX_KEY_LEN


class PresignInput(BaseModel):
    content_type: Literal["image/jpeg", "image/png", "image/webp"]
    size: int = Field(strict=True, ge=1, le=UPLOAD_MAX_BYTES)


class PresignResult(BaseModel):
    upload_url: str
    object_key: str


class ConfirmInput(BaseModel):
    object_key: str = Field(min_length=1, max_length=UPLOAD_MAX_KEY_LEN)


class ConfirmResult(BaseModel):
    photo_key: str
    url: str
