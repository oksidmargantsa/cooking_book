from types import SimpleNamespace
from unittest import IsolatedAsyncioTestCase
from unittest.mock import AsyncMock

from app.modules.folders.service import FoldersService


class FolderMembershipTest(IsolatedAsyncioTestCase):
    async def test_membership_is_independent_in_each_folder(self) -> None:
        session = AsyncMock()
        service = FoldersService(session)
        recipes: set[tuple[int, int]] = set()
        service.repo = AsyncMock()
        service.repo.get_owned.side_effect = lambda folder_id, _: SimpleNamespace(
            id=folder_id, is_default=folder_id == 1
        )
        service.repo.recipe_exists.return_value = True
        service.repo.count_recipes.return_value = 0
        service.repo.has_recipe.side_effect = lambda folder_id, recipe_id: (
            (
                folder_id,
                recipe_id,
            )
            in recipes
        )
        service.repo.add_recipe.side_effect = lambda folder_id, recipe_id: recipes.add(
            (folder_id, recipe_id)
        )
        service.repo.remove_recipe.side_effect = lambda folder_id, recipe_id: recipes.discard(
            (folder_id, recipe_id)
        )

        await service.add_recipe(7, 2, 42)
        await service.add_recipe(7, 2, 42)
        self.assertEqual(recipes, {(2, 42)})
        service.repo.add_recipe.assert_awaited_once_with(2, 42)

        await service.add_recipe(7, 1, 42)
        self.assertEqual(recipes, {(1, 42), (2, 42)})

        await service.remove_recipe(7, 1, 42)
        await service.remove_recipe(7, 1, 42)
        self.assertEqual(recipes, {(2, 42)})
