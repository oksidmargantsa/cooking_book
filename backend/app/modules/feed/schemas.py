from pydantic import BaseModel

from app.schemas.recipe_card import RecipeCard


class FeedPage(BaseModel):
    items: list[RecipeCard]
    next_cursor: str | None


class FeedBlock(BaseModel):
    ids: list[int]
    next_cursor: str | None
