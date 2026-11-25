from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, Field, field_validator

from app.core.constants import (
    DEFAULT_PER_PAGE,
    MAX_PER_PAGE,
    POSTGRES_INTEGER_MAX,
    SEARCH_MAX_CUISINES,
    SEARCH_Q_MAX_LEN,
    SEARCH_Q_MIN_LEN,
)
from app.schemas.recipe_card import RecipeCard

DictionaryId = Annotated[int, Field(gt=0, le=POSTGRES_INTEGER_MAX)]


class SearchParams(BaseModel):
    ingredients: list[DictionaryId] = Field(default_factory=list)
    cook_time_range_id: DictionaryId | None = None
    cuisines: list[DictionaryId] = Field(default_factory=list, max_length=SEARCH_MAX_CUISINES)
    diet_tags: list[DictionaryId] = Field(default_factory=list)
    dish_categories: list[DictionaryId] = Field(default_factory=list)
    q: str | None = None
    page: int = Field(default=1, ge=1, le=POSTGRES_INTEGER_MAX)
    per_page: int = Field(default=DEFAULT_PER_PAGE, ge=1, le=MAX_PER_PAGE)

    @field_validator("ingredients", "cuisines", "diet_tags", "dish_categories")
    @classmethod
    def normalize_ids(cls, values: list[int]) -> list[int]:
        return sorted(set(values))

    @field_validator("q")
    @classmethod
    def normalize_query(cls, value: str | None) -> str | None:
        query = value.strip() if value is not None else ""
        if not query:
            return None
        if not SEARCH_Q_MIN_LEN <= len(query) <= SEARCH_Q_MAX_LEN:
            raise ValueError(f"Введите от {SEARCH_Q_MIN_LEN} до {SEARCH_Q_MAX_LEN} символов")
        if "\x00" in query:
            raise ValueError("Строка поиска содержит недопустимый символ")
        return query.lower()


class SearchPage(BaseModel):
    items: list[RecipeCard]
    total: int
    page: int
    per_page: int


class RecipeStepDetail(BaseModel):
    step_no: int
    description: str
    photo_key: str | None


class RecipeDetail(RecipeCard):
    ingredients: list[int]
    diet_tags: list[int]
    dish_categories: list[int]
    cuisine_id: int | None
    recipe_steps: list[RecipeStepDetail]
    created_at: datetime
    updated_at: datetime
