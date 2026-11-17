from sqlalchemy import CheckConstraint, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.constants import DICTIONARY_NAME_MAX_LEN
from app.models.base import Base
from app.models.ingredient import Ingredient as Ingredient


class Cuisine(Base):
    __tablename__ = "cuisines"
    __table_args__ = (
        CheckConstraint("name = btrim(name) AND name <> ''", name="ck_cuisines_name"),
        UniqueConstraint("name", name="uq_cuisines_name"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(DICTIONARY_NAME_MAX_LEN))


class DietTag(Base):
    __tablename__ = "diet_tags"
    __table_args__ = (
        CheckConstraint("name = btrim(name) AND name <> ''", name="ck_diet_tags_name"),
        UniqueConstraint("name", name="uq_diet_tags_name"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(DICTIONARY_NAME_MAX_LEN))


class DishCategory(Base):
    __tablename__ = "dish_categories"
    __table_args__ = (
        CheckConstraint("name = btrim(name) AND name <> ''", name="ck_dish_categories_name"),
        UniqueConstraint("name", name="uq_dish_categories_name"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(DICTIONARY_NAME_MAX_LEN))


class CookTimeRange(Base):
    __tablename__ = "cook_time_ranges"
    __table_args__ = (
        CheckConstraint("name = btrim(name) AND name <> ''", name="ck_cook_time_ranges_name"),
        UniqueConstraint("name", name="uq_cook_time_ranges_name"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]


type DictionaryModel = type[Ingredient | Cuisine | DietTag | DishCategory | CookTimeRange]
