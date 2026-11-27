from collections.abc import Sequence

from sqlalchemy import func, literal_column, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import DICT_INGREDIENTS_LIMIT
from app.models.dictionary import DictionaryModel, Ingredient
from app.modules.dictionaries.schemas import DictionaryItem

_RUSSIAN = literal_column("'russian'::regconfig")


class DictionariesRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list_items(self, model: DictionaryModel) -> list[DictionaryItem]:
        result = await self.session.execute(select(model.id, model.name).order_by(model.id))
        return [DictionaryItem(id=id_, name=name) for id_, name in result]

    async def list_ingredients(self, words: Sequence[str]) -> list[DictionaryItem]:
        statement = select(Ingredient.id, Ingredient.name).order_by(
            func.lower(Ingredient.name), Ingredient.id
        )
        if words:
            query = func.to_tsquery(_RUSSIAN, " & ".join(words) + ":*")
            vector = func.to_tsvector(_RUSSIAN, Ingredient.name)
            statement = statement.where(vector.bool_op("@@")(query)).limit(DICT_INGREDIENTS_LIMIT)
        result = await self.session.execute(statement)
        return [DictionaryItem(id=id_, name=name) for id_, name in result]

    async def find_missing_ids(self, model: DictionaryModel, ids: Sequence[int]) -> list[int]:
        if not ids:
            return []
        unique_ids = dict.fromkeys(ids)
        existing = await self.session.scalars(select(model.id).where(model.id.in_(unique_ids)))
        known_ids = set(existing)
        return [id_ for id_ in unique_ids if id_ not in known_ids]
