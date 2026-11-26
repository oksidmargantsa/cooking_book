import sqlalchemy as sa
from alembic import op

revision = "0002_recipe_membership"
down_revision = "0001_users_auth_folders"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # The development Compose file could already have created these tables from ORM metadata.
    op.create_table(
        "recipes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "author_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("title", sa.String(150), nullable=False),
        sa.Column("photo_key", sa.String()),
        sa.Column("servings", sa.Integer(), nullable=False),
        sa.Column("cook_time_range_id", sa.Integer(), nullable=False),
        sa.Column("cuisine_id", sa.Integer()),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        if_not_exists=True,
    )
    op.create_table(
        "folder_recipes",
        sa.Column(
            "folder_id",
            sa.Integer(),
            sa.ForeignKey("folders.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column(
            "recipe_id",
            sa.Integer(),
            sa.ForeignKey("recipes.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column(
            "added_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        if_not_exists=True,
    )
    op.create_index(
        "ix_folder_recipes_recipe_id", "folder_recipes", ["recipe_id"], if_not_exists=True
    )


def downgrade() -> None:
    op.drop_table("folder_recipes")
    op.drop_table("recipes")
