# backend/app/services/message_service.py

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_
from typing import List
from fastapi import HTTPException
from datetime import datetime

from app.models import user_model, message_model, pooling_model
from app.schemas import message_schema

def create_message(
    db: Session,
    sender: user_model.User,
    message_data: message_schema.MessageCreate
) -> message_model.Message:
    """
    Create a new chat message.
    Validates that the sender is part of the connection.
    """
    # Verify the connection exists and user is part of it
    connection = db.query(pooling_model.PoolingConnection).options(
        joinedload(pooling_model.PoolingConnection.sender_request),
        joinedload(pooling_model.PoolingConnection.receiver_request)
    ).filter(
        pooling_model.PoolingConnection.id == message_data.connection_id,
        pooling_model.PoolingConnection.status == pooling_model.PoolingConnectionStatus.APPROVED
    ).first()
    
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found or not approved")
    
    # Check if sender is part of this connection
    sender_request = db.query(pooling_model.PoolingRequest).filter(
        pooling_model.PoolingRequest.user_id == sender.id,
        or_(
            pooling_model.PoolingRequest.id == connection.sender_request_id,
            pooling_model.PoolingRequest.id == connection.receiver_request_id
        )
    ).first()
    
    if not sender_request:
        raise HTTPException(status_code=403, detail="You are not part of this connection")
    
    # Create message
    message = message_model.Message(
        connection_id=message_data.connection_id,
        sender_id=sender.id,
        content=message_data.content,
        created_at=datetime.utcnow()
    )
    
    db.add(message)
    db.commit()
    db.refresh(message)
    
    return message


def get_messages_for_connection(
    db: Session,
    user: user_model.User,
    connection_id: int,
    limit: int = 100
) -> List[message_model.Message]:
    """
    Get all messages for a connection.
    Validates that the user is part of the connection.
    """
    # Verify the connection exists and user is part of it
    connection = db.query(pooling_model.PoolingConnection).options(
        joinedload(pooling_model.PoolingConnection.sender_request),
        joinedload(pooling_model.PoolingConnection.receiver_request)
    ).filter(
        pooling_model.PoolingConnection.id == connection_id
    ).first()
    
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    # Check if user is part of this connection
    user_request = db.query(pooling_model.PoolingRequest).filter(
        pooling_model.PoolingRequest.user_id == user.id,
        or_(
            pooling_model.PoolingRequest.id == connection.sender_request_id,
            pooling_model.PoolingRequest.id == connection.receiver_request_id
        )
    ).first()
    
    if not user_request:
        raise HTTPException(status_code=403, detail="You are not part of this connection")
    
    # Get messages
    messages = db.query(message_model.Message).options(
        joinedload(message_model.Message.sender)
    ).filter(
        message_model.Message.connection_id == connection_id
    ).order_by(
        message_model.Message.created_at.asc()
    ).limit(limit).all()
    
    # Mark messages as read
    db.query(message_model.Message).filter(
        message_model.Message.connection_id == connection_id,
        message_model.Message.sender_id != user.id,
        message_model.Message.is_read == False
    ).update({"is_read": True})
    db.commit()
    
    return messages


def mark_messages_as_read(
    db: Session,
    user: user_model.User,
    connection_id: int
) -> int:
    """
    Mark all messages from the other user as read.
    Returns the count of messages marked.
    """
    count = db.query(message_model.Message).filter(
        message_model.Message.connection_id == connection_id,
        message_model.Message.sender_id != user.id,
        message_model.Message.is_read == False
    ).update({"is_read": True})
    db.commit()
    
    return count


def get_recent_conversations(
    db: Session,
    user: user_model.User
):
    """
    Get all recent conversations for a user with the last message and unread count.
    Returns connections where user is involved with their latest message.
    """
    # Get all connections for this user
    user_requests = db.query(pooling_model.PoolingRequest).filter(
        pooling_model.PoolingRequest.user_id == user.id
    ).all()
    
    request_ids = [req.id for req in user_requests]
    
    # Get approved connections where user is involved
    connections = db.query(pooling_model.PoolingConnection).options(
        joinedload(pooling_model.PoolingConnection.sender_request).joinedload(pooling_model.PoolingRequest.user).joinedload(user_model.User.profile),
        joinedload(pooling_model.PoolingConnection.receiver_request).joinedload(pooling_model.PoolingRequest.user).joinedload(user_model.User.profile)
    ).filter(
        pooling_model.PoolingConnection.status == pooling_model.PoolingConnectionStatus.APPROVED,
        or_(
            pooling_model.PoolingConnection.sender_request_id.in_(request_ids),
            pooling_model.PoolingConnection.receiver_request_id.in_(request_ids)
        )
    ).all()
    
    result = []
    for conn in connections:
        # Get the partner (the other user in the connection)
        if conn.sender_request.user_id == user.id:
            partner = conn.receiver_request.user
            partner_request_id = conn.receiver_request_id
        else:
            partner = conn.sender_request.user
            partner_request_id = conn.sender_request_id
        
        # Get last message for this connection
        last_message = db.query(message_model.Message).filter(
            message_model.Message.connection_id == conn.id
        ).order_by(
            message_model.Message.created_at.desc()
        ).first()
        
        # Count unread messages from partner
        unread_count = db.query(message_model.Message).filter(
            message_model.Message.connection_id == conn.id,
            message_model.Message.sender_id == partner.id,
            message_model.Message.is_read == False
        ).count()
        
        result.append({
            "connection_id": conn.id,
            "partner": {
                "id": partner.id,
                "full_name": partner.full_name,
                "phone_number": partner.profile.phone_number if partner.profile else None,
                "email": partner.email,
                "year_of_study": partner.profile.year_of_study if partner.profile else None,
                "bio": partner.profile.bio if partner.profile else None,
                "request_id": partner_request_id
            },
            "last_message": {
                "content": last_message.content if last_message else None,
                "created_at": last_message.created_at.isoformat() if last_message else None,
                "sender_id": last_message.sender_id if last_message else None
            } if last_message else None,
            "unread_count": unread_count
        })
    
    # Sort by last message time (most recent first)
    result.sort(key=lambda x: x["last_message"]["created_at"] if x["last_message"] else "", reverse=True)
    
    return result
