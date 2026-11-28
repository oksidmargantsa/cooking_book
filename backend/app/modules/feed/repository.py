from sqlalchemy import Text, cast, func, select, tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import FEED_BLOCK_SIZE
from app.models.recipe import Recipe
from app.modules.feed.cursor import FeedCursor
from app.schemas.recipe_card import RecipeCard

_CARD_COLUMNS = tuple(getattr(Recipe, name) for name in RecipeCard.model_fields)


class FeedRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list_block(
        self, seed: str, after: FeedCursor | None
    ) -> tuple[list[RecipeCard], FeedCursor | None]:
        recipe_hash = func.md5(cast(Recipe.id, Text) + seed)
        statement = (
            select(*_CARD_COLUMNS, recipe_hash.label("recipe_hash"))
            .order_by(recipe_hash, Recipe.id)
            .limit(FEED_BLOCK_SIZE + 1)
        )
        if after is not None:
            statement = statement.where(
                tuple_(recipe_hash, Recipe.id) > tuple_(after.last_hash, after.last_id)
            )
        rows = (await self.session.execute(statement)).mappings().all()
        items = [RecipeCard.model_validate(row) for row in rows[:FEED_BLOCK_SIZE]]
        if len(rows) <= FEED_BLOCK_SIZE:
            return items, None
        last = rows[FEED_BLOCK_SIZE - 1]
        return items, FeedCursor(seed=seed, last_hash=last["recipe_hash"], last_id=last["id"])

    async def get_cards(self, ids: list[int]) -> list[RecipeCard]:
        if not ids:
            return []
        rows = await self.session.execute(select(*_CARD_COLUMNS).where(Recipe.id.in_(ids)))
        cards = {row["id"]: RecipeCard.model_validate(row) for row in rows.mappings()}
        return [cards[recipe_id] for recipe_id in ids if recipe_id in cards]
