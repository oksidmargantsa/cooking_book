from fastapi import APIRouter

from app.core.deps import SessionDep
from app.core.errors import ErrorBody
from app.modules.feed.schemas import FeedPage
from app.modules.feed.service import FeedService

router = APIRouter(prefix="/feed", tags=["Лента"])


@router.get("", responses={422: {"model": ErrorBody}})
async def get_feed(session: SessionDep, cursor: str | None = None) -> FeedPage:
    return await FeedService(session).load(cursor)
