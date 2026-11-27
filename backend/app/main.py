from fastapi import APIRouter, FastAPI

from app.core.errors import register_exception_handlers
from app.modules.accounts.auth_router import router as auth_router
from app.modules.dictionaries.router import router as dictionaries_router
from app.modules.feed.router import router as feed_router
from app.modules.folders.router import router as folders_router
from app.modules.recipes.my_router import router as my_recipes_router
from app.modules.recipes.router import router as recipes_router
from app.modules.uploads.router import router as uploads_router

app = FastAPI(title="Recipes API")
register_exception_handlers(app)

api = APIRouter(prefix="/api/v1")
api.include_router(auth_router)
api.include_router(folders_router)
api.include_router(uploads_router)
api.include_router(recipes_router)
api.include_router(my_recipes_router)
api.include_router(feed_router)
api.include_router(dictionaries_router)
app.include_router(api)
