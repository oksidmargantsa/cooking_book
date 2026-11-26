from datetime import UTC, datetime

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.recipe import Recipe, RecipeCategory, RecipeDietTag, RecipeIngredient, RecipeStep
from app.modules.recipes.schemas import RecipeInput
from app.schemas.recipe_card import RecipeCard


class RecipeRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_for_update(self, recipe_id: int) -> Recipe | None:
        return await self.session.scalar(
            select(Recipe).where(Recipe.id == recipe_id).with_for_update()
        )

    async def create(self, author_id: int, data: RecipeInput) -> Recipe:
        recipe = Recipe(author_id=author_id, **self._columns(data))
        self.session.add(recipe)
        await self.session.flush()
        self.add_contents(recipe.id, data)
        return recipe

    async def replace(self, recipe: Recipe, data: RecipeInput) -> None:
        for model in (RecipeIngredient, RecipeStep, RecipeCategory, RecipeDietTag):
            await self.session.execute(delete(model).where(model.recipe_id == recipe.id))
        for name, value in self._columns(data).items():
            setattr(recipe, name, value)
        recipe.updated_at = datetime.now(UTC)
        self.add_contents(recipe.id, data)

    async def delete(self, recipe_id: int) -> None:
        await self.session.execute(delete(Recipe).where(Recipe.id == recipe_id))

    @staticmethod
    def _columns(data: RecipeInput) -> dict:
        return data.model_dump(
            include={"title", "photo_key", "servings", "cook_time_range_id", "cuisine_id"}
        )

    def add_contents(self, recipe_id: int, data: RecipeInput) -> None:
        self.session.add_all(
            [RecipeIngredient(recipe_id=recipe_id, ingredient_id=id_) for id_ in data.ingredients]
            + [RecipeStep(recipe_id=recipe_id, **step.model_dump()) for step in data.recipe_steps]
            + [RecipeCategory(recipe_id=recipe_id, category_id=id_) for id_ in data.dish_categories]
            + [RecipeDietTag(recipe_id=recipe_id, diet_tag_id=id_) for id_ in data.diet_tags]
        )

    async def list_my(
        self, author_id: int, page: int, per_page: int
    ) -> tuple[list[RecipeCard], int]:
        count = select(func.count()).select_from(Recipe).where(Recipe.author_id == author_id)
        total = await self.session.scalar(count) or 0
        offset = (page - 1) * per_page
        if offset >= total:
            return [], total
        result = await self.session.execute(
            select(
                Recipe.id,
                Recipe.author_id,
                Recipe.title,
                Recipe.photo_key,
                Recipe.cook_time_range_id,
                Recipe.servings,
            )
            .where(Recipe.author_id == author_id)
            .order_by(Recipe.id.desc())
            .offset(offset)
            .limit(per_page)
        )
        return [RecipeCard(**row) for row in result.mappings()], total
