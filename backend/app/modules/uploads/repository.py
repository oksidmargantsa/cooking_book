from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.recipe import Recipe, RecipeStep


class UploadsRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def lock_photo(self, photo_key: str) -> None:
        await self.session.execute(
            select(func.pg_advisory_xact_lock(func.hashtextextended(photo_key, 0)))
        )

    async def is_referenced(self, photo_key: str) -> bool:
        recipe = select(Recipe.id).where(Recipe.photo_key == photo_key).exists()
        step = select(RecipeStep.id).where(RecipeStep.photo_key == photo_key).exists()
        return bool(await self.session.scalar(select(recipe | step)))
