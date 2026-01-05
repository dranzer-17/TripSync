# backend/app/schemas/pooling_schema.py

from pydantic import BaseModel
from typing import Optional
from datetime import datetime

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
    email: Optional[str] = None
    year_of_study: Optional[str] = None
    bio: Optional[str] = None
    
    # Connection info
    request_id: int
    connection_status: Optional[str] = "none"  # none, pending_sent, pending_received, approved, rejected
    connection_id: Optional[int] = None
    
    class Config:
        from_attributes = True

# This will be the main response for a successful match search
class PoolingMatchResponse(BaseModel):
    request_id: int
    matches: list[MatchedUser]


# Connection request/response schemas
class ConnectionRequest(BaseModel):
    target_request_id: int


class ConnectionResponse(BaseModel):
    action: str  # "approve" or "reject"


class ConnectionInfo(BaseModel):
    id: int
    sender_request_id: int
    receiver_request_id: int
    status: str
    created_at: datetime
    responded_at: Optional[datetime] = None
    
    # Include user info
    sender_user: MatchedUser
    receiver_user: MatchedUser
    
    class Config:
        from_attributes = True