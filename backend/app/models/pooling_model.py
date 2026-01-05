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
    CONNECTED = "connected"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class PoolingConnectionStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


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
    
    # Relationships for connections
    sent_connections = relationship("PoolingConnection", foreign_keys="PoolingConnection.sender_request_id", back_populates="sender_request")
    received_connections = relationship("PoolingConnection", foreign_keys="PoolingConnection.receiver_request_id", back_populates="receiver_request")


class PoolingConnection(Base):
    __tablename__ = "pooling_connections"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_request_id = Column(Integer, ForeignKey("pooling_requests.id"), nullable=False)
    receiver_request_id = Column(Integer, ForeignKey("pooling_requests.id"), nullable=False)
    status = Column(Enum(PoolingConnectionStatus), default=PoolingConnectionStatus.PENDING, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    responded_at = Column(DateTime, nullable=True)
    
    # Relationships
    sender_request = relationship("PoolingRequest", foreign_keys=[sender_request_id], back_populates="sent_connections")
    receiver_request = relationship("PoolingRequest", foreign_keys=[receiver_request_id], back_populates="received_connections")