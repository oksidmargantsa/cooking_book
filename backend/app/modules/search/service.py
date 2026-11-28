from hashlib import sha256

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import cache_get, cache_set, get_catalog_version
from app.core.constants import CATALOG_CACHE_TTL_SECONDS
from app.core.errors import not_found
from app.modules.search.repository import SearchRepository
from app.modules.search.schemas import RecipeDetail, SearchPage, SearchParams


class SearchService:
    def __init__(self, session: AsyncSession):
        self.repo = SearchRepository(session)

    async def search(self, params: SearchParams) -> SearchPage:
        version = await get_catalog_version()
        key = f"cat:v{version}:search:{sha256(params.model_dump_json().encode()).hexdigest()}"
        if version:
            cached = await cache_get(key)
            if cached is not None:
                return SearchPage.model_validate(cached)

        items, total = await self.repo.search(params)
        page = SearchPage(items=items, total=total, page=params.page, per_page=params.per_page)
        if version:
            await cache_set(key, page.model_dump(mode="json"), CATALOG_CACHE_TTL_SECONDS)
        return page

    async def get_detail(self, recipe_id: int) -> RecipeDetail:
        version = await get_catalog_version()
        key = f"cat:v{version}:recipe:{recipe_id}"
        if version:
            cached = await cache_get(key)
            if cached is not None:
                return RecipeDetail.model_validate(cached)

        recipe = await self.repo.get_detail(recipe_id)
        if recipe is None:
            raise not_found("Рецепт не найден", "id")
        if version:
            await cache_set(key, recipe.model_dump(mode="json"), CATALOG_CACHE_TTL_SECONDS)
        return recipe
