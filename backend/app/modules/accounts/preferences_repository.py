from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.user_diet_preference import UserDietPreference


class PreferencesRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_diet_tags(self, user_id: int) -> list[int]:
        result = await self.session.scalars(
            select(UserDietPreference.diet_tag_id)
            .where(UserDietPreference.user_id == user_id)
            .order_by(UserDietPreference.diet_tag_id)
        )
        return list(result)

    async def lock_user(self, user_id: int) -> bool:
        return (
            await self.session.scalar(select(User.id).where(User.id == user_id).with_for_update())
            is not None
        )

    async def replace(self, user_id: int, diet_tags: list[int]) -> None:
        await self.session.execute(
            delete(UserDietPreference).where(UserDietPreference.user_id == user_id)
        )
        self.session.add_all(
            [UserDietPreference(user_id=user_id, diet_tag_id=tag) for tag in diet_tags]
        )
