from datetime import datetime, timezone

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import REFRESH_TOKEN_TTL
from app.core.errors import AppError, unauthorized
from app.core.security import (
    DUMMY_HASH,
    create_access_token,
    generate_refresh_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)
from app.models import User
from app.modules.accounts.auth_repository import AuthRepository
from app.modules.folders.service import FoldersService


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _login_exists() -> AppError:
    return AppError(409, "LOGIN_EXISTS", "Пользователь с таким логином уже существует", "login")


class AuthService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = AuthRepository(session)
        self.folders = FoldersService(session)  # модули общаются только через сервисы

    async def register(self, login: str, password: str) -> User:
        """Пользователь и папка «Избранное» создаются в одной транзакции (F_Auth_1)."""
        if await self.repo.get_user_by_login(login) is not None:
            raise _login_exists()

        password_hash = await hash_password(password)  # до транзакции записи — чтобы не держать её
        try:
            user = await self.repo.create_user(login, password_hash)
            await self.folders.create_default(user.id)
            await self.session.commit()
        except IntegrityError as exc:
            await self.session.rollback()
            if "uq_users_login" in str(exc.orig):  # гонка двух регистраций с одним логином
                raise _login_exists() from None
            raise
        return user

    async def login(self, login: str, password: str) -> tuple[str, str]:
        user = await self.repo.get_user_by_login(login)
        # Хеш проверяем всегда, чтобы время ответа не выдавало существование логина.
        password_ok = await verify_password(user.password_hash if user else DUMMY_HASH, password)
        if user is None or not password_ok:
            raise AppError(401, "INVALID_CREDENTIALS", "Неверный логин или пароль")

        refresh_raw, refresh_hash = generate_refresh_token()
        await self.repo.add_refresh_token(user.id, refresh_hash, _now() + REFRESH_TOKEN_TTL)
        await self.session.commit()
        return create_access_token(user.id), refresh_raw

    async def refresh(self, refresh_token: str) -> str:
        token = await self.repo.get_active_refresh_token(hash_refresh_token(refresh_token), _now())
        if token is None:
            raise unauthorized("Refresh-токен недействителен или истёк")
        return create_access_token(token.user_id)

    async def logout(self, refresh_token: str) -> None:
        """Идемпотентно: неизвестный или уже отозванный токен — не ошибка."""
        await self.repo.revoke_refresh_token(hash_refresh_token(refresh_token), _now())
        await self.session.commit()
