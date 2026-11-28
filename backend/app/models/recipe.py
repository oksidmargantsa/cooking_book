from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.constants import (
    RECIPE_MAX_STEPS,
    RECIPE_SERVINGS_MAX,
    RECIPE_SERVINGS_MIN,
    RECIPE_TITLE_MAX_LEN,
    RECIPE_TITLE_MIN_LEN,
    STEP_DESCRIPTION_MAX_LEN,
)
from app.models.base import Base


class Recipe(Base):
    __tablename__ = "recipes"
    __table_args__ = (
        CheckConstraint(
            f"char_length(title) BETWEEN {RECIPE_TITLE_MIN_LEN} AND {RECIPE_TITLE_MAX_LEN}",
            name="ck_recipes_title_len",
        ),
        CheckConstraint(
            f"servings BETWEEN {RECIPE_SERVINGS_MIN} AND {RECIPE_SERVINGS_MAX}",
            name="ck_recipes_servings",
        ),
        Index("ix_recipes_author_id_id", "author_id", "id"),
        Index("ix_recipes_cook_time_range_id", "cook_time_range_id"),
        Index("ix_recipes_cuisine_id", "cuisine_id"),
        Index("ix_recipes_photo_key", "photo_key"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(RECIPE_TITLE_MAX_LEN))
    photo_key: Mapped[str | None] = mapped_column(String)
    servings: Mapped[int]
    cook_time_range_id: Mapped[int]
    cuisine_id: Mapped[int | None]
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"

    recipe_id: Mapped[int] = mapped_column(
        ForeignKey("recipes.id", ondelete="CASCADE"), primary_key=True
    )
    ingredient_id: Mapped[int] = mapped_column(ForeignKey("ingredients.id"), primary_key=True)


class RecipeStep(Base):
    __tablename__ = "recipe_steps"
    __table_args__ = (
        CheckConstraint(
            f"step_no BETWEEN 1 AND {RECIPE_MAX_STEPS}", name="ck_recipe_steps_step_no"
        ),
        CheckConstraint(
            f"char_length(description) BETWEEN 1 AND {STEP_DESCRIPTION_MAX_LEN}",
            name="ck_recipe_steps_description_len",
        ),
        UniqueConstraint("recipe_id", "step_no", name="uq_recipe_steps_recipe_id_step_no"),
        Index("ix_recipe_steps_photo_key", "photo_key"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id", ondelete="CASCADE"))
    step_no: Mapped[int]
    description: Mapped[str] = mapped_column(Text)
    photo_key: Mapped[str | None] = mapped_column(String)


class RecipeCategory(Base):
    __tablename__ = "recipe_categories"

    recipe_id: Mapped[int] = mapped_column(
        ForeignKey("recipes.id", ondelete="CASCADE"), primary_key=True
    )
    category_id: Mapped[int] = mapped_column(primary_key=True)


class RecipeDietTag(Base):
    __tablename__ = "recipe_diet_tags"

    recipe_id: Mapped[int] = mapped_column(
        ForeignKey("recipes.id", ondelete="CASCADE"), primary_key=True
    )
    diet_tag_id: Mapped[int] = mapped_column(primary_key=True)
