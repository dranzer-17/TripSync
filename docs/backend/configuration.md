# Backend Configuration

The `TripSync` backend uses environment variables for sensitive data and configurable settings. These are loaded from a `.env` file located in the `backend/app` directory using `pydantic-settings`.

## Environment Variables

Below are the essential environment variables required to run the backend application:

*   **`DATABASE_URL`** (string, **required**):
    The connection string for the PostgreSQL database. This URL specifies the database type, credentials, host, port, and database name. 
    Example: `postgresql://user:password@localhost:5432/tripsync`

*   **`ALLOW_ORIGINS`** (string, **required**):
    A comma-separated string of origins (e.g., `http://localhost:3000,http://127.0.0.1:3000`) that are allowed to make cross-origin requests to the FastAPI application. Set to `*` to allow all origins (not recommended for production).

*   **`JWT_SECRET_KEY`** (string, **required**):
    A strong, secret key used for digitally signing JSON Web Tokens (JWTs). This ensures the integrity and authenticity of tokens. **Must be kept secure and not hardcoded.**

*   **`JWT_ALGORITHM`** (string, **required**):
    The cryptographic algorithm used for signing JWTs. Typically `HS256`.

*   **`ACCESS_TOKEN_EXPIRE_MINUTES`** (integer, **required**):
    The duration, in minutes, after which an access token expires. Users will need to re-authenticate or refresh their token after this period.

*   **`OLA_MAPS_API_KEY`** (string, **required**):
    API key for integrating with Ola Maps services (e.g., for location-based features).

## Example `.env` File

Create a `.env` file in `backend/app/` with the following structure:

```ini
DATABASE_URL="postgresql://user:password@localhost:5432/tripsync"
ALLOW_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
JWT_SECRET_KEY="your_super_secret_jwt_key_here"
JWT_ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30
OLA_MAPS_API_KEY="your_ola_maps_api_key"
```