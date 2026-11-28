from collections.abc import Sequence

from sqlalchemy import delete, func, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Folder, FolderRecipe, Recipe, User


class FoldersRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def lock_owner(self, user_id: int) -> None:
        await self.session.execute(select(User.id).where(User.id == user_id).with_for_update())

    async def list_by_user(self, user_id: int) -> Sequence[Folder]:
        result = await self.session.execute(
            select(Folder)
            .where(Folder.user_id == user_id)
            .order_by(Folder.is_default.desc(), Folder.id)
        )
        return result.scalars().all()

    async def get_owned(self, folder_id: int, user_id: int) -> Folder | None:
        result = await self.session.execute(
            select(Folder).where(Folder.id == folder_id, Folder.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def count_custom(self, user_id: int) -> int:
        result = await self.session.execute(
            select(func.count())
            .select_from(Folder)
            .where(Folder.user_id == user_id, Folder.is_default.is_(False))
        )
        return result.scalar_one()

    async def create(self, user_id: int, name: str, is_default: bool = False) -> Folder:
        folder = Folder(user_id=user_id, name=name, is_default=is_default)
        self.session.add(folder)
        await self.session.flush()
        return folder

    async def delete(self, folder_id: int) -> None:
        await self.session.execute(delete(Folder).where(Folder.id == folder_id))

    async def recipe_exists(self, recipe_id: int) -> bool:
        result = await self.session.execute(select(Recipe.id).where(Recipe.id == recipe_id))
        return result.first() is not None

    async def has_recipe(self, folder_id: int, recipe_id: int) -> bool:
        result = await self.session.execute(
            select(FolderRecipe.recipe_id).where(
                FolderRecipe.folder_id == folder_id, FolderRecipe.recipe_id == recipe_id
            )
        )
        return result.first() is not None

    async def count_recipes(self, folder_id: int) -> int:
        result = await self.session.execute(
            select(func.count())
            .select_from(FolderRecipe)
            .where(FolderRecipe.folder_id == folder_id)
        )
        return result.scalar_one()

    async def add_recipe(self, folder_id: int, recipe_id: int) -> None:
        await self.session.execute(
            pg_insert(FolderRecipe)
            .values(folder_id=folder_id, recipe_id=recipe_id)
            .on_conflict_do_nothing(index_elements=["folder_id", "recipe_id"])
        )

    async def remove_recipe(self, folder_id: int, recipe_id: int) -> None:
        await self.session.execute(
            delete(FolderRecipe).where(
                FolderRecipe.folder_id == folder_id, FolderRecipe.recipe_id == recipe_id
            )
        )

    async def list_recipes(self, folder_id: int, limit: int, offset: int) -> list[dict]:
        result = await self.session.execute(
            select(
                Recipe.id,
                Recipe.author_id,
                Recipe.title,
                Recipe.photo_key,
                Recipe.cook_time_range_id,
                Recipe.servings,
            )
            .join(FolderRecipe, FolderRecipe.recipe_id == Recipe.id)
            .where(FolderRecipe.folder_id == folder_id)
            .order_by(FolderRecipe.added_at.desc(), Recipe.id.desc())
            .limit(limit)
            .offset(offset)
        )
        return [dict(row._mapping) for row in result.all()]
