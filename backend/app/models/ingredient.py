from sqlalchemy import CheckConstraint, Index, String, UniqueConstraint, text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base

INGREDIENT_NAME_MAX_LENGTH = 160


class Ingredient(Base):
    __tablename__ = "ingredients"
    __table_args__ = (
        CheckConstraint("name = btrim(name) AND name <> ''", name="ck_ingredients_name"),
        UniqueConstraint("wikidata_id", name="uq_ingredients_wikidata_id"),
        Index(
            "uq_ingredients_normalized_name",
            text("replace(lower(name), 'ё', 'е')"),
            unique=True,
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(INGREDIENT_NAME_MAX_LENGTH))
    wikidata_id: Mapped[str | None] = mapped_column(String(20))
