from pydantic import BaseModel, field_validator

from app.core.constants import FAVORITES_FOLDER_NAME, FOLDER_NAME_MAX_LEN, FOLDER_NAME_MIN_LEN
from app.schemas.recipe_card import RecipeCard


class FolderNameRequest(BaseModel):
    name: str

    @field_validator("name")
    @classmethod
    def _name(cls, v: str) -> str:
        v = v.strip()
        if not FOLDER_NAME_MIN_LEN <= len(v) <= FOLDER_NAME_MAX_LEN:
            raise ValueError(
                f"Название папки должно содержать от {FOLDER_NAME_MIN_LEN} до {FOLDER_NAME_MAX_LEN} символов"
            )
        if v.casefold() == FAVORITES_FOLDER_NAME.casefold():
            raise ValueError(f"Название «{FAVORITES_FOLDER_NAME}» зарезервировано")
        return v


class FolderOut(BaseModel):
    id: int
    user_id: int
    name: str
    is_default: (
        bool  # сверх спецификации: чтобы клиент отличал «Избранное» (его нельзя менять и удалять)
    )


class FolderList(BaseModel):
    items: list[FolderOut]


class FolderCreated(BaseModel):
    id: int


class FolderRenamed(BaseModel):
    id: int
    name: str


class FolderRecipesPage(BaseModel):
    items: list[RecipeCard]
    total: int
    page: int
    per_page: int
