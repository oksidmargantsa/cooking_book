from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://recipes:recipes@postgres:5432/recipes"
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    redis_url: str = "redis://redis:6379/0"
    minio_endpoint: str = "http://minio:9000"
    minio_access_key: str = "recipes-dev"
    minio_secret_key: str = "recipes-dev-password"
    minio_bucket: str = "storage"
    minio_public_base_url: str = "/storage"
    minio_signing_endpoint: str | None = None


@lru_cache
def get_settings() -> Settings:
    return Settings()
