# Backend Data Models

The `TripSync` backend uses SQLAlchemy ORM models to define the structure of its database tables. These models are inherited from `app.db.database.Base`.

## User and College Models

### `College`
Represents a college, which users can be associated with.

```python
# backend/app/models/user_model.py
from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import relationship
from app.db.database import Base

class College(Base):
    __tablename__ = "colleges"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    users = relationship("User", back_populates="college")
```

### `User`
Represents a user account in the system.

```python
# backend/app/models/user_model.py
from sqlalchemy import Column, String, ForeignKey, DateTime, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id"))
    college = relationship("College", back_populates="users")
    created_at = Column(DateTime, default=datetime.utcnow)
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
```

## Profile Model

### `Profile`
Stores additional user-specific details, linked in a one-to-one relationship with `User`.

```python
# backend/app/models/profile_model.py
from sqlalchemy import Column, String, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from app.db.database import Base

class Profile(Base):
    __tablename__ = "profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=True)
    phone_number = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    year_of_study = Column(String, nullable=True)
    reviews = Column(JSONB, nullable=True)
    preferences = Column(JSONB, nullable=True)
    social_media_links = Column(JSONB, nullable=True)
    emergency_contact = Column(JSONB, nullable=True)
    user = relationship("User", back_populates="profile")
```

## Pooling Request Model

### `PoolingRequest`
Manages requests for ride-sharing or pooling services, including status and location details.

```python
# backend/app/models/pooling_model.py
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, DateTime, Integer, Float, Enum
from sqlalchemy.orm import relationship
import enum
from app.db.database import Base

class PoolingRequestStatus(str, enum.Enum):
    ACTIVE = "active"
    MATCHED = "matched"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

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
    user = relationship("User")
```

## Service Models

### `ServiceStatus` `Enum`
Defines the possible statuses for a service post.

```python
# backend/app/models/service_model.py
import enum
class ServiceStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
```

### `ServicePost`
Represents a posted service (e.g., offering a ride, requesting help).

```python
# backend/app/models/service_model.py
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, DateTime, Integer, Text, Float, Boolean, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship
from app.db.database import Base

class ServicePost(Base):
    __tablename__ = "service_posts"
    id = Column(Integer, primary_key=True, index=True)
    poster_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(SQLAlchemyEnum(ServiceStatus), default=ServiceStatus.OPEN, nullable=False)
    is_paid = Column(Boolean, default=False, nullable=False)
    price = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    poster = relationship("User")
    requirements = relationship("ServiceRequirement", back_populates="service_post", cascade="all, delete-orphan")
    filters = relationship("ServiceFilter", back_populates="service_post", cascade="all, delete-orphan")
```

### `ServiceRequirement`
Details specific requirements for a `ServicePost`.

```python
# backend/app/models/service_model.py
from sqlalchemy import Column, String, ForeignKey, Integer
from sqlalchemy.orm import relationship
from app.db.database import Base

class ServiceRequirement(Base):
    __tablename__ = "service_requirements"
    id = Column(Integer, primary_key=True, index=True)
    service_post_id = Column(Integer, ForeignKey("service_posts.id"), nullable=False)
    requirement = Column(String(255), nullable=False)
    service_post = relationship("ServicePost", back_populates="requirements")
```

### `ServiceFilter`
Provides filtering criteria for a `ServicePost` (content omitted, general structure provided).

```python
# backend/app/models/service_model.py # Truncated content for ServiceFilter in diff
from sqlalchemy import Column, String, ForeignKey, Integer
from sqlalchemy.orm import relationship
from app.db.database import Base

class ServiceFilter(Base):
    __tablename__ = "service_filters"
    id = Column(Integer, primary_key=True, index=True)
    service_post_id = Column(Integer, ForeignKey("service_posts.id"), nullable=False)
    # ... additional filter fields
    service_post = relationship("ServicePost", back_populates="filters")
```

This comprehensive set of models forms the backbone of the TripSync application's data storage.