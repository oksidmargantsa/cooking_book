from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response

from app.core.constants import DEFAULT_PER_PAGE, MAX_PER_PAGE
from app.core.deps import CurrentUserId, SessionDep
from app.core.errors import ErrorBody
from app.modules.folders.schemas import (
    FolderCreated,
    FolderList,
    FolderNameRequest,
    FolderOut,
    FolderRecipesPage,
    FolderRenamed,
)
from app.modules.folders.service import FoldersService

router = APIRouter(
    prefix="/folders",
    tags=["folders"],
    responses={401: {"model": ErrorBody}, 404: {"model": ErrorBody}},
)


def get_folders_service(session: SessionDep) -> FoldersService:
    return FoldersService(session)


FoldersServiceDep = Annotated[FoldersService, Depends(get_folders_service)]


@router.get("", response_model=FolderList)
async def list_folders(user_id: CurrentUserId, service: FoldersServiceDep) -> FolderList:
    folders = await service.list_folders(user_id)
    return FolderList(
        items=[
            FolderOut(id=f.id, user_id=f.user_id, name=f.name, is_default=f.is_default)
            for f in folders
        ]
    )


@router.post(
    "",
    status_code=201,
    response_model=FolderCreated,
    responses={
        422: {"model": ErrorBody, "description": "FOLDERS_LIMIT_EXCEEDED / VALIDATION_ERROR"}
    },
)
async def create_folder(
    body: FolderNameRequest, user_id: CurrentUserId, service: FoldersServiceDep
) -> FolderCreated:
    folder = await service.create_folder(user_id, body.name)
    return FolderCreated(id=folder.id)


@router.patch(
    "/{folder_id}",
    response_model=FolderRenamed,
    responses={403: {"model": ErrorBody, "description": "«Избранное» переименовать нельзя"}},
)
async def rename_folder(
    folder_id: int, body: FolderNameRequest, user_id: CurrentUserId, service: FoldersServiceDep
) -> FolderRenamed:
    folder = await service.rename_folder(user_id, folder_id, body.name)
    return FolderRenamed(id=folder.id, name=folder.name)


@router.delete(
    "/{folder_id}",
    status_code=204,
    response_class=Response,
    responses={403: {"model": ErrorBody, "description": "«Избранное» удалить нельзя"}},
)
async def delete_folder(
    folder_id: int, user_id: CurrentUserId, service: FoldersServiceDep
) -> Response:
    await service.delete_folder(user_id, folder_id)
    return Response(status_code=204)


@router.post(
    "/{folder_id}/recipes/{recipe_id}",
    status_code=201,
    response_class=Response,
    responses={
        422: {
            "model": ErrorBody,
            "description": "FOLDER_RECIPES_LIMIT_EXCEEDED / FAVORITES_LIMIT_EXCEEDED",
        }
    },
)
async def add_recipe_to_folder(
    folder_id: int, recipe_id: int, user_id: CurrentUserId, service: FoldersServiceDep
) -> Response:
    await service.add_recipe(user_id, folder_id, recipe_id)
    return Response(status_code=201)


@router.delete("/{folder_id}/recipes/{recipe_id}", status_code=204, response_class=Response)
async def remove_recipe_from_folder(
    folder_id: int, recipe_id: int, user_id: CurrentUserId, service: FoldersServiceDep
) -> Response:
    await service.remove_recipe(user_id, folder_id, recipe_id)
    return Response(status_code=204)


@router.get("/{folder_id}/recipes", response_model=FolderRecipesPage)
async def list_folder_recipes(
    folder_id: int,
    user_id: CurrentUserId,
    service: FoldersServiceDep,
    page: Annotated[int, Query(ge=1)] = 1,
    per_page: Annotated[int, Query(ge=1, le=MAX_PER_PAGE)] = DEFAULT_PER_PAGE,
) -> FolderRecipesPage:
    return FolderRecipesPage(**await service.list_recipes(user_id, folder_id, page, per_page))
