from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import AppError, not_found
from app.modules.accounts.preferences_repository import PreferencesRepository
from app.modules.dictionaries.service import DictionariesService


class PreferencesService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = PreferencesRepository(session)

    async def get_diet_tags(self, user_id: int) -> list[int]:
        return await self.repo.get_diet_tags(user_id)

    async def set_diet_tags(self, user_id: int, diet_tags: list[int]) -> list[int]:
        if not await self.repo.lock_user(user_id):
            raise not_found("Пользователь не найден")
        missing = await DictionariesService(self.session).find_missing_ids(diet_tags=diet_tags)
        if missing.get("diet_tags"):
            raise AppError(422, "VALIDATION_ERROR", "Тег питания не найден", "diet_tags")
        tags = sorted(diet_tags)
        await self.repo.replace(user_id, tags)
        await self.session.commit()
        return tags
