# backend/app/routes/message_router.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.services import auth_service, message_service
from app.schemas import message_schema
from app.models import user_model

router = APIRouter()

@router.post("/messages", response_model=message_schema.Message)
async def send_message(
    message_data: message_schema.MessageCreate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth_service.get_current_user),
):
    """
    Send a chat message in a connection.
    """
    message = message_service.create_message(
        db=db,
        sender=current_user,
        message_data=message_data
    )
    
    return message_schema.Message(
        id=message.id,
        connection_id=message.connection_id,
        sender_id=message.sender_id,
        sender_name=current_user.full_name,
        content=message.content,
        created_at=message.created_at,
        is_read=message.is_read
    )


@router.get("/messages/{connection_id}", response_model=message_schema.MessageListResponse)
async def get_messages(
    connection_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth_service.get_current_user),
):
    """
    Get all messages for a connection.
    """
    messages = message_service.get_messages_for_connection(
        db=db,
        user=current_user,
        connection_id=connection_id
    )
    
    message_list = [
        message_schema.Message(
            id=msg.id,
            connection_id=msg.connection_id,
            sender_id=msg.sender_id,
            sender_name=msg.sender.full_name,
            content=msg.content,
            created_at=msg.created_at,
            is_read=msg.is_read
        )
        for msg in messages
    ]
    
    return message_schema.MessageListResponse(messages=message_list)


@router.post("/messages/{connection_id}/read")
async def mark_messages_read(
    connection_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth_service.get_current_user),
):
    """
    Mark all messages in a connection as read.
    """
    count = message_service.mark_messages_as_read(
        db=db,
        user=current_user,
        connection_id=connection_id
    )
    
    return {"marked_read": count}


@router.get("/conversations")
async def get_recent_conversations(
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(auth_service.get_current_user),
):
    """
    Get all recent conversations for the current user.
    Returns connections with last message and unread count.
    """
    conversations = message_service.get_recent_conversations(
        db=db,
        user=current_user
    )
    
    return {"conversations": conversations}
