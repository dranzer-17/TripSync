# backend/app/schemas/message_schema.py

from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class MessageCreate(BaseModel):
    connection_id: int
    content: str

class Message(BaseModel):
    id: int
    connection_id: int
    sender_id: int
    sender_name: str
    content: str
    created_at: datetime
    is_read: bool

    class Config:
        from_attributes = True

class MessageListResponse(BaseModel):
    messages: list[Message]
