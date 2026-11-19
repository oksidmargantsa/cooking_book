from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import FAVORITES_FOLDER_NAME
from app.models import Folder


class FoldersService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_default(self, user_id: int) -> Folder:
        folder = Folder(user_id=user_id, name=FAVORITES_FOLDER_NAME, is_default=True)
        self.session.add(folder)
        await self.session.flush()
        return folder
