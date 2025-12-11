# Backend Configuration

The TripSync backend uses Pydantic Settings to manage configurations, primarily loaded from `.env` files. This allows for flexible and secure management of sensitive information and environment-specific settings.

## .env File Example

To run the backend, you need to create a `.env` file in the `backend/` directory with the following variables:

```dotenv
# Database connection string (e.g., PostgreSQL, SQLite)
DATABASE_URL="postgresql://user:password@host:port/database_name"

# Allowed origins for CORS. Use a comma-separated list for multiple origins.
# For development, you can use "*" to allow all origins, but restrict this in production.
ALLOW_ORIGINS="http://localhost:3000,http://localhost:8080"

# JWT Secret Key: A strong, random string used for signing JWT tokens.
# Generate a secure key, e.g., using `openssl rand -hex 32`
JWT_SECRET_KEY="your_super_secret_jwt_key_here"

# JWT Algorithm: Algorithm used for signing JWT tokens (e.g., HS256, RS256)
JWT_ALGORITHM="HS256"

# Access Token Expiration: Duration in minutes until an access token expires.
ACCESS_TOKEN_EXPIRE_MINUTES=30

# OLA Maps API Key: Your API key for the OLA Maps service.
OLA_MAPS_API_KEY="your_ola_maps_api_key_here"
```

## `Settings` Class

The `app/core/config.py` module defines the `Settings` class, which loads these environment variables and provides them throughout the application. It's configured to ignore extra environment variables not explicitly defined in the class.

```python
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
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    OLA_MAPS_API_KEY: str

settings = Settings()
```

### `model_config` Details

*   `env_file=".env"`: Specifies that settings should be loaded from a `.env` file.
*   `env_file_encoding='utf-8'`: Sets the encoding for the `.env` file.
*   `extra='ignore'`: Pydantic will ignore any environment variables or fields in the `.env` file that are not defined in the `Settings` class, preventing validation errors for unknown keys.