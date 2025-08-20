# backend/app/models/pooling_model.py

from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, DateTime, Integer, Float, Enum
from sqlalchemy.orm import relationship
import enum

from app.db.database import Base

# An Enum provides type-safety and consistency for the status field
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

    # Starting location coordinates
    start_latitude = Column(Float, nullable=False)
    start_longitude = Column(Float, nullable=False)

    # Destination location coordinates
    destination_latitude = Column(Float, nullable=False)
    destination_longitude = Column(Float, nullable=False)
    destination_name = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # This relationship allows us to easily access user info from a request
    user = relationship("User")