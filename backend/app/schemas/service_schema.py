# backend/app/schemas/service_schema.py

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# --- Sub-Schemas ---

class ProfileBase(BaseModel):
    """A simple schema to represent the user who posted a service."""
    full_name: str
    profile_image_url: Optional[str] = None # We will add this back later

    class Config:
        from_attributes = True


# --- Input Schemas ---

class ServicePostCreate(BaseModel):
    """This is the data the frontend will send to create a new service post."""
    title: str = Field(..., min_length=5, max_length=100)
    description: str = Field(..., min_length=5)
    is_paid: bool = False
    price: Optional[float] = Field(None, gt=0) # Price must be greater than 0 if provided

    # A simple list of strings for requirements and filters for the MVP
    requirements: List[str] = []
    filters: List[dict] = [] # e.g., [{"type": "year_of_study", "value": "2nd Year"}]


# --- Output Schemas ---

class ServicePostBase(BaseModel):
    """Defines the core fields for displaying a service post."""
    id: int
    title: str
    poster_user_id: int 
    is_paid: bool
    price: Optional[float] = None
    status: str # We'll use the string value of the enum
    created_at: datetime
    poster: ProfileBase

    class Config:
        from_attributes = True


class ServicePostList(ServicePostBase):
    """A compact version for displaying in a list."""
    # This inherits all fields from ServicePostBase
    # We could add a truncated description here in the future if needed
    pass


class ServicePostDetail(ServicePostBase):
    """The full, detailed view of a service post."""
    description: str
    requirements: List[str]
    filters: List[dict]
    
    # We can add more fields here like 'accepted_by_user', etc. in the future