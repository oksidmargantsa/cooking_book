import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import insert

revision = "0002_dictionaries"
down_revision = "0004_recipe_details"
branch_labels = None
depends_on = None

_NAME_MAX_LEN = 30
_CUISINES = (
    "Азиатская кухня",
    "Итальянская кухня",
    "Тайская кухня",
    "Русская кухня",
    "Украинская кухня",
    "Японская кухня",
    "Европейская кухня",
    "Американская кухня",
    "Армянская кухня",
    "Белорусская кухня",
    "Греческая кухня",
    "Грузинская кухня",
    "Индийская кухня",
    "Кавказская кухня",
    "Мексиканская кухня",
    "Немецкая кухня",
    "Средиземноморская кухня",
    "Турецкая кухня",
    "Узбекская кухня",
    "Французская кухня",
)
_DIET_TAGS = (
    "безлактозное",
    "вегетарианское",
    "безглютеновое",
    "веганское",
    "безалкогольное",
)
_DISH_CATEGORIES = ("первое блюдо", "горячее блюдо", "закуска", "салат", "десерт", "напиток")
_COOK_TIME_RANGES = ("до 15 мин", "15-30 мин", "30-60 мин", "больше 60 мин")


def _create_dictionary(name: str, names: tuple[str, ...], max_length: int | None) -> None:
    table = op.create_table(
        name,
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(max_length), nullable=False),
        sa.CheckConstraint("name = btrim(name) AND name <> ''", name=f"ck_{name}_name"),
        sa.UniqueConstraint("name", name=f"uq_{name}_name"),
    )
    values = [
        {"id": op.inline_literal(id_), "name": op.inline_literal(label)}
        for id_, label in enumerate(names, start=1)
    ]
    op.execute(insert(table).values(values).on_conflict_do_nothing())
    sequence = sa.func.pg_get_serial_sequence(op.inline_literal(name), op.inline_literal("id"))
    last_id = sa.select(sa.func.max(table.c.id)).scalar_subquery()
    op.execute(sa.select(sa.func.setval(sequence, last_id)))


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    _create_dictionary("cuisines", _CUISINES, _NAME_MAX_LEN)
    _create_dictionary("diet_tags", _DIET_TAGS, _NAME_MAX_LEN)
    _create_dictionary("dish_categories", _DISH_CATEGORIES, _NAME_MAX_LEN)
    _create_dictionary("cook_time_ranges", _COOK_TIME_RANGES, None)
    op.create_index(
        "ix_ingredients_name_fts",
        "ingredients",
        [sa.text("to_tsvector('russian'::regconfig, name)")],
        postgresql_using="gin",
    )


def downgrade() -> None:
    op.drop_index("ix_ingredients_name_fts", table_name="ingredients")
    op.drop_table("cook_time_ranges")
    op.drop_table("dish_categories")
    op.drop_table("diet_tags")
    op.drop_table("cuisines")
