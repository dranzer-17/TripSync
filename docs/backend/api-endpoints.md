# Backend API Endpoints

The TripSync backend exposes a RESTful API built with FastAPI. All API endpoints are prefixed with `/api`. The main application router (`backend/app/router.py`) aggregates various feature-specific routers.

## Main Router (`/api`)

All specific API routes are included under the `/api` prefix by `app.main:app`:

```python
# In backend/app/main.py
app.include_router(router, prefix="/api")
```

## Feature-Specific Routers

The following routers are included in the main API structure, each handling a specific domain:

*   **Health Checks (`/api/health`)**
    *   **Router File**: `app.routes.health_router`
    *   **Tags**: `Health`
    *   Used for checking the application's operational status.

*   **Authentication (`/api/auth`)**
    *   **Router File**: `app.routes.auth_router`
    *   **Tags**: `Authentication`
    *   Handles user registration, login, token management, etc. Refer to [Authentication Documentation](backend/authentication.md) for more details.

*   **Pooling (`/api/pool`)**
    *   **Router File**: `app.routes.pooling_router`
    *   **Tags**: `Pooling`
    *   Manages pooling requests and related operations.

*   **Profile (`/api/profile`)**
    *   **Router File**: `app.routes.profile_router`
    *   **Tags**: `Profile`
    *   Handles user profile creation, retrieval, and updates.

*   **Services (`/api/services`)**
    *   **Router File**: `app.routes.services_router`
    *   **Tags**: `Services`
    *   Manages service posts, requirements, and filters.

## Root Endpoint

A simple root endpoint is provided to confirm the API is running:

*   **GET `/`**
    Returns `{"message": "TripSync API is running!"}`

## CORS Middleware

The application is configured with `CORSMiddleware` to handle Cross-Origin Resource Sharing. This allows specific (or all) origins, methods, and headers to interact with the API.

```python
# In backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (configurable via ALLOW_ORIGINS env var)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```