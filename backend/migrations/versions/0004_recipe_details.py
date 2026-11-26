import sqlalchemy as sa
from alembic import op

revision = "0004_recipe_details"
down_revision = "0003_ingredients"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_check_constraint(
        "ck_recipes_title_len", "recipes", "char_length(title) BETWEEN 3 AND 150"
    )
    op.create_check_constraint("ck_recipes_servings", "recipes", "servings BETWEEN 1 AND 1000")
    op.create_index("ix_recipes_author_id_id", "recipes", ["author_id", "id"])
    op.create_index("ix_recipes_cook_time_range_id", "recipes", ["cook_time_range_id"])
    op.create_index("ix_recipes_cuisine_id", "recipes", ["cuisine_id"])
    op.create_index("ix_recipes_photo_key", "recipes", ["photo_key"])
    op.create_table(
        "recipe_ingredients",
        sa.Column(
            "recipe_id",
            sa.Integer(),
            sa.ForeignKey("recipes.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column("ingredient_id", sa.Integer(), sa.ForeignKey("ingredients.id"), primary_key=True),
    )
    op.create_table(
        "recipe_steps",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "recipe_id",
            sa.Integer(),
            sa.ForeignKey("recipes.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("step_no", sa.Integer(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("photo_key", sa.String()),
        sa.CheckConstraint("step_no BETWEEN 1 AND 50", name="ck_recipe_steps_step_no"),
        sa.CheckConstraint(
            "char_length(description) BETWEEN 1 AND 5000", name="ck_recipe_steps_description_len"
        ),
        sa.UniqueConstraint("recipe_id", "step_no", name="uq_recipe_steps_recipe_id_step_no"),
    )
    op.create_index("ix_recipe_steps_photo_key", "recipe_steps", ["photo_key"])
    op.create_table(
        "recipe_categories",
        sa.Column(
            "recipe_id",
            sa.Integer(),
            sa.ForeignKey("recipes.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column("category_id", sa.Integer(), primary_key=True),
    )
    op.create_table(
        "recipe_diet_tags",
        sa.Column(
            "recipe_id",
            sa.Integer(),
            sa.ForeignKey("recipes.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column("diet_tag_id", sa.Integer(), primary_key=True),
    )
    op.create_table(
        "user_diet_preferences",
        sa.Column(
            "user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
        ),
        sa.Column("diet_tag_id", sa.Integer(), primary_key=True),
    )
    op.create_index(
        "ix_user_diet_preferences_diet_tag_id", "user_diet_preferences", ["diet_tag_id"]
    )


def downgrade() -> None:
    op.drop_table("user_diet_preferences")
    op.drop_table("recipe_diet_tags")
    op.drop_table("recipe_categories")
    op.drop_table("recipe_steps")
    op.drop_table("recipe_ingredients")
    op.drop_index("ix_recipes_photo_key", table_name="recipes")
    op.drop_index("ix_recipes_cuisine_id", table_name="recipes")
    op.drop_index("ix_recipes_cook_time_range_id", table_name="recipes")
    op.drop_index("ix_recipes_author_id_id", table_name="recipes")
    op.drop_constraint("ck_recipes_servings", "recipes", type_="check")
    op.drop_constraint("ck_recipes_title_len", "recipes", type_="check")
