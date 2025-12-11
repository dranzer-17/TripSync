# Backend Setup Guide

This guide provides instructions on how to set up and run the TripSync backend API locally.

## Prerequisites

Before you begin, ensure you have the following installed:

*   **Python 3.9+**
*   **`pip`** (Python package installer)
*   **Docker** (recommended for PostgreSQL database setup)

## 1. Environment Variables

The backend relies on several environment variables for configuration, managed via a `.env` file. Create a file named `.env` in the `backend/` directory (next to `main.py`) with the following content:

```dotenv
DATABASE_URL="postgresql://user:password@host:port/database_name"
ALLOW_ORIGINS="*" # Or specify http://localhost:3000,http://yourfrontend.com

# JWT Authentication Settings
JWT_SECRET_KEY="YOUR_SUPER_SECRET_KEY_HERE" # Generate a strong, random key
JWT_ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30

OLA_MAPS_API_KEY="YOUR_OLA_MAPS_API_KEY"
```

**Explanation of variables:**

*   `DATABASE_URL`: Connection string for your PostgreSQL database. Refer to the 'Database Setup' section for how to get this.
*   `ALLOW_ORIGINS`: A comma-separated list of origins that are allowed to make cross-origin requests to your API. Use `"*"` for development to allow all origins.
*   `JWT_SECRET_KEY`: A secret key used to sign JWT tokens. **CRITICAL: Use a strong, randomly generated key for production environments.**
*   `JWT_ALGORITHM`: The algorithm used for signing JWT tokens (e.g., `HS256`).
*   `ACCESS_TOKEN_EXPIRE_MINUTES`: The expiration time for access tokens in minutes.
*   `OLA_MAPS_API_KEY`: API key for integrating with Ola Maps services.

## 2. Database Setup (PostgreSQL)

### Using Docker (Recommended)

Diasy way to run a PostgreSQL database for local development is using Docker.

1.  **Pull the PostgreSQL image:**
    ```bash
    docker pull postgres
    ```
2.  **Run a PostgreSQL container:**
    ```bash
    docker run --name tripsync-db \
      -e POSTGRES_USER=tripsync_user \
      -e POSTGRES_PASSWORD=tripsync_password \
      -e POSTGRES_DB=tripsync_db \
      -p 5432:5432 \
      -d postgres
    ```
    This will start a PostgreSQL container named `tripsync-db` on port `5432`. You can then use the following `DATABASE_URL` in your `.env` file:
    `DATABASE_URL="postgresql://tripsync_user:tripsync_password@localhost:5432/tripsync_db"`

### Manual PostgreSQL Installation

If you prefer to install PostgreSQL directly on your system, please follow the official PostgreSQL documentation for your operating system. Once installed, create a new user and database, then update your `DATABASE_URL` accordingly.

## 3. Install Dependencies

Navigate to the `backend/` directory and install the required Python packages:

```bash
cd backend
pip install -r requirements.txt
```

**(Note: A `requirements.txt` file is expected to be present with all necessary dependencies.)**

## 4. Run the Application

After setting up environment variables and the database, you can run the FastAPI application:

```bash
cd backend
uvicorn app.main:app --reload
```

*   `uvicorn app.main:app`: Tells Uvicorn to run the `app` object from `app/main.py`.
*   `--reload`: Enables auto-reloading of the server when code changes are detected (useful for development).

The API will be accessible at `http://localhost:8000` (or your configured port).

## 5. Verify Installation

Open your browser or use a tool like `curl` or Postman to access the root endpoint:

```bash
curl http://localhost:8000/api/
```

You should see the response: `{"message": "TripSync API is running!"}`
