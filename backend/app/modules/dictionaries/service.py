import re
from collections.abc import Sequence
from hashlib import sha256
from unicodedata import normalize

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import cache_get, cache_set, get_catalog_version
from app.core.constants import CATALOG_CACHE_TTL_SECONDS, DICTIONARY_CACHE_TTL_SECONDS
from app.models.dictionary import (
    CookTimeRange,
    Cuisine,
    DictionaryModel,
    DietTag,
    DishCategory,
    Ingredient,
)
from app.modules.dictionaries.repository import DictionariesRepository
from app.modules.dictionaries.schemas import DictionaryResponse

_WORDS = re.compile(r"[^\W_]+")


class DictionariesService:
    def __init__(self, session: AsyncSession):
        self.repo = DictionariesRepository(session)

    async def list_items(
        self, model: DictionaryModel, *, words: Sequence[str] = ()
    ) -> DictionaryResponse:
        version = await get_catalog_version()
        key = f"cat:v{version}:dict:{model.__tablename__}"
        if words:
            key += f":{sha256(' '.join(words).encode()).hexdigest()}"
        if version:
            cached = await cache_get(key)
            if cached is not None:
                return DictionaryResponse.model_validate(cached)

        if model is Ingredient:
            items = await self.repo.list_ingredients(words)
        else:
            items = await self.repo.list_items(model)
        response = DictionaryResponse(items=items)
        if version:
            ttl = CATALOG_CACHE_TTL_SECONDS if words else DICTIONARY_CACHE_TTL_SECONDS
            await cache_set(key, response.model_dump(mode="json"), ttl)
        return response

    async def list_ingredients(self, q: str | None) -> DictionaryResponse:
        query = normalize("NFC", (q or "").strip().lower())
        words = _WORDS.findall(query)
        if query and not words:
            return DictionaryResponse(items=[])
        return await self.list_items(Ingredient, words=words)

    async def find_missing_ids(
        self,
        *,
        ingredients: Sequence[int] = (),
        cuisines: Sequence[int] = (),
        diet_tags: Sequence[int] = (),
        dish_categories: Sequence[int] = (),
        cook_time_ranges: Sequence[int] = (),
    ) -> dict[str, list[int]]:
        dictionaries = (
            (Ingredient, ingredients),
            (Cuisine, cuisines),
            (DietTag, diet_tags),
            (DishCategory, dish_categories),
            (CookTimeRange, cook_time_ranges),
        )
        return {
            model.__tablename__: await self.repo.find_missing_ids(model, ids)
            for model, ids in dictionaries
        }
