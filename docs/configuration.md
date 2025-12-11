```markdown
# Backend Configuration

The TripSync backend uses environment variables for configuration. These variables are loaded from a `.env` file located in the `backend/` directory and managed by Pydantic's `BaseSettings`.

Below is a list of all available configuration variables and their descriptions.

## Environment Variables (`.env`)

| Variable Name             | Description                                                                                                   | Example Value                                  | Default    | Required | 
| :------------------------ | :------------------------------------------------------------------------------------------------------------ | :--------------------------------------------- | :--------- | :------- |
| `DATABASE_URL`            | The connection string for the database. Supports various databases via SQLAlchemy.                              | `sqlite:///./tripsync.db` (SQLite)              | N/A        | Yes      |
|                           |                                                                                                               | `postgresql://user:pass@host:port/dbname`      |            |          |
| `ALLOW_ORIGINS`           | A comma-separated list of allowed origins for Cross-Origin Resource Sharing (CORS). Use `*` to allow all origins. | `*` (development)                              | N/A        | Yes      |
|                           |                                                                                                               | `http://localhost:3000,https://myfrontend.com` |            |          |
| `JWT_SECRET_KEY`          | A strong, random secret key used for signing JSON Web Tokens (JWTs). **Crucial for security.**                  | `your-super-secret-key`                        | N/A        | Yes      |
| `JWT_ALGORITHM`           | The cryptographic algorithm used for signing JWTs (e.g., HS256, RS256).                                       | `HS256`                                        | N/A        | Yes      |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | The duration, in minutes, after which an access token expires.                                                    | `30`                                           | N/A        | Yes      |
| `OLA_MAPS_API_KEY`        | Your API key for the Ola Maps service or equivalent mapping provider.                                         | `your_ola_maps_api_key_123`                    | N/A        | Yes      |

### Example `.env` file

```dotenv
DATABASE_URL="sqlite:///./tripsync.db"
ALLOW_ORIGINS="*"
JWT_SECRET_KEY="a-very-long-and-random-string-for-jwt-security"
JWT_ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=60
OLA_MAPS_API_KEY="your_ola_maps_api_key_here"
```

## How Configuration is Loaded

The configuration is loaded in `backend/app/core/config.py` using `pydantic_settings.BaseSettings`. When the application starts, it looks for these variables first in the environment and then in the `.env` file.

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

This setup ensures that sensitive information and environment-specific settings are managed outside the codebase, promoting security and flexibility across different deployment environments.
