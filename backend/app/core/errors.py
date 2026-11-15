"""Единый формат ошибок {code, message, field} (HLD, раздел 5)."""

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from starlette.exceptions import HTTPException as StarletteHTTPException


class ErrorBody(BaseModel):
    code: str
    message: str
    field: str | None = None


class AppError(Exception):
    def __init__(self, status_code: int, code: str, message: str, field: str | None = None):
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message
        self.field = field


def unauthorized(message: str = "Требуется авторизация") -> AppError:
    return AppError(401, "UNAUTHORIZED", message)


def forbidden(message: str = "Недостаточно прав") -> AppError:
    return AppError(403, "FORBIDDEN", message)


def not_found(message: str = "Ресурс не найден", field: str | None = None) -> AppError:
    return AppError(404, "NOT_FOUND", message, field)


def _response(status_code: int, code: str, message: str, field: str | None = None) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content=ErrorBody(code=code, message=message, field=field).model_dump(),
    )


_HTTP_CODES = {401: "UNAUTHORIZED", 403: "FORBIDDEN", 404: "NOT_FOUND"}


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def _app_error(_: Request, exc: AppError) -> JSONResponse:
        return _response(exc.status_code, exc.code, exc.message, exc.field)

    @app.exception_handler(RequestValidationError)
    async def _validation_error(_: Request, exc: RequestValidationError) -> JSONResponse:
        first = exc.errors()[0]
        parts = [str(p) for p in first["loc"] if p not in ("body", "query", "path")]
        message = str(first.get("msg", "Некорректные данные")).removeprefix("Value error, ")
        return _response(422, "VALIDATION_ERROR", message, ".".join(parts) or None)

    @app.exception_handler(StarletteHTTPException)
    async def _http_error(_: Request, exc: StarletteHTTPException) -> JSONResponse:
        code = _HTTP_CODES.get(exc.status_code, "HTTP_ERROR")
        return _response(exc.status_code, code, str(exc.detail))
