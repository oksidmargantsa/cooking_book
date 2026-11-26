from typing import Annotated

from fastapi import APIRouter, Query

from app.core.constants import DEFAULT_PER_PAGE, MAX_PER_PAGE, POSTGRES_INTEGER_MAX
from app.core.deps import CurrentUserId, SessionDep
from app.modules.recipes.schemas import RecipePage
from app.modules.recipes.service import RecipeService

router = APIRouter(prefix="/users/me", tags=["Рецепты автора"])


@router.get("/recipes")
async def my_recipes(
    user_id: CurrentUserId,
    session: SessionDep,
    page: Annotated[int, Query(ge=1, le=POSTGRES_INTEGER_MAX)] = 1,
    per_page: Annotated[int, Query(ge=1, le=MAX_PER_PAGE)] = DEFAULT_PER_PAGE,
) -> RecipePage:
    return await RecipeService(session).list_my(user_id, page, per_page)
