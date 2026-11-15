from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_session
from app.core.errors import unauthorized
from app.core.security import decode_access_token

_bearer = HTTPBearer(auto_error=False)

SessionDep = Annotated[AsyncSession, Depends(get_session)]


async def get_current_user_id(
    creds: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> int:
    """id пользователя из access-токена; обращения к БД нет (HLD, раздел 10)."""
    if creds is None:
        raise unauthorized()
    return decode_access_token(creds.credentials)


CurrentUserId = Annotated[int, Depends(get_current_user_id)]
