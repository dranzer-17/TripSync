# backend/app/models/service_model.py

from datetime import datetime
from sqlalchemy import (Column, String, ForeignKey, DateTime, Integer, Text, 
                        Float, Boolean, Enum as SQLAlchemyEnum, Table)
from sqlalchemy.orm import relationship
import enum

from app.db.database import Base

class CompensationType(str, enum.Enum):
    VOLUNTEER = "volunteer"
    FIXED_PRICE = "fixed_price"
    HOURLY_RATE = "hourly_rate"
    NEGOTIABLE = "negotiable"

class ApplicationStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"

class ServiceStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

service_post_tags = Table('service_post_tags', Base.metadata,
    Column('service_post_id', Integer, ForeignKey('service_posts.id'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id'), primary_key=True)
)

class Tag(Base):
    __tablename__ = "tags"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True, nullable=False)

class ServicePost(Base):
    __tablename__ = "service_posts"

    id = Column(Integer, primary_key=True, index=True)
    poster_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(SQLAlchemyEnum(ServiceStatus), default=ServiceStatus.OPEN, nullable=False)
    
    team_size = Column(Integer, default=1, nullable=False)
    deadline = Column(DateTime, nullable=True)
    compensation_type = Column(SQLAlchemyEnum(CompensationType), nullable=False)
    compensation_amount = Column(Float, nullable=True)
    requires_resume = Column(Boolean, default=False, nullable=False)
    requires_cover_letter = Column(Boolean, default=False, nullable=False)
    is_anonymous = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # --- THIS IS THE FIX ---
    # The old 'requirements' and 'filters' relationships are now completely removed.
    poster = relationship("User")
    tags = relationship("Tag", secondary=service_post_tags, backref="service_posts")
    applications = relationship("ServiceApplication", back_populates="service_post", cascade="all, delete-orphan")
    reviews = relationship("ServiceReview", back_populates="service_post", cascade="all, delete-orphan")

# --- We no longer need the old ServiceRequirement and ServiceFilter models, ---
# --- but we keep the Application and Review models. ---

class ServiceApplication(Base):
    __tablename__ = "service_applications"
    id = Column(Integer, primary_key=True, index=True)
    service_post_id = Column(Integer, ForeignKey("service_posts.id"), nullable=False)
    applicant_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    status = Column(SQLAlchemyEnum(ApplicationStatus), default=ApplicationStatus.PENDING, nullable=False)
    cover_letter = Column(Text, nullable=True)
    resume_url = Column(String, nullable=True)
    proposed_rate = Column(Float, nullable=True)

    application_date = Column(DateTime, default=datetime.utcnow, nullable=False)

    service_post = relationship("ServicePost", back_populates="applications")
    applicant = relationship("User")

class ServiceReview(Base):
    __tablename__ = "service_reviews"
    id = Column(Integer, primary_key=True, index=True)
    service_post_id = Column(Integer, ForeignKey("service_posts.id"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reviewee_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    service_post = relationship("ServicePost", back_populates="reviews")
    reviewer = relationship("User", foreign_keys=[reviewer_id])
    reviewee = relationship("User", foreign_keys=[reviewee_id])