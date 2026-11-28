from typing import Annotated

from fastapi import APIRouter, Path, Query

from app.core.constants import POSTGRES_INTEGER_MAX
from app.core.deps import SessionDep
from app.core.errors import ErrorBody
from app.modules.search.schemas import RecipeDetail, SearchPage, SearchParams
from app.modules.search.service import SearchService
from app.modules.search.validation import SearchRoute

router = APIRouter(
    prefix="/recipes",
    tags=["Поиск"],
    route_class=SearchRoute,
    responses={422: {"model": ErrorBody}},
)


@router.get("")
async def search_recipes(
    params: Annotated[SearchParams, Query()], session: SessionDep
) -> SearchPage:
    return await SearchService(session).search(params)


@router.get("/{recipe_id}", responses={404: {"model": ErrorBody}})
async def get_recipe(
    recipe_id: Annotated[int, Path(gt=0, le=POSTGRES_INTEGER_MAX)],
    session: SessionDep,
) -> RecipeDetail:
    return await SearchService(session).get_detail(recipe_id)
