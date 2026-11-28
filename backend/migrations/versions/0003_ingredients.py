import sqlalchemy as sa
from alembic import op

revision = "0003_ingredients"
down_revision = "0002_recipe_membership"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "ingredients",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(160), nullable=False),
        sa.Column("wikidata_id", sa.String(20)),
        sa.CheckConstraint("name = btrim(name) AND name <> ''", name="ck_ingredients_name"),
        sa.UniqueConstraint("wikidata_id", name="uq_ingredients_wikidata_id"),
        if_not_exists=True,
    )
    op.create_index(
        "uq_ingredients_normalized_name",
        "ingredients",
        [sa.text("replace(lower(name), 'ё', 'е')")],
        unique=True,
        if_not_exists=True,
    )


def downgrade() -> None:
    op.drop_table("ingredients")
