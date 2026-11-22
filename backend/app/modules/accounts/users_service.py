from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import unauthorized
from app.modules.accounts.preferences_service import PreferencesService
from app.modules.accounts.users_repository import UsersRepository
from app.modules.accounts.users_schemas import UserProfile


class UsersService:
    def __init__(self, session: AsyncSession):
        self.repo = UsersRepository(session)
        self.preferences = PreferencesService(session)

    async def get_profile(self, user_id: int) -> UserProfile:
        user = await self.repo.get(user_id)
        if user is None:
            raise unauthorized()
        diet_tags = await self.preferences.get_diet_tags(user_id)
        return UserProfile(id=user.id, login=user.login, diet_tags=diet_tags)
