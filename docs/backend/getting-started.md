# Getting Started with TripSync Backend

This guide will help you set up and run the TripSync backend application locally.

## Prerequisites

*   Python 3.9+
*   Poetry (for dependency management)
*   PostgreSQL database

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/dranzer-17/TripSync.git
    cd TripSync/backend
    ```

2.  **Install dependencies using Poetry:**
    ```bash
    poetry install
    ```

## Configuration

Create a `.env` file in the `backend/` directory based on the example below. This file will hold your environment variables.

### `.env` Example

```dotenv
DATABASE_URL="postgresql://user:password@host:port/database_name"
ALLOW_ORIGINS="http://localhost:3000,http://localhost:8000"
JWT_SECRET_KEY="your_super_secret_jwt_key_here"
JWT_ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30
OLA_MAPS_API_KEY="your_ola_maps_api_key_here"
```

**Environment Variables Explanation:**

*   `DATABASE_URL`: Connection string for your PostgreSQL database.
*   `ALLOW_ORIGINS`: Comma-separated list of origins that are allowed to make cross-origin requests to the API. Use `*` to allow all origins during development.
*   `JWT_SECRET_KEY`: A strong, random secret key used for signing JWT tokens. **Keep this secure and never expose it publicly!**
*   `JWT_ALGORITHM`: The hashing algorithm used for JWT. `HS256` is recommended.
*   `ACCESS_TOKEN_EXPIRE_MINUTES`: The duration in minutes for which an access token will be valid.
*   `OLA_MAPS_API_KEY`: API key for Ola Maps or a similar mapping service.

## Running the Application

1.  **Activate the Poetry shell:**
    ```bash
    poetry shell
    ```

2.  **Run the FastAPI application using Uvicorn:**
    ```bash
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    ```

    The API will be accessible at `http://localhost:8000`.

3.  **Access API Documentation:**
    *   **Swagger UI:** `http://localhost:8000/docs`
    *   **ReDoc:** `http://localhost:8000/redoc`

## Database Initialization

The application will automatically create database tables on startup if they don't exist, as defined by SQLAlchemy models in `app/models/`.