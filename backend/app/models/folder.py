from datetime import datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    String,
    false,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.constants import FOLDER_NAME_MAX_LEN, FOLDER_NAME_MIN_LEN
from app.models.base import Base


class Folder(Base):
    """Папка. «Избранное» — обычная строка с is_default = true, создаётся при регистрации."""

    __tablename__ = "folders"
    __table_args__ = (
        CheckConstraint(
            f"char_length(name) BETWEEN {FOLDER_NAME_MIN_LEN} AND {FOLDER_NAME_MAX_LEN}",
            name="ck_folders_name_len",
        ),
        Index("ix_folders_user_id", "user_id"),
        # у пользователя ровно одно «Избранное»
        Index(
            "uq_folders_one_default_per_user",
            "user_id",
            unique=True,
            postgresql_where=text("is_default"),
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(FOLDER_NAME_MAX_LEN))
    is_default: Mapped[bool] = mapped_column(Boolean, server_default=false())
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class FolderRecipe(Base):
    __tablename__ = "folder_recipes"
    __table_args__ = (
        # нужен для каскада при удалении рецепта (PK начинается с folder_id)
        Index("ix_folder_recipes_recipe_id", "recipe_id"),
    )

    folder_id: Mapped[int] = mapped_column(
        ForeignKey("folders.id", ondelete="CASCADE"), primary_key=True
    )
    recipe_id: Mapped[int] = mapped_column(
        ForeignKey("recipes.id", ondelete="CASCADE"), primary_key=True
    )
    added_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
