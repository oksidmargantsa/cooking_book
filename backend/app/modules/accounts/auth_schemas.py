from pydantic import BaseModel, Field, field_validator

from app.core.constants import LOGIN_MAX_LEN, LOGIN_MIN_LEN, PASSWORD_MAX_LEN, PASSWORD_MIN_LEN


def _normalize_login(value: str) -> str:
    return value.strip().lower()


class RegisterRequest(BaseModel):
    login: str
    password: str

    @field_validator("login")
    @classmethod
    def _login(cls, v: str) -> str:
        v = _normalize_login(v)
        if not LOGIN_MIN_LEN <= len(v) <= LOGIN_MAX_LEN:
            raise ValueError(
                f"Логин должен содержать от {LOGIN_MIN_LEN} до {LOGIN_MAX_LEN} символов"
            )
        return v

    @field_validator("password")
    @classmethod
    def _password(cls, v: str) -> str:
        if not PASSWORD_MIN_LEN <= len(v) <= PASSWORD_MAX_LEN:
            raise ValueError(
                f"Пароль должен содержать от {PASSWORD_MIN_LEN} до {PASSWORD_MAX_LEN} символов"
            )
        return v


class RegisterResponse(BaseModel):
    id: int
    login: str


class LoginRequest(BaseModel):
    login: str = Field(max_length=256)
    # Политику пароля при входе не проверяем: неверные данные — всегда 401 INVALID_CREDENTIALS.
    password: str = Field(max_length=1024)

    @field_validator("login")
    @classmethod
    def _login(cls, v: str) -> str:
        return _normalize_login(v)


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str


class RefreshRequest(BaseModel):
    refresh_token: str = Field(min_length=1, max_length=512)


class AccessToken(BaseModel):
    access_token: str
