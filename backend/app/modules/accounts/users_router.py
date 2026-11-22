from fastapi import APIRouter

from app.core.deps import CurrentUserId, SessionDep
from app.core.errors import ErrorBody
from app.modules.accounts.users_schemas import UserProfile
from app.modules.accounts.users_service import UsersService

router = APIRouter(prefix="/users/me", tags=["Профиль"])


@router.get("", responses={401: {"model": ErrorBody}})
async def get_profile(user_id: CurrentUserId, session: SessionDep) -> UserProfile:
    return await UsersService(session).get_profile(user_id)
