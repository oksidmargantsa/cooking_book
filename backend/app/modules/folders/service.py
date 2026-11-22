from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import (
    FAVORITES_FOLDER_NAME,
    MAX_FAVORITES_RECIPES,
    MAX_FOLDER_RECIPES,
    MAX_USER_FOLDERS,
)
from app.core.errors import AppError, forbidden, not_found
from app.models import Folder
from app.modules.folders.repository import FoldersRepository
from app.schemas.recipe_card import RecipeCard


class FoldersService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = FoldersRepository(session)

    # ---------- вызывается из accounts ----------
    async def create_default(self, user_id: int) -> Folder:
        """Создаёт «Избранное». Не коммитит: коммит делает регистрация (одна транзакция)."""
        return await self.repo.create(user_id, FAVORITES_FOLDER_NAME, is_default=True)

    # ---------- папки ----------
    async def list_folders(self, user_id: int) -> list[Folder]:
        return list(await self.repo.list_by_user(user_id))

    async def create_folder(self, user_id: int, name: str) -> Folder:
        await self.repo.lock_owner(user_id)
        if await self.repo.count_custom(user_id) >= MAX_USER_FOLDERS:
            raise AppError(
                422, "FOLDERS_LIMIT_EXCEEDED", f"Нельзя создать больше {MAX_USER_FOLDERS} папок"
            )
        folder = await self.repo.create(user_id, name)
        await self.session.commit()
        return folder

    async def rename_folder(self, user_id: int, folder_id: int, name: str) -> Folder:
        folder = await self._get_owned(folder_id, user_id)
        if folder.is_default:
            raise forbidden(f"Папку «{FAVORITES_FOLDER_NAME}» нельзя переименовать")
        folder.name = name
        await self.session.commit()
        return folder

    async def delete_folder(self, user_id: int, folder_id: int) -> None:
        folder = await self._get_owned(folder_id, user_id)
        if folder.is_default:
            raise forbidden(f"Папку «{FAVORITES_FOLDER_NAME}» нельзя удалить")
        await self.repo.delete(folder.id)
        await self.session.commit()

    # ---------- рецепты в папках ----------
    async def add_recipe(self, user_id: int, folder_id: int, recipe_id: int) -> None:
        """Идемпотентно добавляет рецепт в выбранную папку."""
        await self.repo.lock_owner(user_id)
        folder = await self._get_owned(folder_id, user_id)
        if not await self.repo.recipe_exists(recipe_id):
            raise not_found("Рецепт не найден", "recipe_id")

        if await self.repo.has_recipe(folder.id, recipe_id):
            return

        if folder.is_default:
            await self._ensure_favorites_capacity(folder.id)
        elif await self.repo.count_recipes(folder.id) >= MAX_FOLDER_RECIPES:
            raise AppError(
                422,
                "FOLDER_RECIPES_LIMIT_EXCEEDED",
                f"В папке не может быть больше {MAX_FOLDER_RECIPES} рецептов",
            )

        try:
            await self.repo.add_recipe(folder.id, recipe_id)
            await self.session.commit()
        except IntegrityError:
            # рецепт удалили между проверкой и вставкой (FK)
            await self.session.rollback()
            raise not_found("Рецепт не найден", "recipe_id") from None

    async def remove_recipe(self, user_id: int, folder_id: int, recipe_id: int) -> None:
        """Идемпотентно удаляет рецепт из выбранной папки."""
        await self.repo.lock_owner(user_id)
        folder = await self._get_owned(folder_id, user_id)
        await self.repo.remove_recipe(folder.id, recipe_id)
        await self.session.commit()

    async def list_recipes(self, user_id: int, folder_id: int, page: int, per_page: int) -> dict:
        folder = await self._get_owned(folder_id, user_id)
        total = await self.repo.count_recipes(folder.id)
        rows = await self.repo.list_recipes(folder.id, limit=per_page, offset=(page - 1) * per_page)
        return {
            "items": [RecipeCard(**row) for row in rows],
            "total": total,
            "page": page,
            "per_page": per_page,
        }

    # ---------- внутреннее ----------
    async def _get_owned(self, folder_id: int, user_id: int) -> Folder:
        # чужая папка неотличима от несуществующей — не раскрываем её наличие
        folder = await self.repo.get_owned(folder_id, user_id)
        if folder is None:
            raise not_found("Папка не найдена", "folder_id")
        return folder

    async def _ensure_favorites_capacity(self, favorites_id: int) -> None:
        if await self.repo.count_recipes(favorites_id) >= MAX_FAVORITES_RECIPES:
            raise AppError(
                422,
                "FAVORITES_LIMIT_EXCEEDED",
                f"В «{FAVORITES_FOLDER_NAME}» не может быть больше {MAX_FAVORITES_RECIPES} рецептов",
            )
