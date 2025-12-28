# backend/app/core/config.py

from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding='utf-8',
        extra='ignore'
    )

    DATABASE_URL: str
    ALLOW_ORIGINS: str

    # --- ADD THESE THREE LINES ---
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    # -----------------------------
    OLA_MAPS_API_KEY: str
    # Optional proxy for OLA Maps API (if carrier blocks)
    OLA_MAPS_PROXY: Optional[str] = None

settings = Settings()