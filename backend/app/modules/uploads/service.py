from collections.abc import Callable, Sequence
from datetime import UTC, datetime
from re import fullmatch
from uuid import uuid4

from botocore.exceptions import BotoCoreError, ClientError
from PIL import Image
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.concurrency import run_in_threadpool

from app.core.constants import UPLOAD_ALLOWED_TYPES, UPLOAD_ORPHAN_AGE
from app.core.errors import AppError, forbidden, not_found
from app.modules.uploads.image_processor import make_jpegs
from app.modules.uploads.repository import UploadsRepository
from app.modules.uploads.schemas import ConfirmResult, PresignResult
from app.modules.uploads.storage import get_storage


def thumbnail_key(photo_key: str) -> str:
    return f"{photo_key.removesuffix('.jpg')}_thumb.jpg"


async def storage_call[Result](operation: Callable[..., Result], *args: object) -> Result:
    try:
        return await run_in_threadpool(operation, *args)
    except (BotoCoreError, ClientError) as error:
        raise AppError(503, "STORAGE_UNAVAILABLE", "Хранилище фото временно недоступно") from error


class UploadsService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = UploadsRepository(session)

    async def presign(self, user_id: int, content_type: str) -> PresignResult:
        key = f"tmp/{user_id}/{uuid4().hex}.{UPLOAD_ALLOWED_TYPES[content_type]}"
        storage = await storage_call(get_storage)
        url = await storage_call(storage.presign, key, content_type)
        return PresignResult(upload_url=url, object_key=key)

    async def confirm(self, user_id: int, object_key: str) -> ConfirmResult:
        match = fullmatch(rf"tmp/{user_id}/([0-9a-f]{{32}})\.(?:jpg|png|webp)", object_key)
        if match is None:
            raise forbidden("Нельзя подтвердить этот ключ загрузки")
        photo_key = f"photos/{user_id}/{match[1]}.jpg"
        storage = await storage_call(get_storage)

        await self.repo.lock_photo(photo_key)
        try:
            if not await storage_call(storage.exists, photo_key):
                data = await storage_call(storage.read_temp, object_key)
                if data is None:
                    raise not_found("Загруженный файл не найден", "object_key")
                original, thumbnail = await run_in_threadpool(make_jpegs, data)
                await storage_call(storage.put_jpeg, thumbnail_key(photo_key), thumbnail)
                await storage_call(storage.put_jpeg, photo_key, original)
        except ValueError as error:
            raise AppError(422, "VALIDATION_ERROR", str(error), "object_key") from error
        except (OSError, Image.DecompressionBombError, SyntaxError, OverflowError) as error:
            raise AppError(
                422, "VALIDATION_ERROR", "Не удалось прочитать фото", "object_key"
            ) from error

        await storage_call(storage.delete, object_key)
        await self.session.commit()
        return ConfirmResult(photo_key=photo_key, url=storage.public_url(photo_key))

    async def validate_photos(self, user_id: int, photos: Sequence[tuple[str, str]]) -> None:
        storage = await storage_call(get_storage)
        for key, field in sorted(dict(photos).items()):
            if not fullmatch(rf"photos/{user_id}/[0-9a-f]{{32}}\.jpg", key):
                raise AppError(
                    422, "VALIDATION_ERROR", "Укажите ключ своего подтверждённого фото", field
                )
            await self.repo.lock_photo(key)
            if not await storage_call(storage.exists, key):
                raise AppError(422, "VALIDATION_ERROR", "Подтверждённое фото не найдено", field)

    async def cleanup_orphans(self) -> int:
        storage = await storage_call(get_storage)
        cutoff = datetime.now(UTC) - UPLOAD_ORPHAN_AGE
        deleted = 0
        for key in await storage_call(storage.find_old_photos, cutoff):
            photo_key = (
                key.removesuffix("_thumb.jpg") + ".jpg" if key.endswith("_thumb.jpg") else key
            )
            async with self.session.begin():
                await self.repo.lock_photo(photo_key)
                if not await self.repo.is_referenced(photo_key) and await storage_call(
                    storage.is_old, key, cutoff
                ):
                    await storage_call(storage.delete, key)
                    deleted += 1
        return deleted
