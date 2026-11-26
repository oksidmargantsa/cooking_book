from fastapi import APIRouter

from app.core.deps import CurrentUserId, SessionDep
from app.modules.accounts.preferences_schemas import DietPreferences
from app.modules.accounts.preferences_service import PreferencesService

router = APIRouter(prefix="/users/me", tags=["Профиль"])


@router.put("/preferences")
async def set_preferences(
    data: DietPreferences, user_id: CurrentUserId, session: SessionDep
) -> DietPreferences:
    tags = await PreferencesService(session).set_diet_tags(user_id, data.diet_tags)
    return DietPreferences(diet_tags=tags)
