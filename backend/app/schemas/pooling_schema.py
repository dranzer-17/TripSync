# backend/app/schemas/pooling_schema.py

from pydantic import BaseModel
from typing import Optional

# This is the data the frontend will send to create a request
class PoolingRequestCreate(BaseModel):
    start_latitude: float
    start_longitude: float
    destination_latitude: float
    destination_longitude: float
    destination_name: Optional[str] = None

# This defines the user data we send back in a match list
class MatchedUser(BaseModel):
    id: int
    full_name: str
    phone_number: Optional[str] = None
    profile_image_url: Optional[str] = None
    
    class Config:
        from_attributes = True

# This will be the main response for a successful match search
class PoolingMatchResponse(BaseModel):
    request_id: int
    matches: list[MatchedUser]