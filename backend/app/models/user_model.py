# backend/app/models/user_model.py

# --- REMOVE THIS IMPORT ---
# import uuid

# --- CHANGE THESE IMPORTS ---
from sqlalchemy import Column, String, ForeignKey, DateTime, Integer # Add Integer
from sqlalchemy.orm import relationship
# --- REMOVE THIS IMPORT ---
# from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime

from app.db.database import Base

class College(Base):
    __tablename__ = "colleges"

    # --- CHANGE THIS BLOCK ---
    id = Column(Integer, primary_key=True, index=True)
    # -------------------------
    name = Column(String, unique=True, index=True, nullable=False)
    users = relationship("User", back_populates="college")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id"))
    
    # --- REMOVE THESE OLD COLUMNS ---
    # profile_image_url = Column(String, nullable=True)
    # phone_number = Column(String, nullable=True)
    # --------------------------------

    college = relationship("College", back_populates="users")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # --- ADD THIS NEW RELATIONSHIP ---
    # This links a User to their Profile. `uselist=False` makes it a one-to-one relationship.
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    # ---------------------------------