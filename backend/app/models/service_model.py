# backend/app/models/service_model.py

from datetime import datetime
from sqlalchemy import (Column, String, ForeignKey, DateTime, Integer, Text, 
                        Float, Boolean, Enum as SQLAlchemyEnum)
from sqlalchemy.orm import relationship
import enum

from app.db.database import Base

class ServiceStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

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
    
    # Relationships
    poster = relationship("User")
    requirements = relationship("ServiceRequirement", back_populates="service_post", cascade="all, delete-orphan")
    filters = relationship("ServiceFilter", back_populates="service_post", cascade="all, delete-orphan")

class ServiceRequirement(Base):
    __tablename__ = "service_requirements"

    id = Column(Integer, primary_key=True, index=True)
    service_post_id = Column(Integer, ForeignKey("service_posts.id"), nullable=False)
    requirement = Column(String(255), nullable=False)

    service_post = relationship("ServicePost", back_populates="requirements")

class ServiceFilter(Base):
    __tablename__ = "service_filters"
    
    id = Column(Integer, primary_key=True, index=True)
    service_post_id = Column(Integer, ForeignKey("service_posts.id"), nullable=False)
    
    # e.g., "year_of_study", "major", etc.
    filter_type = Column(String(50), nullable=False)
    # e.g., "1st Year", "Computer Science", etc.
    filter_value = Column(String(100), nullable=False)

    service_post = relationship("ServicePost", back_populates="filters")