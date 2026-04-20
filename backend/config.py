"""
SKAPA backend config — pulls from /app/backend/.env
"""
import os
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # DB
    MONGO_URL: str
    DB_NAME: str

    # Spotify
    SPOTIFY_CLIENT_ID: str
    SPOTIFY_CLIENT_SECRET: str

    # App secrets
    JWT_SECRET: str
    TOKEN_ENCRYPTION_KEY: str  # base64 32 bytes

    # CORS
    CORS_ORIGINS: str = "*"

    model_config = SettingsConfigDict(env_file=os.path.join(os.path.dirname(__file__), ".env"))


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
