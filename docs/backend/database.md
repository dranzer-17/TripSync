# Backend Database Integration

The TripSync backend uses SQLAlchemy as an ORM (Object Relational Mapper) to interact with a PostgreSQL database. The setup is handled in `backend/app/db/database.py`.

## Database Engine and Session

An SQLAlchemy engine is configured using the `DATABASE_URL` from the application settings.

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
```

*   `engine`: The core interface for the database.
*   `SessionLocal`: A factory for creating database sessions. Each session represents a 'staging zone' for objects loaded from the database.
*   `Base`: The declarative base class that all ORM models inherit from.

## Dependency for Database Sessions

The `get_db` function provides a FastAPI dependency to manage database session lifecycle. It ensures that a new session is created for each request and properly closed afterwards, even if errors occur.

```python
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

This `get_db` dependency can be injected into FastAPI route functions to provide a database session.

## Table Creation

Database tables defined by SQLAlchemy models are automatically created on application startup via the `create_db_and_tables` function within `backend/app/main.py`. This function calls `Base.metadata.create_all(bind=engine)`.

```python
# In backend/app/main.py
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
```

This ensures that all necessary tables are present in the database when the application starts.