```markdown
# Getting Started with the Backend

This guide will walk you through setting up the TripSync backend development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

*   [Python 3.9+](https://www.python.org/downloads/)
*   [pip](https://pip.pypa.io/en/stable/installation/)
*   [pipenv](https://pipenv.pypa.io/en/latest/installation/)
*   A PostgreSQL database instance (recommended for production-like environment) or SQLite (for local development).

## Setup Instructions

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/dranzer-17/TripSync.git
    cd TripSync/backend
    ```

2.  **Install Dependencies**

    The project uses `pipenv` for dependency management. If you don't have `pipenv`, install it first:

    ```bash
    pip install pipenv
    ```

    Then, install the project dependencies:

    ```bash
    pipenv install
    ```

3.  **Configure Environment Variables**

    Create a `.env` file in the `backend/` directory based on the `backend/.env.example` (or just create it manually) and populate it with your specific settings.

    ```dotenv
    # .env file (within the backend directory)

    # Database Connection String (e.g., for PostgreSQL or SQLite)
    # For PostgreSQL:
    # DATABASE_URL="postgresql://user:password@host:port/database_name"
    # For SQLite (development only, creates a file):
    DATABASE_URL="sqlite:///./tripsync.db"

    # Allowed origins for CORS. Use '*' for development, specify domains for production.
    ALLOW_ORIGINS="*"

    # JWT Authentication Settings
    JWT_SECRET_KEY="YOUR_VERY_SECRET_KEY_HERE" # Generate a strong, random key
    JWT_ALGORITHM="HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES=30 # How long an access token is valid

    # Ola Maps API Key (replace with your actual key)
    OLA_MAPS_API_KEY="YOUR_OLA_MAPS_API_KEY"
    ```

    *   **`DATABASE_URL`**: This is your database connection string. For quick local testing, `sqlite:///./tripsync.db` will create a `tripsync.db` file in your `backend` directory. For more robust development or production, use a PostgreSQL URL.
    *   **`ALLOW_ORIGINS`**: Controls Cross-Origin Resource Sharing. `*` allows all origins, which is fine for development. For production, specify your frontend domain(s) separated by commas (e.g., `http://localhost:3000,https://your-frontend.com`).
    *   **`JWT_SECRET_KEY`**: A very long, random string. You can generate one using Python's `secrets` module: `python -c 'import secrets; print(secrets.token_hex(32))'`.
    *   **`JWT_ALGORITHM`**: The hashing algorithm for JWTs (e.g., `HS256`, `RS256`).
    *   **`ACCESS_TOKEN_EXPIRE_MINUTES`**: The validity period for JWT access tokens in minutes.
    *   **`OLA_MAPS_API_KEY`**: Your API key for Ola Maps (or similar mapping service).

4.  **Run the Application**

    Start the FastAPI application using `uvicorn`:

    ```bash
    pipenv run uvicorn app.main:app --reload
    ```

    The `--reload` flag enables auto-reloadingOnFileChange. You should see output similar to:

    ```
    INFO:     Will watch for changes in these directories: ['/path/to/TripSync/backend']
    INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
    INFO:     Started reloader process [xxxxx] using WatchFiles
    INFO:     Started server process [xxxxx]
    INFO:     Waiting for application startup.
    Starting up...
    Database tables created.
    INFO:     Application startup complete.
    INFO:     ASGI 'lifespan' protocol appears in use.
    INFO:     ASGI 'lifespan' protocol has shutdown support.
    INFO:     ASGI 'lifespan' protocol is ready to use.
    ```

    The API will be accessible at `http://127.0.0.1:8000/api` and the interactive API documentation (Swagger UI) at `http://127.0.0.1:8000/docs`.

## Database Initialization

Upon startup, the `lifespan` event in `main.py` automatically creates all defined database tables according to the SQLAlchemy models. You do not need to run separate migration commands for initial setup with this configuration.

```