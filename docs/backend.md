```markdown
# Backend Overview

This document provides an overview of the TripSync backend architecture, its technology stack, and how the core components are structured to deliver the application's functionality.

## Technology Stack

The TripSync backend is built using a modern and performant stack:

*   **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
    *   Chosen for its high performance, automatic interactive API documentation (Swagger UI), and strong type hints.
*   **Language**: Python 3.9+
*   **ORM**: [SQLAlchemy](https://www.sqlalchemy.org/)
    *   A powerful and flexible Object Relational Mapper for interacting with databases.
*   **Database**: (Implied by SQLAlchemy usage, typically PostgreSQL or SQLite for development)
*   **Data Validation/Settings**: [Pydantic](https://pydantic-docs.helpmanual.io/)
    *   Used for data validation, serialization, and managing application settings via environment variables.
*   **Asynchronous Operations**: Based on Python's `async/await` and used extensively by FastAPI for efficient I/O operations.
*   **Real-time Communication**: WebSockets, managed by a custom `ConnectionManager`.
*   **CORS Management**: `fastapi.middleware.cors.CORSMiddleware` for handling cross-origin requests.

## Core Components

The backend is structured into several key modules:

*   **`main.py`**: The entry point of the FastAPI application. It includes:
    *   Application instantiation (`FastAPI`).
    *   `lifespan` event handler to create database tables on startup.
    *   CORS middleware configuration.
    *   Inclusion of all feature-specific routers.
*   **`app/core/`**: Contains core utilities and configurations.
    *   `config.py`: Defines application settings loaded from environment variables (e.g., database URL, JWT secrets, CORS origins).
    *   `ws_manager.py`: Manages WebSocket connections for real-time communication.
*   **`app/db/`**: Handles database-related operations.
    *   `database.py`: Configures the SQLAlchemy engine, session maker, and object base. Also provides a `get_db` dependency for database sessions.
*   **`app/models/`**: Defines the SQLAlchemy ORM models, representing the database schema.
    *   `user_model.py`: User account details.
    *   `profile_model.py`: Extended user profile information.
    *   `pooling_model.py`: Defines pooling requests and their status.
    *   `service_model.py`: Models for service posts, requirements, and filters.
    *   `college_model.py` (implied relation in `user_model.py` but not explicitly created in this commit, assuming it exists or will be added).
*   **`app/router.py`**: The main API router which aggregates all sub-routers (e.g., `auth_router`, `pooling_router`).
*   **`app/routes/`**: Contains individual API route definitions for different features (e.g., `health_router`, `auth_router`, `pooling_router`, `profile_router`, `services_router`, `pooling_ws_router`).

## Data Models

### User (`user_model.py`)
Represents a registered user with basic authentication details and a one-to-one relationship with their `Profile`.

### Profile (`profile_model.py`)
Extends user information to include details like `phone_number`, `bio`, `year_of_study`, `reviews`, `preferences`, `social_media_links`, and `emergency_contact`.

### Pooling Request (`pooling_model.py`)
Manages ride/resource pooling requests, including start/destination coordinates, status (`ACTIVE`, `MATCHED`, `COMPLETED`, `CANCELLED`), and a link to the requesting user.

### Service Post (`service_model.py`)
Allows users to post or request services, including `title`, `description`, `price`, and `status`. It also supports associated `ServiceRequirement` and `ServiceFilter` models.

## Real-time Communication

The `ConnectionManager` in `app/core/ws_manager.py` provides a centralized way to handle WebSocket connections. It allows tracking active user connections and sending targeted personal messages.

```