# TripSync Backend API Endpoints

This document describes the various API endpoints exposed by the TripSync backend application.

**Base URL:** `/api` (e.g., `http://localhost:8000/api`)

## 1. Health Endpoints (`/health`)

These endpoints are used to check the health and status of the API.

### `GET /api/health`

*   **Description:** Returns a simple status message to indicate the API is running.
*   **Response:**
    ```json
    {
      "message": "TripSync API is healthy!"
    }
    ```

## 2. Authentication Endpoints (`/auth`)

These endpoints handle user authentication and authorization.

### `[Placeholder for Auth Endpoints]`

*   **Description:** Details for user registration, login, token refresh, etc., will be added here once the actual routes are implemented.
*   **JWT Configuration:**
    *   `JWT_SECRET_KEY`: Used to sign and verify JWTs.
    *   `JWT_ALGORITHM`: Algorithm for JWT signing (e.g., `HS256`).
    *   `ACCESS_TOKEN_EXPIRE_MINUTES`: Expiration time for access tokens.

## 3. Pooling Endpoints (`/pool`)

These endpoints manage ride-pooling requests.

### `[Placeholder for Pooling Endpoints]`

*   **Description:** Details for creating, joining, updating, and viewing pooling requests will be added here.

### 3.1. Pooling WebSocket (`/ws/pool/{user_id}`)

*   **Description:** Provides real-time communication for pooling requests. Users connect to this WebSocket with their `user_id`.
*   **Manager:** The `ConnectionManager` in `app/core/ws_manager.py` handles active connections.
*   **Connection URL Example:** `ws://localhost:8000/api/ws/pool/{user_id}`

## 4. Profile Endpoints (`/profile`)

These endpoints manage user profiles.

### `[Placeholder for Profile Endpoints]`

*   **Description:** Details for creating, viewing, and updating user profiles will be added here.

## 5. Services Endpoints (`/services`)

These endpoints manage service posts and related requirements/filters.

### `[Placeholder for Services Endpoints]`

*   **Description:** Details for creating, viewing, and managing service posts will be added here.