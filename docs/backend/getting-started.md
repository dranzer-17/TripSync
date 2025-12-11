# Backend Getting Started

This document describes how to set up and run the `TripSync` backend application locally.

## Prerequisites

Before you begin, ensure you have the following installed:

*   Python 3.9+
*   Poetry (for dependency management)
*   Docker (optional, for database setup)

## Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/dranzer-17/TripSync.git
    cd TripSync/backend
    ```

2.  **Install dependencies:**

    The project uses Poetry for dependency management.

    ```bash
    poetry install
    ```

3.  **Configure Environment Variables:**

    Create a `.env` file in the `backend/app` directory (next to `main.py`) and populate it with the required environment variables. See [Configuration](backend/configuration.md) for details.

    Example `.env`:

    ```ini
    DATABASE_URL="postgresql://user:password@localhost:5432/tripsync"
    ALLOW_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
    JWT_SECRET_KEY="your_super_secret_jwt_key_here"
    JWT_ALGORITHM="HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES=30
    OLA_MAPS_API_KEY="your_ola_maps_api_key"
    ```

4.  **Database Setup:**

    Ensure your database (e.g., PostgreSQL) is running and accessible via the `DATABASE_URL`.
    The application will automatically create necessary tables on startup if they don't exist.
    (Refer to [Database Integration](backend/database.md) for more details on connecting to the database).

5.  **Run the application:**

    ```bash
    poetry run uvicorn app.main:app --reload
    ```

    The API will be accessible at `http://localhost:8000` (or `http://127.0.0.1:8000`).

## Accessing API Documentation

Once the server is running, you can access the interactive API documentation (Swagger UI) at:

*   `http://localhost:8000/docs`
*   `http://localhost:8000/redoc`