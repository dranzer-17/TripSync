# TripSync Backend - FastAPI Application

This document provides an overview of the TripSync backend built using FastAPI, outlining its core structure, setup, and key functionalities.

## Technology Stack

*   **FastAPI**: Modern, fast (high-performance) web framework for building APIs with Python 3.7+ based on standard Python type hints.
*   **SQLAlchemy**: Python SQL toolkit and Object Relational Mapper that gives developers the full power and flexibility of SQL.
*   **Pydantic**: Data validation and settings management using Python type hints.
*   **Uvicorn**: ASGI server for running FastAPI applications.
*   **WebSockets**: For real-time communication capabilities.

## Project Structure

The backend is organized into a modular structure:

```
backend/
├── app/
│   ├── core/           # Core configurations (settings, WebSocket manager)
│   ├── db/             # Database connection and session management
│   ├── models/         # SQLAlchemy ORM models (database schemas)
│   ├── router/         # Central API router that includes feature-specific routers
│   ├── routes/         # Feature-specific API endpoints (e.g., auth, pooling, profile)
│   └── main.py         # Main FastAPI application entry point
├── .env.example        # Example environment variables
└── requirements.txt    # Python dependencies
```

## Application Startup (`main.py`)

The `main.py` file is the entry point for the FastAPI application. It handles:

*   **Database Initialization**: Creates all necessary database tables on application startup.
*   **CORS Middleware**: Configures Cross-Origin Resource Sharing to allow frontend applications to interact with the API.
*   **API Routing**: Includes various feature-specific routers under the `/api` prefix.
*   **Lifespan Events**: Manages startup and shutdown processes, ensuring resources like database connections are properly handled.

```python
# backend/app/main.py
from fastapi import FastAPI
from app.router import router
from app.db.database import Base, engine
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from app.models import user_model, pooling_model, profile_model, service_model

load_dotenv()

def create_db_and_tables():
    Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up...")
    create_db_and_tables()
    print("Database tables created.")
    yield
    print("Shutting down...")

app = FastAPI(title="TripSync API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configurable via environment variables
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "TripSync API is running!"}
```

## CORS Configuration

CORS is configured globally to allow requests from any origin (`*`). In a production environment, it is highly recommended to restrict `allow_origins` to your specific frontend domains for security reasons. This can be configured via the `ALLOW_ORIGINS` environment variable (see `configurations.md`).

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## API Routing

The central `app.router` module aggregates various feature-specific routers, accessible under the `/api` prefix.

```python
# backend/app/router.py
from fastapi import APIRouter
from app.routes import health_router, auth_router,  pooling_router, pooling_ws_router
from app.routes import profile_router , services_router

router = APIRouter()

router.include_router(health_router.router, prefix="/health", tags=["Health"])
router.include_router(auth_router.router, prefix="/auth", tags=["Authentication"])
r.include_router(pooling_router.router, prefix="/pool", tags=["Pooling"])
r.include_router(profile_router.router, prefix="/profile", tags=["Profile"])
r.include_router(services_router.router, prefix="/services", tags=["Services"])

r.include_router(pooling_ws_router.router, tags=["Pooling WebSocket"])
```