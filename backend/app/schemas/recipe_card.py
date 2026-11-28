from pydantic import BaseModel


class RecipeCard(BaseModel):
    id: int
    author_id: int
    title: str
    photo_key: str | None
    cook_time_range_id: int
    servings: int
