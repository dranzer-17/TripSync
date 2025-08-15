# backend/app/users/user_models.py

import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime

from app.db.database import Base

class College(Base):
    __tablename__ = "colleges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, index=True, nullable=False)
    
    # This creates a 'users' attribute on College instances
    users = relationship("User", back_populates="college")

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, index=True)
    
    # Foreign Key to link User to a College
    college_id = Column(UUID(as_uuid=True), ForeignKey("colleges.id"))
    
    # This creates a 'college' attribute on User instances
    college = relationship("College", back_populates="users")
    
    created_at = Column(DateTime, default=datetime.utcnow)