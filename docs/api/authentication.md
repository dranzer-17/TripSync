# Authentication API

The TripSync API uses JSON Web Tokens (JWT) for authentication. Users obtain an access token upon successful login, which must then be included in the `Authorization` header of subsequent requests.

## Configuration

Before running the application, ensure the following JWT-related environment variables are configured in your `.env` file (as detailed in the [Setup Guide](../setup.md)):

*   `JWT_SECRET_KEY`: A strong, confidential key used to sign and verify JWTs.
*   `JWT_ALGORITHM`: The cryptographic algorithm used for signing (e.g., `HS256`).
*   `ACCESS_TOKEN_EXPIRE_MINUTES`: The validity period for access tokens.

## Endpoints

*(Note: Specific endpoints for user registration, login, token refresh, etc., will be documented here once implemented in `app/routes/auth_router.py`.)*
