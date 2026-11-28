from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.recipe import Recipe, RecipeCategory, RecipeDietTag, RecipeIngredient, RecipeStep
from app.modules.search.schemas import RecipeDetail, RecipeStepDetail, SearchParams
from app.schemas.recipe_card import RecipeCard


class SearchRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def search(self, params: SearchParams) -> tuple[list[RecipeCard], int]:
        await self.session.connection(execution_options={"isolation_level": "REPEATABLE READ"})
        recipes = select(Recipe.id).select_from(Recipe)
        ordering = [Recipe.id.desc()]

        if params.ingredients:
            matches = (
                select(RecipeIngredient.recipe_id, func.count().label("match_count"))
                .where(RecipeIngredient.ingredient_id.in_(params.ingredients))
                .group_by(RecipeIngredient.recipe_id)
                .subquery()
            )
            recipes = recipes.join(matches, matches.c.recipe_id == Recipe.id)
            ordering.insert(0, matches.c.match_count.desc())
        if params.cook_time_range_id is not None:
            recipes = recipes.where(Recipe.cook_time_range_id == params.cook_time_range_id)
        if params.cuisines:
            recipes = recipes.where(Recipe.cuisine_id.in_(params.cuisines))
        if params.dish_categories:
            categories = select(RecipeCategory.recipe_id).where(
                RecipeCategory.category_id.in_(params.dish_categories)
            )
            recipes = recipes.where(Recipe.id.in_(categories))
        if params.diet_tags:
            diets = (
                select(RecipeDietTag.recipe_id)
                .where(RecipeDietTag.diet_tag_id.in_(params.diet_tags))
                .group_by(RecipeDietTag.recipe_id)
                .having(func.count() == len(params.diet_tags))
            )
            recipes = recipes.where(Recipe.id.in_(diets))
        if params.q is not None:
            recipes = recipes.where(func.lower(Recipe.title).contains(params.q, autoescape=True))

        total = await self.session.scalar(select(func.count()).select_from(recipes.subquery())) or 0
        offset = (params.page - 1) * params.per_page
        if offset >= total:
            return [], total

        cards = (
            recipes.with_only_columns(*(getattr(Recipe, name) for name in RecipeCard.model_fields))
            .order_by(*ordering)
            .limit(params.per_page)
            .offset(offset)
        )
        rows = await self.session.execute(cards)
        return [RecipeCard.model_validate(row) for row in rows.mappings()], total

    async def get_detail(self, recipe_id: int) -> RecipeDetail | None:
        await self.session.connection(execution_options={"isolation_level": "REPEATABLE READ"})
        recipe = await self.session.get(Recipe, recipe_id)
        if recipe is None:
            return None

        ingredients = await self.session.scalars(
            select(RecipeIngredient.ingredient_id)
            .where(RecipeIngredient.recipe_id == recipe_id)
            .order_by(RecipeIngredient.ingredient_id)
        )
        diets = await self.session.scalars(
            select(RecipeDietTag.diet_tag_id)
            .where(RecipeDietTag.recipe_id == recipe_id)
            .order_by(RecipeDietTag.diet_tag_id)
        )
        categories = await self.session.scalars(
            select(RecipeCategory.category_id)
            .where(RecipeCategory.recipe_id == recipe_id)
            .order_by(RecipeCategory.category_id)
        )
        steps = await self.session.scalars(
            select(RecipeStep).where(RecipeStep.recipe_id == recipe_id).order_by(RecipeStep.step_no)
        )
        return RecipeDetail(
            **{name: getattr(recipe, name) for name in RecipeCard.model_fields},
            ingredients=list(ingredients),
            diet_tags=list(diets),
            dish_categories=list(categories),
            cuisine_id=recipe.cuisine_id,
            recipe_steps=[
                RecipeStepDetail.model_validate(step, from_attributes=True) for step in steps
            ],
            created_at=recipe.created_at,
            updated_at=recipe.updated_at,
        )
