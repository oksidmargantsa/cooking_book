from hashlib import sha256
from typing import Annotated

from fastapi import APIRouter, Header, Response

from app.core.constants import DICTIONARY_CACHE_TTL_SECONDS
from app.core.deps import SessionDep
from app.models.dictionary import CookTimeRange, Cuisine, DictionaryModel, DietTag, DishCategory
from app.modules.dictionaries.schemas import DictionaryResponse
from app.modules.dictionaries.service import DictionariesService

router = APIRouter(prefix="/dictionaries", tags=["Справочники"])
IfNoneMatch = Annotated[str | None, Header()]


async def _small_dictionary(
    model: DictionaryModel, session: SessionDep, if_none_match: str | None, response: Response
) -> DictionaryResponse | Response:
    data = await DictionariesService(session).list_items(model)
    digest = sha256(data.model_dump_json().encode()).hexdigest()
    etag = f'"{digest}"'
    headers = {
        "ETag": etag,
        "Cache-Control": f"public, max-age={DICTIONARY_CACHE_TTL_SECONDS}",
    }
    validators = (value.strip().removeprefix("W/") for value in (if_none_match or "").split(","))
    if any(value in {etag, "*"} for value in validators):
        return Response(status_code=304, headers=headers)

    response.headers.update(headers)
    return data


@router.get("/ingredients")
async def get_ingredients(session: SessionDep, q: str | None = None) -> DictionaryResponse:
    return await DictionariesService(session).list_ingredients(q)


@router.get("/cuisines", response_model=DictionaryResponse, responses={304: {}})
async def get_cuisines(
    session: SessionDep, response: Response, if_none_match: IfNoneMatch = None
) -> DictionaryResponse | Response:
    return await _small_dictionary(Cuisine, session, if_none_match, response)


@router.get("/diet-tags", response_model=DictionaryResponse, responses={304: {}})
async def get_diet_tags(
    session: SessionDep, response: Response, if_none_match: IfNoneMatch = None
) -> DictionaryResponse | Response:
    return await _small_dictionary(DietTag, session, if_none_match, response)


@router.get("/dish-categories", response_model=DictionaryResponse, responses={304: {}})
async def get_dish_categories(
    session: SessionDep, response: Response, if_none_match: IfNoneMatch = None
) -> DictionaryResponse | Response:
    return await _small_dictionary(DishCategory, session, if_none_match, response)


@router.get("/cook-time-ranges", response_model=DictionaryResponse, responses={304: {}})
async def get_cook_time_ranges(
    session: SessionDep, response: Response, if_none_match: IfNoneMatch = None
) -> DictionaryResponse | Response:
    return await _small_dictionary(CookTimeRange, session, if_none_match, response)
