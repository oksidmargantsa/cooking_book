import sqlalchemy as sa
from alembic import op

revision = "0005_search_indexes"
down_revision = "0002_dictionaries"
branch_labels = None
depends_on = None

_FILTER_INDEXES = (
    ("recipe_ingredients", "ingredient_id"),
    ("recipe_categories", "category_id"),
    ("recipe_diet_tags", "diet_tag_id"),
)


def upgrade() -> None:
    for table, column in _FILTER_INDEXES:
        op.create_index(f"ix_{table}_{column}_recipe_id", table, [column, "recipe_id"])
    op.create_index(
        "ix_recipes_lower_title_trgm",
        "recipes",
        [sa.text("lower(title) gin_trgm_ops")],
        postgresql_using="gin",
    )


def downgrade() -> None:
    op.drop_index("ix_recipes_lower_title_trgm", table_name="recipes")
    for table, column in reversed(_FILTER_INDEXES):
        op.drop_index(f"ix_{table}_{column}_recipe_id", table_name=table)
