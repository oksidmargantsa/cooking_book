from fastapi import APIRouter

from app.core.deps import CurrentUserId, SessionDep
from app.modules.uploads.schemas import ConfirmInput, ConfirmResult, PresignInput, PresignResult
from app.modules.uploads.service import UploadsService

router = APIRouter(prefix="/uploads", tags=["Загрузка файлов"])


@router.post("/presign")
async def presign(data: PresignInput, user_id: CurrentUserId, session: SessionDep) -> PresignResult:
    return await UploadsService(session).presign(user_id, data.content_type)


@router.post("/confirm")
async def confirm(data: ConfirmInput, user_id: CurrentUserId, session: SessionDep) -> ConfirmResult:
    return await UploadsService(session).confirm(user_id, data.object_key)
