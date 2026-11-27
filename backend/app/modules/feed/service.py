from hashlib import sha256
from secrets import token_hex

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import cache_get, cache_set, get_catalog_version
from app.core.constants import CATALOG_CACHE_TTL_SECONDS, FEED_SEED_BYTES
from app.modules.feed.cursor import decode_cursor, encode_cursor
from app.modules.feed.repository import FeedRepository
from app.modules.feed.schemas import FeedBlock, FeedPage


class FeedService:
    def __init__(self, session: AsyncSession):
        self.repo = FeedRepository(session)

    async def load(self, cursor: str | None) -> FeedPage:
        if cursor is None:
            items, next_position = await self.repo.list_block(token_hex(FEED_SEED_BYTES), None)
            return FeedPage(
                items=items,
                next_cursor=encode_cursor(next_position) if next_position is not None else None,
            )

        after = decode_cursor(cursor)
        version = await get_catalog_version()
        key = f"cat:v{version}:feed:{sha256(cursor.encode()).hexdigest()}"
        if version:
            cached = await cache_get(key)
            if cached is not None:
                block = FeedBlock.model_validate(cached)
                items = await self.repo.get_cards(block.ids)
                if len(items) == len(block.ids):
                    return FeedPage(items=items, next_cursor=block.next_cursor)

        items, next_position = await self.repo.list_block(after.seed, after)
        next_cursor = encode_cursor(next_position) if next_position is not None else None
        if version:
            block = FeedBlock(ids=[item.id for item in items], next_cursor=next_cursor)
            await cache_set(key, block.model_dump(mode="json"), CATALOG_CACHE_TTL_SECONDS)
        return FeedPage(items=items, next_cursor=next_cursor)
