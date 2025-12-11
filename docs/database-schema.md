# Database Schema

The TripSync backend uses SQLAlchemy for Object Relational Mapping (ORM), defining the database schema through Python classes. This document outlines the core models and their relationships.

## Database Connection (`app/db/database.py`)

The `database.py` module sets up the SQLAlchemy engine, session maker, and a dependency for obtaining a database session.

```python
# backend/app/db/database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import QueuePool
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    poolclass=QueuePool,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

## Models

### `College` Model (`models/user_model.py`)
Represents academic institutions.

```python
class College(Base):
    __tablename__ = "colleges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)

    users = relationship("User", back_populates="college") # One-to-Many relationship with User
```

### `User` Model (`models/user_model.py`)
Represents a user of the application.

```python
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id"))

    college = relationship("College", back_populates="users") # Many-to-One relationship with College
    created_at = Column(DateTime, default=datetime.utcnow)
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan") # One-to-One relationship with Profile
```

### `Profile` Model (`models/profile_model.py`)
Stores additional user-specific details, with JSONB for flexible data.

```python
class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    username = Column(String, unique=True, index=True, nullable=True)
    phone_number = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    year_of_study = Column(String, nullable=True)
    reviews = Column(JSONB, nullable=True) # e.g., {"communication": 5, "punctuality": 4}
    preferences = Column(JSONB, nullable=True) # e.g., {"allow_smoking": false, "preferred_music": "pop"}
    social_media_links = Column(JSONB, nullable=True) # e.g., {"linkedin": "url", "twitter": "url"}
    emergency_contact = Column(JSONB, nullable=True) # e.g., {"name": "Jane Doe", "phone": "1234567890"}

    user = relationship("User", back_populates="profile") # One-to-One relationship with User
```

### `PoolingRequestStatus` Enum (`models/pooling_model.py`)
Defines the possible statuses for a pooling request.

```python
class PoolingRequestStatus(str, enum.Enum):
    ACTIVE = "active"
    MATCHED = "matched"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
```

### `PoolingRequest` Model (`models/pooling_model.py`)
Represents a request for shared transportation.

```python
class PoolingRequest(Base):
    __tablename__ = "pooling_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(PoolingRequestStatus), default=PoolingRequestStatus.ACTIVE, nullable=False)

    start_latitude = Column(Float, nullable=False)
    start_longitude = Column(Float, nullable=False)

    destination_latitude = Column(Float, nullable=False)
    destination_longitude = Column(Float, nullable=False)
    destination_name = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    user = relationship("User") # Many-to-One relationship with User
```

### `ServiceStatus` Enum (`models/service_model.py`)
Defines the possible statuses for a service post.

```python
class ServiceStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
```

### `ServicePost` Model (`models/service_model.py`)
Represents a post for a service offered or requested.

```python
class ServicePost(Base):
    __tablename__ = "service_posts"

    id = Column(Integer, primary_key=True, index=True)
    poster_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    
    status = Column(SQLAlchemyEnum(ServiceStatus), default=ServiceStatus.OPEN, nullable=False)
    is_paid = Column(Boolean, default=False, nullable=False)
    price = Column(Float, nullable=True) # Can be null if not paid

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    poster = relationship("User") # Many-to-One relationship with User
    requirements = relationship("ServiceRequirement", back_populates="service_post", cascade="all, delete-orphan")
    filters = relationship("ServiceFilter", back_populates="service_post", cascade="all, delete-orphan")
```

### `ServiceRequirement` Model (`models/service_model.py`)
Represents a specific requirement for a service post.

```python
class ServiceRequirement(Base):
    __tablename__ = "service_requirements"

    id = Column(Integer, primary_key=True, index=True)
    service_post_id = Column(Integer, ForeignKey("service_posts.id"), nullable=False)
    requirement = Column(String(255), nullable=False)

    service_post = relationship("ServicePost", back_populates="requirements") # Many-to-One relationship with ServicePost
```

### `ServiceFilter` Model (`models/service_model.py`)
Represents a filter criterion for a service post. (Truncated in provided code, needs to be completed based on full `service_model.py`)

```python
class ServiceFilter(Base):
    __tablename__ = "service_filters"
    
    id = Column(Integer, primary_key=True, index=True)
    service_post_id = Column(Integer, ForeignKey("service_posts.id"), nullable=False)
    # ... additional filter fields would go here
    service_post = relationship("ServicePost", back_populates="filters")
```
