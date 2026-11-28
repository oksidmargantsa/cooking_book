import os
from unittest import IsolatedAsyncioTestCase, TestCase, skipUnless

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

from app.models import Ingredient
from app.modules.catalog.ingredient_seed import (
    SNAPSHOT,
    IngredientRow,
    insert_ingredients,
    load_snapshot,
    name_key,
    parse_wikidata_rows,
)

TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL", "")


class IngredientCatalogTest(TestCase):
    def test_wikidata_csv_keeps_most_used_russian_name(self) -> None:
        lines = [
            "item,name,uses\n",
            "http://www.wikidata.org/entity/Q1,  Чёрный  перец ,10\n",
            "http://www.wikidata.org/entity/Q2,черный перец,3\n",
            'http://www.wikidata.org/entity/Q3,"Сливки, 20%",2\n',
            "http://www.wikidata.org/entity/Q4,Untranslated,1\n",
        ]

        self.assertEqual(
            parse_wikidata_rows(lines),
            [
                {"wikidata_id": "Q3", "name": "Сливки, 20%"},
                {"wikidata_id": "Q1", "name": "Чёрный перец"},
            ],
        )

    def test_snapshot_contains_unique_identifiers_and_names(self) -> None:
        ingredients = load_snapshot(SNAPSHOT)
        names = {name_key(row["name"]) for row in ingredients}
        self.assertEqual(len({row["wikidata_id"] for row in ingredients}), len(ingredients))
        self.assertEqual(len(names), len(ingredients))
        self.assertTrue({"картофель", "морковь", "молоко", "поваренная соль"} <= names)


@skipUnless(TEST_DATABASE_URL, "Set TEST_DATABASE_URL to a migrated PostgreSQL test database")
class PostgreSQLIngredientTest(IsolatedAsyncioTestCase):
    async def test_reimport_preserves_rows_and_rejects_normalized_duplicates(self) -> None:
        engine = create_async_engine(TEST_DATABASE_URL)
        self.addAsyncCleanup(engine.dispose)
        ingredients: list[IngredientRow] = [{"wikidata_id": "Q999999998", "name": "Тестовый мёд"}]

        async with AsyncSession(engine) as session:
            self.assertEqual(await insert_ingredients(session, ingredients), 1)
            self.assertEqual(await insert_ingredients(session, ingredients), 0)
            name = await session.scalar(select(Ingredient.name).filter_by(wikidata_id="Q999999998"))
            self.assertEqual(name, "Тестовый мёд")

            with self.assertRaisesRegex(IntegrityError, "uq_ingredients_normalized_name"):
                async with session.begin_nested():
                    session.add(Ingredient(name="ТЕСТОВЫЙ МЕД"))
                    await session.flush()
