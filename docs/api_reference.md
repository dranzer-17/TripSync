```markdown
# API Reference

This document provides a high-level overview of the API endpoints available in the TripSync backend. Detailed endpoint specifications, request/response schemas, and authentication requirements can be found in the interactive API documentation (Swagger UI) at `http://127.0.0.1:8000/docs` when the backend is running.

## Top-Level Routers

Calls to the API should be prefixed with `/api` (e.g., `http://127.0.0.1:8000/api/health`).

| Router               | Prefix         | Description                                                          | Tags                     |
| :------------------- | :------------- | :------------------------------------------------------------------- | :----------------------- |
| `health_router`      | `/api/health`  | Provides endpoints to check the health and status of the API.        | `Health`                 |
| `auth_router`        | `/api/auth`    | Handles user authentication, registration, and token management.     | `Authentication`         |
| `pooling_router`     | `/api/pool`    | Manages pooling requests, including creation, searching, and updates. | `Pooling`                |
| `profile_router`     | `/api/profile` | Provides endpoints for managing user profiles.                      | `Profile`                |
| `services_router`    | `/api/services`| Manages service posts, requirements, and filters.                    | `Services`               |
| `pooling_ws_router`  | `/ws/pool`     | Handles real-time WebSocket connections for pooling updates.         | `Pooling WebSocket`      |

## WebSocket Endpoints

WebSocket connections are established through `ws_manager.py` for real-time communication. The main pooling WebSocket router is included:

*   **`GET /ws/pool/{user_id}`**: Establishes a WebSocket connection for a specific `user_id` to receive real-time updates related to pooling requests. (Exact endpoint signature will be defined in `pooling_ws_router.py`.)

```