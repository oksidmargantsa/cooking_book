from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import AppError, forbidden, not_found
from app.modules.recipes.repository import RecipeRepository
from app.modules.recipes.schemas import RecipeInput
from app.modules.uploads.service import UploadsService

try:
    from app.core.cache import bump_catalog_version
except ModuleNotFoundError as error:
    if error.name != "app.core.cache":
        raise

    async def bump_catalog_version() -> None:
        pass


class RecipeService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = RecipeRepository(session)

    async def create(self, author_id: int, data: RecipeInput) -> int:
        await self._validate(author_id, data)
        recipe = await self.repo.create(author_id, data)
        recipe_id = recipe.id
        await self.session.commit()
        await bump_catalog_version()
        return recipe_id

    async def update(self, recipe_id: int, author_id: int, data: RecipeInput) -> int:
        recipe = await self.repo.get_for_update(recipe_id)
        if recipe is None:
            raise not_found("Рецепт не найден", "recipe_id")
        if recipe.author_id != author_id:
            raise forbidden("Вы не автор рецепта")
        await self._validate(author_id, data)
        await self.repo.replace(recipe, data)
        await self.session.commit()
        await bump_catalog_version()
        return recipe_id

    async def delete(self, recipe_id: int, author_id: int) -> None:
        recipe = await self.repo.get_for_update(recipe_id)
        if recipe is None:
            return
        if recipe.author_id != author_id:
            raise forbidden("Вы не автор рецепта")
        await self.repo.delete(recipe_id)
        await self.session.commit()
        await bump_catalog_version()

    async def _validate(self, author_id: int, data: RecipeInput) -> None:
        from app.modules.dictionaries.service import DictionariesService

        missing = await DictionariesService(self.session).find_missing_ids(
            ingredients=data.ingredients,
            cuisines=() if data.cuisine_id is None else (data.cuisine_id,),
            diet_tags=data.diet_tags,
            dish_categories=data.dish_categories,
            cook_time_ranges=(data.cook_time_range_id,),
        )
        fields = {"cuisines": "cuisine_id", "cook_time_ranges": "cook_time_range_id"}
        for dictionary, ids in missing.items():
            if ids:
                raise AppError(
                    422,
                    "VALIDATION_ERROR",
                    "Значение не найдено в справочнике",
                    fields.get(dictionary, dictionary),
                )
        photos = [(step.photo_key, "recipe_steps") for step in data.recipe_steps if step.photo_key]
        if data.photo_key:
            photos.append((data.photo_key, "photo_key"))
        if photos:
            await UploadsService(self.session).validate_photos(author_id, photos)
