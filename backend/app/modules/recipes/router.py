from typing import Annotated

from fastapi import APIRouter, Path, Response

from app.core.constants import POSTGRES_INTEGER_MAX
from app.core.deps import CurrentUserId, SessionDep
from app.modules.recipes.schemas import RecipeInput, RecipeResult
from app.modules.recipes.service import RecipeService

router = APIRouter(prefix="/recipes", tags=["Рецепты автора"])
RecipeId = Annotated[int, Path(gt=0, le=POSTGRES_INTEGER_MAX)]


@router.post("", status_code=201)
async def create(data: RecipeInput, user_id: CurrentUserId, session: SessionDep) -> RecipeResult:
    return RecipeResult(id=await RecipeService(session).create(user_id, data))


@router.put("/{recipe_id}")
async def update(
    recipe_id: RecipeId, data: RecipeInput, user_id: CurrentUserId, session: SessionDep
) -> RecipeResult:
    return RecipeResult(id=await RecipeService(session).update(recipe_id, user_id, data))


@router.delete("/{recipe_id}", status_code=204)
async def delete(recipe_id: RecipeId, user_id: CurrentUserId, session: SessionDep) -> Response:
    await RecipeService(session).delete(recipe_id, user_id)
    return Response(status_code=204)
