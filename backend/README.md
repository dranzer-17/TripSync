# TripSync Backend

Backend service for **TripSync**, built with **FastAPI** and **Uvicorn**.  
You can run it locally or with Docker Compose.

---

## 🔧 Environment Setup

Create a `.env` file in the `TripSync/backend/` directory:

```bash
# TripSync/backend/.env

# Variables for Docker Compose
POSTGRES_USER=postgres
POSTGRES_PASSWORD=ipd123
POSTGRES_DB=tripsync_db
POSTGRES_PORT=5433

# Variables for the FastAPI application
DATABASE_URL="postgresql://postgres:ipd123@localhost:5433/tripsync_db"
ALLOW_ORIGINS="*"
```

---

## 🚀 Run Locally

```bash
# Activate virtual environment
.venv\Scripts\activate      # Windows PowerShell
source .venv/bin/activate   # Linux / Mac

# Go to backend folder
cd backend

# Start FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Server will run at:** 👉 http://localhost:8000

---

## 🐳 Run with Docker Compose

```bash
# Build and start containers
docker-compose up --build
```

**Services & Ports:**
- **FastAPI Backend:** http://localhost:8000
- **PostgreSQL Database:** localhost:5433
- **Database Name:** `tripsync_db`
- **Database User:** `postgres`
- **Database Password:** `ipd123`

---

## 📂 Project Structure

```
backend/
 └── app/
     ├── core/        # Core configs/utilities
     ├── db/          # Database setup
     ├── models/      # SQLAlchemy models
     ├── routes/      # API routes
     ├── schemas/     # Pydantic schemas
     ├── services/    # Business logic
     ├── main.py      # Entry point (FastAPI app)
     └── router.py    # Centralized router
```

---

## ⚡ API Documentation

FastAPI auto-generates interactive docs:
- **Swagger UI** → http://localhost:8000/docs
- **ReDoc** → http://localhost:8000/redoc

---

## 📋 Prerequisites

- **Python 3.8+**
- **PostgreSQL** (if running locally without Docker)
- **Docker & Docker Compose** (for containerized setup)

---

## 🛠️ Development Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Run database migrations (if using Alembic)
alembic upgrade head

# Run tests
pytest

# Format code
black .
isort .
```

---

## 🌐 Port Configuration

| Service | Port | Description |
|---------|------|-------------|
| FastAPI Backend | 8000 | Main API server |
| PostgreSQL Database | 5433 | Database connection |

> **Note:** Database port 5433 is used instead of default 5432 to avoid conflicts with existing PostgreSQL installations.

---

## 🔗 Database Connection

The application connects to PostgreSQL using:
- **Host:** localhost
- **Port:** 5433
- **Database:** tripsync_db
- **Username:** postgres
- **Password:** ipd123

Connection string: `postgresql://postgres:ipd123@localhost:5433/tripsync_db`