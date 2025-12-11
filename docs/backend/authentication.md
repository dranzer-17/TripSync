# Backend Authentication

The TripSync backend implements a JSON Web Token (JWT) based authentication system.

## Configuration

Authentication relies on several environment variables configured in `backend/app/core/config.py`:

*   **`JWT_SECRET_KEY`**: A cryptographic key for signing and verifying JWTs.
*   **`JWT_ALGORITHM`**: The hashing algorithm used for JWTs (e.g., `HS256`).
*   **`ACCESS_TOKEN_EXPIRE_MINUTES`**: The validity period for access tokens.

These are consumed by the system to generate and validate JWTs.

## Authentication Flow (Conceptual)

1.  **User Registration**: A user provides credentials (e.g., email, password).
2.  **User Login**: Upon successful login, the system generates an `access token` and optionally a `refresh token`.
3.  **Token Issuance**: The `access token` is a JWT signed with `JWT_SECRET_KEY` and `JWT_ALGORITHM`, and has an expiration defined by `ACCESS_TOKEN_EXPIRE_MINUTES`.
4.  **Protected Endpoints**: To access protected API endpoints (e.g., `/api/profile`), the client must send the `access token` in the `Authorization` header as a Bearer token.
5.  **Token Validation**: The backend validates the token's signature and expiration.
    *   If valid, the request proceeds, and the user's identity is available in the request context.
    *   If invalid or expired, an authentication error is returned.

Detailed API endpoints for registration, login, and token refresh will be found in the [API Endpoints](backend/api-endpoints.md) document under the `/api/auth` prefix.