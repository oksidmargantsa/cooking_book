from fastapi import APIRouter, FastAPI

from app.core.errors import register_exception_handlers
from app.modules.accounts.auth_router import router as auth_router
from app.modules.accounts.preferences_router import router as preferences_router
from app.modules.dictionaries.router import router as dictionaries_router
from app.modules.folders.router import router as folders_router
from app.modules.uploads.router import router as uploads_router

app = FastAPI(title="Recipes API")
register_exception_handlers(app)

api = APIRouter(prefix="/api/v1")
api.include_router(auth_router)
api.include_router(folders_router)
api.include_router(preferences_router)
api.include_router(uploads_router)
api.include_router(dictionaries_router)
app.include_router(api)
