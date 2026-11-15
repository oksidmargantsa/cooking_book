from fastapi import FastAPI

from app.core.errors import register_exception_handlers

app = FastAPI(title="Recipes API")
register_exception_handlers(app)
