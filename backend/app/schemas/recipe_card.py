"""Общий DTO карточки рецепта (поиск, лента, «мои рецепты», папки) — по спецификации API.
Принадлежит Dev 1; здесь копия для модуля папок, при слиянии оставить один файл."""

from pydantic import BaseModel


class RecipeCard(BaseModel):
    id: int
    author_id: int
    title: str
    photo_key: str | None
    cook_time_range_id: int
    servings: int
