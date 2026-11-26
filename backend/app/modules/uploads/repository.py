from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession


class UploadsRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def lock_photo(self, photo_key: str) -> None:
        await self.session.execute(
            select(func.pg_advisory_xact_lock(func.hashtextextended(photo_key, 0)))
        )
