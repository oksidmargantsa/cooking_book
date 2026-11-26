from typing import Annotated

from pydantic import BaseModel, Field, field_validator

from app.core.constants import POSTGRES_INTEGER_MAX, RECIPE_MAX_DIET_TAGS

DietTagId = Annotated[int, Field(strict=True, gt=0, le=POSTGRES_INTEGER_MAX)]


class DietPreferences(BaseModel):
    diet_tags: list[DietTagId] = Field(max_length=RECIPE_MAX_DIET_TAGS)

    @field_validator("diet_tags")
    @classmethod
    def validate_unique_tags(cls, tags: list[int]) -> list[int]:
        if len(tags) != len(set(tags)):
            raise ValueError("Теги питания не должны повторяться")
        return tags
