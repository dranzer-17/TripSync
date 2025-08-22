# backend/app/models/profile_model.py

from sqlalchemy import Column, LargeBinary, String, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB # Use JSONB for flexible data like reviews/preferences

from app.db.database import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    username = Column(String, unique=True, index=True, nullable=True)
    
    # --- ADDED YOUR REQUESTED FIELDS ---
    phone_number = Column(String, nullable=True)
    
    # Using Text for a potentially long biography
    bio = Column(Text, nullable=True) 
    
    year_of_study = Column(String, nullable=True)
    
    # Using JSONB is perfect for storing lists of reviews or key-value preferences.
    # It's flexible and you don't need to define the exact structure in advance.
    # For example: {"communication": 5, "punctuality": 4}
    reviews = Column(JSONB, nullable=True)
    
    # For example: {"allow_smoking": false, "preferred_music": "pop"}
    preferences = Column(JSONB, nullable=True)


    # You also mentioned Social Media and Emergency Contact. Let's add those too.
    # For example: {"linkedin": "url", "twitter": "url"}
    social_media_links = Column(JSONB, nullable=True)
    
    # For example: {"name": "Jane Doe", "phone": "1234567890"}
    emergency_contact = Column(JSONB, nullable=True)
    # ------------------------------------
    
    user = relationship("User", back_populates="profile")