# backend/app/core/config.py

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding='utf-8',
        extra='ignore'
    )

    DATABASE_URL: str
    ALLOW_ORIGINS: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str

settings = Settings()