from typing import Annotated

from fastapi import APIRouter, Depends, Response

from app.core.deps import SessionDep
from app.core.errors import ErrorBody
from app.modules.accounts.auth_schemas import (
    AccessToken,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    RegisterResponse,
    TokenPair,
)
from app.modules.accounts.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


def get_auth_service(session: SessionDep) -> AuthService:
    return AuthService(session)


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]


@router.post(
    "/register",
    status_code=201,
    response_model=RegisterResponse,
    responses={409: {"model": ErrorBody, "description": "LOGIN_EXISTS"}},
)
async def register(body: RegisterRequest, service: AuthServiceDep) -> RegisterResponse:
    user = await service.register(body.login, body.password)
    return RegisterResponse(id=user.id, login=user.login)


@router.post(
    "/login",
    response_model=TokenPair,
    responses={401: {"model": ErrorBody, "description": "INVALID_CREDENTIALS"}},
)
async def login(body: LoginRequest, service: AuthServiceDep) -> TokenPair:
    access, refresh = await service.login(body.login, body.password)
    return TokenPair(access_token=access, refresh_token=refresh)


@router.post(
    "/refresh",
    response_model=AccessToken,
    responses={401: {"model": ErrorBody, "description": "UNAUTHORIZED"}},
)
async def refresh(body: RefreshRequest, service: AuthServiceDep) -> AccessToken:
    return AccessToken(access_token=await service.refresh(body.refresh_token))


@router.post("/logout", status_code=204, response_class=Response)
async def logout(body: RefreshRequest, service: AuthServiceDep) -> Response:
    await service.logout(body.refresh_token)
    return Response(status_code=204)
