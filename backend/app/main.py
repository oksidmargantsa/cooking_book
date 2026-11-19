from fastapi import APIRouter, FastAPI

from app.core.errors import register_exception_handlers
from app.modules.accounts.auth_router import router as auth_router

app = FastAPI(title="Recipes API")
register_exception_handlers(app)

api = APIRouter(prefix="/api/v1")
api.include_router(auth_router)
app.include_router(api)
