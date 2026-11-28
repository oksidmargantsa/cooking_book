import asyncio

from app.core.db import engine
from app.models import Base


async def create_schema() -> None:
    try:
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(create_schema())
