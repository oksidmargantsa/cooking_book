from typing import Annotated

from pydantic import BaseModel, Field, StringConstraints, field_validator

from app.core.constants import (
    POSTGRES_INTEGER_MAX,
    RECIPE_MAX_CATEGORIES,
    RECIPE_MAX_DIET_TAGS,
    RECIPE_MAX_INGREDIENTS,
    RECIPE_MAX_STEPS,
    RECIPE_SERVINGS_MAX,
    RECIPE_SERVINGS_MIN,
    RECIPE_TITLE_MAX_LEN,
    RECIPE_TITLE_MIN_LEN,
    STEP_DESCRIPTION_MAX_LEN,
    UPLOAD_MAX_KEY_LEN,
)

DictionaryId = Annotated[int, Field(strict=True, gt=0, le=POSTGRES_INTEGER_MAX)]
PhotoKey = Annotated[str, StringConstraints(min_length=1, max_length=UPLOAD_MAX_KEY_LEN)]


class RecipeStepInput(BaseModel):
    step_no: int = Field(strict=True, ge=1, le=RECIPE_MAX_STEPS)
    description: Annotated[
        str,
        StringConstraints(strip_whitespace=True, min_length=1, max_length=STEP_DESCRIPTION_MAX_LEN),
    ]
    photo_key: PhotoKey | None = None


class RecipeInput(BaseModel):
    title: Annotated[
        str,
        StringConstraints(
            strip_whitespace=True, min_length=RECIPE_TITLE_MIN_LEN, max_length=RECIPE_TITLE_MAX_LEN
        ),
    ]
    ingredients: list[DictionaryId] = Field(min_length=1, max_length=RECIPE_MAX_INGREDIENTS)
    photo_key: PhotoKey | None = None
    diet_tags: list[DictionaryId] = Field(default_factory=list, max_length=RECIPE_MAX_DIET_TAGS)
    dish_categories: list[DictionaryId] = Field(
        default_factory=list, max_length=RECIPE_MAX_CATEGORIES
    )
    cuisine_id: DictionaryId | None = None
    cook_time_range_id: DictionaryId
    servings: int = Field(strict=True, ge=RECIPE_SERVINGS_MIN, le=RECIPE_SERVINGS_MAX)
    recipe_steps: list[RecipeStepInput] = Field(min_length=1, max_length=RECIPE_MAX_STEPS)

    @field_validator("ingredients", "diet_tags", "dish_categories")
    @classmethod
    def validate_unique_ids(cls, ids: list[int]) -> list[int]:
        if len(ids) != len(set(ids)):
            raise ValueError("Элементы списка не должны повторяться")
        return ids

    @field_validator("recipe_steps")
    @classmethod
    def validate_step_numbers(cls, steps: list[RecipeStepInput]) -> list[RecipeStepInput]:
        if sorted(step.step_no for step in steps) != list(range(1, len(steps) + 1)):
            raise ValueError("Номера шагов должны идти подряд, начиная с 1")
        return steps


class RecipeResult(BaseModel):
    id: int
